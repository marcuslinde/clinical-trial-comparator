from datetime import datetime, timezone
from typing import Optional, List
from sqlmodel import Field, SQLModel, Column, DateTime
from sqlalchemy.dialects.postgresql import JSON, ARRAY
from sqlalchemy import String

def get_current_time():
    return datetime.now(timezone.utc)

class ClinicalTrial(SQLModel, table=True):
    __tablename__ = "clinical_trials"

    nct_id: str = Field(primary_key=True, index=True)

    # Relevant Metadata for Investors
    title: str
    organization: str
    status: str
    study_type: Optional[str] = None
    phase: Optional[str] = None
    
    conditions: List[str] = Field(
        default=[], 
        sa_column=Column(ARRAY(String))
    )

    last_updated: datetime = Field(
        default_factory=get_current_time,
        sa_column=Column(DateTime(timezone=True))
    )

    # Rest of data stored as JSON for flexibility
    study_data: dict = Field(default={}, sa_column=Column(JSON))