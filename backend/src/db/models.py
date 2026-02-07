from datetime import datetime
from sqlmodel import Field, SQLModel, Column, Text

class Trial(SQLModel, table=True):
    __tablename__ = "trials"

    nct_id: str = Field(primary_key=True)
    title: str = Field(sa_column=Column(Text, nullable=False))
    organization: str | None = Field(default=None, sa_column=Column(Text))
    status: str | None = None
    last_updated: datetime = Field(
        default_factory=datetime.now,
        nullable=False
    )
    
    # --- Searchables ---
    conditions: str | None = Field(default=None, sa_column=Column(Text))
    interventions: str | None = Field(default=None, sa_column=Column(Text))
    
    # --- 1. TRIAL DESIGN ---
    design: str | None = Field(default=None, sa_column=Column(Text))
    phase: str | None = Field(default=None, sa_column=Column(Text))

    # --- 2. EFFICACY ---
    p_values: str | None = Field(default=None, sa_column=Column(Text))
    
    # --- 3. SAFETY ---
    safety: str | None = Field(default=None, sa_column=Column(Text))

    # --- Metrics ---
    enrollment_count: str | None = None
    enrollment_type: str | None = None