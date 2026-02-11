from datetime import datetime
from typing import List, Optional
from sqlmodel import Field, SQLModel, Column, String, ARRAY

class SavedTrial(SQLModel, table=True):
    __tablename__ = "saved_trials"

    nct_id: str = Field(primary_key=True)
    
    title: str
    organization: Optional[str] = None
    status: Optional[str] = "UNKNOWN"
    
    # We use sa_column to tell SQLModel "This is a Postgres Array of Strings"
    conditions: List[str] = Field(
        default=[], 
        sa_column=Column(ARRAY(String))
    )
    
    interventions: List[str] = Field(
        default=[], 
        sa_column=Column(ARRAY(String))
    )
    
    phases: List[str] = Field(
        default=[], 
        sa_column=Column(ARRAY(String))
    )
    
    saved_at: datetime = Field(default_factory=datetime.now)