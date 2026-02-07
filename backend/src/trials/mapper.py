def truncate(text: str | None, limit: int) -> str | None:
    if not text:
        return None
    return (text[:limit] + '...') if len(text) > limit else text

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

    # --- DESIGN ---
    design_str = design_mod.get("studyType", "Type Not Specified")

    # --- SAFETY ---
    safety_str = "No Safety Data"
    adverse = results.get("adverseEventsModule", {})
    
    if adverse:
        event_groups = adverse.get("eventGroups", [])
        total_serious = 0
        total_at_risk = 0
        
        for group in event_groups:
            serious = group.get("seriousNumAffected", 0)
            at_risk = group.get("seriousNumAtRisk", 0)
            if serious is not None: total_serious += serious
            if at_risk is not None: total_at_risk += at_risk
            
        if total_at_risk > 0:
            pct = round((total_serious / total_at_risk) * 100, 1)
            safety_str = f"SAE: {pct}%"
        else:
            safety_str = "Data Present"

    # --- EFFICACY ---
    p_value_list = []
    if results:
        for outcome in results.get("outcomeMeasuresModule", {}).get("outcomeMeasures", []):
            if outcome.get("type") == "PRIMARY":
                title = truncate(outcome.get("title", "Outcome"), 50)
                
                for analysis in outcome.get("analyses", []):
                    p_val = analysis.get("pValue")
                    if p_val:
                        p_value_list.append(f"{title} (p={p_val})")

    p_values_str = " || ".join(p_value_list) if p_value_list else "No P-Values"

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
        "status": status_mod.get("overallStatus"),
        "conditions": condition_str,
        "interventions": ", ".join(intervention_list) if intervention_list else "None",
        "design": design_str,
        "safety": safety_str,
        "p_values": p_values_str,
        "enrollment_count": design_mod.get("enrollmentInfo", {}).get("count"),
        "enrollment_type": design_mod.get("enrollmentInfo", {}).get("type"),
        "phase": ", ".join(design_mod.get("phases", [])) or "Not Specified"
    }