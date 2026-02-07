from typing import Optional, List, Dict, Any
from sqlmodel import Field, SQLModel, Column
from sqlalchemy.dialects.postgresql import JSON, ARRAY
from sqlalchemy import String, Integer

class ClinicalTrial(SQLModel, table=True):
    __tablename__ = "clinical_trials"

    # --- 1. Identification ---
    nct_id: str = Field(primary_key=True, index=True)
    title: str
    organization: str

    # --- 2. Search & Filter Keys ---
    status: str 
    conditions: List[str] = Field(sa_column=Column(ARRAY(String)))
    interventions: List[str] = Field(sa_column=Column(ARRAY(String)))
    phases: List[str] = Field(sa_column=Column(ARRAY(String)))
    enrollment: Optional[int] = Field(default=None, sa_column=Column(Integer))
    
    # --- 3. Relevant investment info ---
    # STUDY DESIGN
    study_type: Optional[str] = None
    design_details: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    
    # EFFICACY (And results if available)
    primary_outcomes: List[Dict[str, str]] = Field(default=[], sa_column=Column(JSON))
    efficacy_result_summary: List[Dict[str, Any]] = Field(default=[], sa_column=Column(JSON))
    
    # SAFETY
    safety_summary: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))

    # --- 4. Full raw json blob ---
    raw_json: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))