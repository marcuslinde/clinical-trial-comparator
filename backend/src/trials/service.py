import httpx
from datetime import datetime, timedelta
from sqlmodel import Session
from src.db.models import Trial
from src.trials.mapper import extract_trial_data

BASE_URL = "https://clinicaltrials.gov/api/v2/studies"

class TrialService:
    def get_trial(self, session: Session, nct_id: str) -> Trial | None:
        """
        Retrieves a trial. 
        1. Fetches from API if missing.
        2. Fetches from API if DB data is >24h old (stale).
        3. Returns DB data if fresh.
        """
        trial = session.get(Trial, nct_id)
        should_fetch = False

        if not trial:
            #case 1: not in db -> fetch + save
            should_fetch = True
        else:
            #case 2: In db, but maybe stale -> update
            time_difference = datetime.now() - trial.last_updated
            
            if time_difference > timedelta(hours=24):
                should_fetch = True
        
        if should_fetch:
            try:
                response = httpx.get(f"{BASE_URL}/{nct_id}", timeout=10.0)
                response.raise_for_status()
                api_data = extract_trial_data(response.json())
                
                if trial:
                    # Update existing record fields
                    for key, value in api_data.items():
                        setattr(trial, key, value)
                    trial.last_updated = datetime.now()
                else:
                    # Create new record
                    trial = Trial(**api_data)
                    session.add(trial)
                
                session.commit()
                session.refresh(trial)
                
            except httpx.HTTPStatusError as e:
                print(f"API Error for {nct_id}: {e}")
                # Fallback: Return stale data if API fails
                if trial:
                    return trial
                return None
            except Exception as e:
                print(f"Unexpected error: {e}")
                return None

        return trial