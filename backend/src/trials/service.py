import httpx
from datetime import datetime, timezone, timedelta
from sqlmodel import Session, select
from src.db.models import ClinicalTrial

BASE_URL = "https://clinicaltrials.gov/api/v2/studies"

class TrialService:
    #1 Check DB
    def get_trial(self, session: Session, nct_id: str) -> ClinicalTrial:
        trial = session.get(ClinicalTrial, nct_id)
        should_fetch = False

        if not trial:
            #case 1: its not in db -> fetch + write
            should_fetch = True
        else:
            #case 2: it IS in the db -> update
            time_difference = datetime.now(timezone.utc) - trial.last_updated
            if time_difference > timedelta(hours=24):
                should_fetch = True
        
        if should_fetch:
            #fetch from api
            #update DB or create new trial
            pass

        return trial
        

    
    
    
    #1 if missing -> Fetch API & Save
    #2 if present but 'stale' (>24h old) -> Fetch API & Update
    #3 if present and fresh -> Return DB version