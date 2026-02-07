from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel, Column, DateTime
from sqlalchemy.dialects.postgresql import JSON, ARRAY
from sqlalchemy import String

def get_current_time():
    return datetime.now(timezone.utc)

class ClinicalTrial(SQLModel, table=True):
    __tablename__ = "clinical_trials"

    nct_id: str = Field(primary_key=True, index=True)

    title: str
    organization: str
    status: str
    study_type: Optional[str] = None
    phase: Optional[str] = None

    conditions: list[str] = Field(
        default_factory=list,
        sa_column=Column(ARRAY(String))
    )

    last_updated: datetime = Field(
        default_factory=get_current_time,
        sa_column=Column(DateTime(timezone=True))
    )

    study_data: dict = Field(
        default_factory=dict,
        sa_column=Column(JSON)
    )