from datetime import datetime

def truncate(text: str | None, limit: int) -> str | None:
    if not text:
        return None
    return (text[:limit] + '...') if len(text) > limit else text

def map_basic_search(trial_json: dict) -> dict:
    protocol = trial_json.get("protocolSection", {})

    # --- Identification ---
    ident = protocol.get("identificationModule", {})
    nct_id = ident.get("nctId")
    title = ident.get("briefTitle")
    org = ident.get("organization", {}).get("fullName")

    # --- Status & phases ---
    status = protocol.get("statusModule", {}).get("overallStatus", "UNKNOWN")
    phases = protocol.get("designModule", {}).get("phases", [])
    if not phases:
        phases = ["Not Specified"]

    # --- Conditions ---
    conditions = protocol.get("conditionsModule", {}).get("conditions", [])
    if not conditions:
        conditions = ["No Conditions Listed"]

    # --- Interventions ---
    interventions = protocol.get("armsInterventionsModule", {}).get("interventions", [])
    intervention_names = [
        item.get("name") for item in interventions 
        if item.get("name")
    ]
    if not intervention_names:
        intervention_names = ["No interventions listed"]


    return {
        "nct_id": nct_id,
        "title": title,
        "organization": org,
        "status": status,
        "conditions": conditions,
        "interventions": intervention_names,
        "phases": phases
    } 


def extract_trial_data(trial_json: dict) -> dict:
    """Maps ClinicalTrials.gov API JSON to database schema dictionary."""
    protocol = trial_json.get("protocolSection", {})
    results = trial_json.get("resultsSection", {})
    
    # --- Modules ---
    ident_mod = protocol.get("identificationModule", {})
    status_mod = protocol.get("statusModule", {})
    design_mod = protocol.get("designModule", {})
    cond_mod = protocol.get("conditionsModule", {})
    arms_mod = protocol.get("armsInterventionsModule", {})

    # --- ORGANIZATION ---
    raw_org = ident_mod.get("organization", {}).get("fullName", "N/A")
    org_name = truncate(raw_org, 50)

    # --- STATUS & DATES ---
    status_base = status_mod.get("overallStatus", "UNKNOWN")
    comp_date = status_mod.get("completionDateStruct", {}).get("date", "")
    status_str = f"{status_base} ({comp_date})" if comp_date else status_base
    
    # [FIX] Parse last_updated to satisfy Model
    date_str = status_mod.get("lastUpdatePostDateStruct", {}).get("date")
    last_updated_dt = datetime.now()
    if date_str:
        try:
            last_updated_dt = datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            pass

    # --- SAFETY ---
    safety_str = "No Results Posted"
    if results:
        adverse = results.get("adverseEventsModule", {})
        serious_events = adverse.get("seriousEvents", [])
        
        if serious_events:
            terms = list(set([e.get("term", "Unknown") for e in serious_events]))
            terms_str = ", ".join(terms[:5])
            if len(terms) > 5:
                terms_str += f", +{len(terms)-5} more"
            safety_str = f"Serious Events: {terms_str}"
        elif adverse.get("eventGroups"):
            total_serious = 0
            total_at_risk = 0
            for group in adverse.get("eventGroups", []):
                total_serious += int(group.get("seriousNumAffected", 0) or 0)
                total_at_risk += int(group.get("seriousNumAtRisk", 0) or 0)
            
            if total_at_risk > 0:
                pct = round((total_serious / total_at_risk) * 100, 1)
                safety_str = f"SAE Rate: {pct}% (No specific terms listed)"
            else:
                safety_str = "Safety Data Present (No Stats)"
        else:
             safety_str = "No Safety Issues Reported"

    # --- EFFICACY ---
    efficacy_str = "No Results Posted"
    if results:
        outcomes = results.get("outcomeMeasuresModule", {}).get("outcomeMeasures", [])
        primary_outcomes = [o for o in outcomes if o.get("type") == "PRIMARY"]
        
        outcome_summaries = []
        for outcome in primary_outcomes:
            title = outcome.get("title", "Primary Outcome")
            group_map = {g.get("id"): g.get("title", "Group") for g in outcome.get("groups", [])}
            
            measurements = []
            classes = outcome.get("classes", [])
            if classes and classes[0].get("categories"):
                raw_measures = classes[0]["categories"][0].get("measurements", [])
                for m in raw_measures:
                    g_id = m.get("groupId")
                    val = m.get("value")
                    if g_id and val:
                        g_name = group_map.get(g_id, g_id)
                        measurements.append(f"{g_name}: {val}")
            
            p_val = None
            for analysis in outcome.get("analyses", []):
                p_val = analysis.get("pValue")
                if p_val: break 
            
            measure_str = " vs ".join(measurements) if measurements else "No data values"
            p_str = f"(p={p_val})" if p_val else ""
            outcome_summaries.append(f"[{title}] {measure_str} {p_str}")

        if outcome_summaries:
            efficacy_str = " || ".join(outcome_summaries)
        elif outcomes:
            efficacy_str = "Results available (Parsing Skipped)"

    # --- STANDARD FIELDS ---
    conditions = cond_mod.get("conditions", [])
    condition_str = ", ".join(conditions) if conditions else "N/A"
    
    interventions = arms_mod.get("interventions", [])
    intervention_list = []
    for item in interventions:
        name = item.get("name")
        type = item.get("type")
        if name and type:
            intervention_list.append(f"{name} ({type})")
        elif name:
            intervention_list.append(name)

    return {
        "nct_id": ident_mod.get("nctId"),
        "title": truncate(ident_mod.get("briefTitle"), 75),
        "organization": org_name,
        "status": status_str,
        "last_updated": last_updated_dt,
        "conditions": condition_str,
        "interventions": ", ".join(intervention_list) if intervention_list else "None",
        "design": design_mod.get("studyType", "Type Not Specified"),
        "safety": safety_str,
        "efficacy": efficacy_str,
        "enrollment_count": design_mod.get("enrollmentInfo", {}).get("count"),
        "enrollment_type": design_mod.get("enrollmentInfo", {}).get("type"),
        "phase": ", ".join(design_mod.get("phases", [])) or "Not Specified"
    }