import httpx
from datetime import datetime, timezone, timedelta
from sqlmodel import Session, select
from src.db.models import ClinicalTrial

#1 if missing -> Fetch API & Save
#2 if present but 'stale' (>24h old) -> Fetch API & Update
#3 if present and fresh -> Return DB version

BASE_URL = "https://clinicaltrials.gov/api/v2/studies"

class TrialService:
    def get_trial(self, session: Session, nct_id: str) -> ClinicalTrial:
        trial = session.get(ClinicalTrial, nct_id)
        should_fetch = False

        if not trial:
            #case 1: not in db -> fetch + save
            should_fetch = True
        else:
            #case 2: In db, but maybe stale -> update
            now = datetime.now(timezone.utc)
            last_updated = trial.last_updated.replace(tzinfo=timezone.utc) if trial.last_updated.tzinfo is None else trial.last_updated
            
            time_difference = now - last_updated
            if time_difference > timedelta(hours=24):
                should_fetch = True
        
        if should_fetch:
            #fetch from api
            #update DB or create new trial
            #to do: create this next week
            pass

        return trial