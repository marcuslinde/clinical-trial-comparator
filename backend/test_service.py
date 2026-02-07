import sys
import os
import json
from datetime import datetime
from sqlmodel import SQLModel, Session, create_engine

# 1. Ensure we can import from 'src'
sys.path.append(os.getcwd())

from src.trials.service import TrialService

# 2. Setup a temporary in-memory database
engine = create_engine("sqlite:///:memory:")

def run_raw_test():
    # Create tables
    SQLModel.metadata.create_all(engine)
    service = TrialService()
    
    # This trial (Dapagliflozin) has Results, Safety, and P-Values
    test_id = "NCT01586975"

    print(f"--- FETCHING {test_id} ---")

    with Session(engine) as session:
        trial = service.get_trial(session, test_id)
        
        if trial:
            print("\n✅ RAW DATABASE ROW:")
            # model_dump() prints the raw dict (Pydantic V2 / SQLModel)
            # If you are on an older version, use .dict()
            try:
                data = trial.model_dump()
            except AttributeError:
                data = trial.dict()

            # Print nicely indented JSON of the raw data
            # using default=str to handle datetime objects
            print(json.dumps(data, indent=4, default=str))
        else:
            print("❌ FAILED. Trial not found.")

if __name__ == "__main__":
    run_raw_test()