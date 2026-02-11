from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session
from src.db.main import get_session
from src.db.models import SavedTrial
from src.trials.service import TrialService

router = APIRouter()

def get_service():
    return TrialService()

class CompareRequest(BaseModel):
    nct_ids: list[str]

# LIGHTWEIGHT SEARCH
@router.get("/search")
async def search(query: str, service: TrialService = Depends(get_service)):
    return await service.search_trials(query)

# AI COMPARISON ROUTE
@router.post("/compare")
async def compare_trials(
    payload: CompareRequest, 
    service: TrialService = Depends(get_service)
):
    if len(payload.nct_ids) < 1:
        raise HTTPException(400, "No trial IDs provided")
    if len(payload.nct_ids) > 5:
        raise HTTPException(400, "Max 5 trials allowed for comparison")
        
    return await service.compare_trials(payload.nct_ids)

# GET BOOKMARKS
@router.get("/saved", response_model=list[SavedTrial])
def list_saved(
    session: Session = Depends(get_session), 
    service: TrialService = Depends(get_service)
):
    return service.get_saved_trials(session)

# BOOKMARK OR UNBOOKMARK TRIAL
@router.post("/saved")
def toggle_save(
    trial: SavedTrial, 
    session: Session = Depends(get_session), 
    service: TrialService = Depends(get_service)
):
    """
    Send the minimal metadata (id, title, org) here to save/unsave.
    """
    action = service.toggle_save_trial(session, trial)
    return {"status": "success", "action": action, "nct_id": trial.nct_id}

# VIEW BOOKMARK FULL DETAILS
@router.get("/trials/{nct_id}")
async def get_trial_details(nct_id: str, service: TrialService = Depends(get_service)): 
    """
    Call this when user clicks 'View Details' on ANY card.
    It always fetches fresh data from the API.
    """
    data = await service.get_full_trial(nct_id)
    
    if not data:
        raise HTTPException(404, "Trial not found on ClinicalTrials.gov")
    return data