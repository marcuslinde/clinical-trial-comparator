from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from src.db.main import get_session
from src.db.models import ClinicalTrial
from src.trials.service import TrialService

router = APIRouter()

# 2. Dependency Injection for db
def get_service():
  return TrialService()

@router.get("/trials/{nct_id}", response_model=ClinicalTrial)
def get_trial_data(
  nct_id: str, 
  session: Session = Depends(get_session), 
  service: TrialService = Depends(get_service)
):
  trial = service.get_trial(session, nct_id)
    
  if not trial:
    raise HTTPException(status_code=404, detail="Trial not found")
        
  return trial