import httpx
from datetime import datetime, timezone, timedelta
from sqlmodel import Session, select
from src.db.models import ClinicalTrial

BASE_URL = "https://clinicaltrials.gov/api/v2/studies"

class TrialService:
    async def get_trial_details(self, nct_id: str, session: Session) -> ClinicalTrial:
        """
        YOUR CUSTOM LOGIC:
        1. Check DB.
        2. If missing -> Fetch API & Save.
        3. If present but 'stale' (>24h old) -> Fetch API & Update.
        4. If present and fresh -> Return DB version.
        """
        # 1. Check DB
        trial = session.get(ClinicalTrial, nct_id)
        
        # Define "Stale" as older than 24 hours
        is_stale = False
        if trial:
            time_since_update = datetime.now(timezone.utc) - trial.last_updated
            if time_since_update > timedelta(hours=24):
                is_stale = True

        # 2. If missing OR stale, fetch from API
        if not trial or is_stale:
            print(f"Fetching fresh data for {nct_id} (Stale: {is_stale})...")
            async with httpx.AsyncClient() as client:
                try:
                    response = await client.get(f"{BASE_URL}/{nct_id}", params={"format": "json"})
                    response.raise_for_status()
                    raw_data = response.json()
                    
                    # 3. Save/Update to DB
                    # The API returns the study wrapped in a few layers, usually just the object itself
                    # We pass the raw protocolSection wrapper
                    trial = self._parse_and_upsert(session, raw_data)
                except httpx.HTTPStatusError:
                    # If API fails but we have old data, return old data (Graceful degradation)
                    if trial:
                        return trial
                    raise

        return trial

    async def search_trials(self, query_term: str, session: Session):
        """
        For SEARCH, we always hit the API to get the most relevant list,
        then we update our cache with what we found.
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                BASE_URL, 
                params={"query.term": query_term, "pageSize": 10, "format": "json"}
            )
            data = response.json()

        studies = data.get("studies", [])
        results = []
        for study_data in studies:
            # We "prime the cache" here. 
            # Next time we request details, it will already be in the DB.
            trial = self._parse_and_upsert(session, study_data)
            results.append(trial)
        
        return results

    def _parse_and_upsert(self, session: Session, raw_data: dict) -> ClinicalTrial:
        protocol = raw_data.get("protocolSection", {})
        ident = protocol.get("identificationModule", {})
        nct_id = ident.get("nctId")
        
        if not nct_id:
            return None

        # Helper to extract fields safely
        status_mod = protocol.get("statusModule", {})
        design = protocol.get("designModule", {})
        cond_module = protocol.get("conditionsModule", {})
        
        phases_list = design.get("phases", [])
        phase_str = ", ".join(phases_list) if phases_list else None

        # Prepare the data object
        update_data = {
            "title": ident.get("briefTitle", "No Title"),
            "organization": ident.get("organization", {}).get("fullName", "Unknown"),
            "status": status_mod.get("overallStatus", "UNKNOWN"),
            "study_type": design.get("studyType"),
            "phase": phase_str,
            "conditions": cond_module.get("conditions", []),
            "study_data": raw_data,
            "last_updated": datetime.now(timezone.utc) # Refreshes the timestamp
        }

        # Check existence
        existing_trial = session.get(ClinicalTrial, nct_id)
        
        if existing_trial:
            # Update fields
            for k, v in update_data.items():
                setattr(existing_trial, k, v)
            session.add(existing_trial)
        else:
            # Create new
            new_trial = ClinicalTrial(nct_id=nct_id, **update_data)
            session.add(new_trial)
            existing_trial = new_trial

        session.commit()
        session.refresh(existing_trial)
        return existing_trial