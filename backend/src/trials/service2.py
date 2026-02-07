import httpx
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from sqlmodel import Session
from src.db.models import ClinicalTrial

BASE_URL = "https://clinicaltrials.gov/api/v2/studies"

class TrialService:
    def get_trial(self, session: Session, nct_id: str) -> Optional[ClinicalTrial]:
        """
        Orchestrates the 'Cache vs. Fetch' logic.
        """
        trial = session.get(ClinicalTrial, nct_id)
        should_fetch = False

        if not trial:
            # Case 1: Not in DB -> Fetch & Save
            should_fetch = True
        else:
            # Case 2: In DB but might be stale -> Check time
            # Ensure we compare timezone-aware datetimes
            now = datetime.now(timezone.utc)
            last_updated = trial.last_updated.replace(tzinfo=timezone.utc) if trial.last_updated.tzinfo is None else trial.last_updated
            
            time_difference = now - last_updated
            if time_difference > timedelta(hours=24):
                should_fetch = True
        
        if should_fetch:
            try:
                # Fetch fresh data, update DB, and return the new object
                trial = self.fetch_and_save_trial(session, nct_id)
            except Exception as e:
                print(f"Error fetching from API for {nct_id}: {e}")
                # Graceful degradation: If API fails but we have old data, return it.
                if trial:
                    return trial
                raise e # If we have nothing, re-raise the error

        return trial

    def fetch_and_save_trial(self, session: Session, nct_id: str) -> ClinicalTrial:
        """
        Fetches raw JSON from ClinicalTrials.gov, maps it to our schema, 
        and upserts it into the database.
        """
        response = httpx.get(f"{BASE_URL}/{nct_id}")
        response.raise_for_status()
        data = response.json()

        # Transform the messy API JSON into our clean DB Model
        trial_obj = self._map_api_to_db(data)
        
        # 'merge' handles both INSERT and UPDATE automatically based on Primary Key (nct_id)
        saved_trial = session.merge(trial_obj)
        session.commit()
        session.refresh(saved_trial)
        return saved_trial

    def _map_api_to_db(self, api_data: Dict[str, Any]) -> ClinicalTrial:
        """
        Internal helper to map raw API JSON to the ClinicalTrial SQLModel.
        Focuses on: Identity, Search Keys, Design, Efficacy, and Safety.
        """
        protocol = api_data.get("protocolSection", {})
        results = api_data.get("resultsSection", {})
        
        # --- Modules ---
        id_module = protocol.get("identificationModule", {})
        status_module = protocol.get("statusModule", {})
        design_module = protocol.get("designModule", {})
        outcomes_module = protocol.get("outcomesModule", {})
        conditions_module = protocol.get("conditionsModule", {})
        arms_module = protocol.get("armsInterventionsModule", {})

        # --- 1. Basic Info ---
        trial = ClinicalTrial(
            nct_id=id_module.get("nctId"),
            title=id_module.get("officialTitle") or id_module.get("briefTitle"),
            organization=id_module.get("organization", {}).get("fullName", "Unknown"),
            status=status_module.get("overallStatus", "UNKNOWN"),
            last_updated=datetime.now(timezone.utc),
            raw_json=api_data
        )

        # --- 2. Search Keys ---
        trial.conditions = conditions_module.get("conditions", [])
        
        interventions_list = []
        if "interventions" in arms_module:
            for i in arms_module["interventions"]:
                name = i.get("name")
                if name: interventions_list.append(name)
        trial.interventions = interventions_list

        # --- 3. Trial Design ---
        trial.phases = design_module.get("phases", ["N/A"])
        trial.study_type = design_module.get("studyType")
        trial.enrollment = design_module.get("enrollmentInfo", {}).get("count")
        
        design_info = design_module.get("designInfo", {})
        trial.design_details = {
            "allocation": design_info.get("allocation"),
            "masking": design_info.get("maskingInfo", {}).get("masking"),
            "model": design_info.get("interventionModel")
        }

        # --- 4. Efficacy (Primary Outcomes) ---
        extracted_outcomes = []
        for outcome in outcomes_module.get("primaryOutcomes", []):
            extracted_outcomes.append({
                "measure": outcome.get("measure"),
                "time_frame": outcome.get("timeFrame"),
                "description": outcome.get("description")
            })
        trial.primary_outcomes = extracted_outcomes

        # --- 5. Efficacy Results (P-Values) ---
        efficacy_summary = []
        if "outcomeMeasuresModule" in results:
            for measure in results["outcomeMeasuresModule"].get("outcomeMeasures", []):
                if measure.get("type") == "PRIMARY":
                    analyses = measure.get("analyses", [])
                    analysis_data = []
                    for analysis in analyses:
                        analysis_data.append({
                            "p_value": analysis.get("pValue"),
                            "method": analysis.get("statisticalMethod"),
                            "param_value": analysis.get("paramValue")
                        })
                    
                    # Try to grab the first measurement value if available
                    result_val = "N/A"
                    try:
                        result_val = measure.get("classes", [{}])[0].get("categories", [{}])[0].get("measurements", [])
                    except (IndexError, AttributeError):
                        pass

                    efficacy_summary.append({
                        "measure": measure.get("title"),
                        "result_value": result_val,
                        "statistical_analyses": analysis_data
                    })
        trial.efficacy_result_summary = efficacy_summary

        # --- 6. Safety Summary ---
        safety_summary = {"has_safety_data": False}
        if "adverseEventsModule" in results:
            ae_module = results["adverseEventsModule"]
            event_groups = ae_module.get("eventGroups", [])
            
            total_serious = 0
            total_at_risk = 0
            for group in event_groups:
                total_serious += int(group.get("seriousNumAffected", 0) or 0)
                total_at_risk += int(group.get("seriousNumAtRisk", 0) or 0)

            serious_terms = [e.get("term") for e in ae_module.get("seriousEvents", [])[:3]]

            safety_summary = {
                "has_safety_data": True,
                "total_serious_adverse_events": total_serious,
                "total_participants_at_risk": total_at_risk,
                "top_serious_events": serious_terms
            }
        
        trial.safety_summary = safety_summary

        return trial