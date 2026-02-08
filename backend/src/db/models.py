from datetime import datetime
from sqlmodel import Field, SQLModel, Column, Text

class SavedTrial(SQLModel, table=True):
    __tablename__ = "saved_trials"

    nct_id: str = Field(primary_key=True)
    
    # Metadata
    title: str = Field(sa_column=Column(Text, nullable=False))
    organization: str | None = Field(default=None, sa_column=Column(Text))
    
    # Helpful for searching your own bookmarks locally
    conditions: str | None = Field(default=None, sa_column=Column(Text))
    interventions: str | None = Field(default=None, sa_column=Column(Text))
    
    # When did the user save this?
    saved_at: datetime = Field(default_factory=datetime.now)