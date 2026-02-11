from datetime import datetime

def truncate(text: str | None, limit: int) -> str | None:
    if not text:
        return None
    return (text[:limit] + '...') if len(text) > limit else text

def map_basic_search(trial_json: dict) -> dict:
    """
    Lightweight mapping for the list view (Search Cards).
    """
    protocol = trial_json.get("protocolSection", {})

    # --- Identification ---
    ident = protocol.get("identificationModule", {})
    nct_id = ident.get("nctId")
    title = ident.get("briefTitle")
    
    sponsor_mod = protocol.get("sponsorCollaboratorsModule", {})
    org = sponsor_mod.get("leadSponsor", {}).get("name")
    if not org:
        org = ident.get("organization", {}).get("fullName")

    # --- Status & phases ---
    status_mod = protocol.get("statusModule", {})
    status = status_mod.get("overallStatus", "UNKNOWN")
    last_updated = status_mod.get("lastUpdatePostDateStruct", {}).get("date", "")
    
    # Try primary completion first, fall back to standard completion
    comp_date = status_mod.get("primaryCompletionDateStruct", {}).get("date", "")
    if not comp_date:
        comp_date = status_mod.get("completionDateStruct", {}).get("date", "")

    # --- Phases --- 
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
        "last_updated": last_updated,
        "completion_date": comp_date,
        #status should be formatted as: Status (date)
        "phases": phases,
        "conditions": conditions,
        "interventions": intervention_names
    }


def map_detailed_trial(trial_json: dict) -> dict:
    """
    Detailed mapping for Comparison/Detail View.
    Includes everything from basic search + Study Type & Enrollment.
    """
    # 1. Reuse basic logic to avoid duplication
    base_data = map_basic_search(trial_json)
    
    protocol = trial_json.get("protocolSection", {})
    design_mod = protocol.get("designModule", {})
    
    # --- Study Type ---
    # e.g., "Interventional", "Observational"
    study_type = design_mod.get("studyType", "Not Specified")
    
    # --- Enrollment ---
    # We send raw data so Frontend can format it
    count = design_mod.get("enrollmentInfo", {}).get("count", 0)
    type_ = design_mod.get("enrollmentInfo", {}).get("type", "Not Specified")

    return {
        **base_data,
        "study_type": study_type,
        "enrollment_count": count,
        "enrollment_type": type_
    }


def format_trial_for_ai(trial_json: dict) -> str:
    """
    Traverses the full JSON schema to build a text context for the LLM.
    Includes logic to map internal Group IDs (OG000) to readable Titles (Drug Name).
    """
    protocol = trial_json.get("protocolSection", {})
    results = trial_json.get("resultsSection", {})
    
    ident = protocol.get("identificationModule", {})
    design_mod = protocol.get("designModule", {})
    
    # --- 1. BUILD GROUP MAP (The Fix) ---
    # We create a dictionary: {'OG000': 'Clopidogrel 75mg', ...}
    group_map = {}
    
    # Strategy: Get names from Participant Flow (usually the most reliable source)
    flow_groups = results.get("participantFlowModule", {}).get("groups", [])
    for g in flow_groups:
        if g.get("id") and g.get("title"):
            group_map[g.get("id")] = g.get("title")

    # --- 2. HEADER ---
    context = [
        f"TRIAL: {ident.get('nctId')} - {ident.get('briefTitle')}",
        f"TYPE: {design_mod.get('studyType')} | PHASES: {design_mod.get('phases')}",
        f"PURPOSE: {design_mod.get('designInfo', {}).get('primaryPurpose')}",
        "-" * 20
    ]

    # --- 3. SAFETY DATA ---
    ae_mod = results.get("adverseEventsModule", {})
    if ae_mod:
        context.append("SAFETY RESULTS (Summary):")
        
        # A. Group Rates
        for group in ae_mod.get("eventGroups", []):
            title = group.get("title", "Group")
            # Add to map if missing
            if group.get("id"):
                group_map[group.get("id")] = title
                
            serious = group.get("seriousNumAffected", 0)
            at_risk = group.get("seriousNumAtRisk", 0)
            if at_risk:
                pct = round((int(serious)/int(at_risk))*100, 1)
                context.append(f"  - {title}: {pct}% serious adverse event rate ({serious}/{at_risk})")
        
        # B. Specific Serious Events (Crucial for context)
        serious_events = ae_mod.get("seriousEvents", [])
        if serious_events:
            context.append("\nSpecific Serious Adverse Events:")
            for event in serious_events[:5]:
                term = event.get("term")
                context.append(f"  - {term}")
    else:
        context.append("SAFETY RESULTS: No data posted.")

    # --- 4. EFFICACY DATA ---
    out_mod = results.get("outcomeMeasuresModule", {})
    outcomes = out_mod.get("outcomeMeasures", [])
    
    primary_outcomes = [o for o in outcomes if o.get("type") == "PRIMARY"]
    
    if primary_outcomes:
        context.append("\nEFFICACY RESULTS (Primary):")
        for outcome in primary_outcomes:
            context.append(f"  - Endpoint: {outcome.get('title')}")
            
            # Local Map for this outcome
            local_map = group_map.copy()
            for g in outcome.get("groups", []):
                if g.get("id") and g.get("title"):
                    local_map[g.get("id")] = g.get("title")
            
            # P-Values
            analyses = outcome.get("analyses", [])
            p_values = [a.get("pValue") for a in analyses if a.get("pValue")]
            if p_values:
                context.append(f"    Analysis: p-values reported: {', '.join(p_values)}")
            
            # Data Points
            for classes in outcome.get("classes", [])[:1]: 
                for category in classes.get("categories", [])[:1]:
                    measurements = []
                    for m in category.get("measurements", []):
                        val = m.get("value")
                        gid = m.get("groupId")
                        
                        # Swap ID -> Name
                        group_name = local_map.get(gid, gid) 
                        
                        if val:
                            measurements.append(f"{group_name}: {val}")
                    
                    if measurements:
                        context.append(f"    Data: {', '.join(measurements)}")
    else:
        context.append("\nEFFICACY RESULTS: No primary outcome data available.")

    return "\n".join(context)