from curl_cffi.requests import AsyncSession
from sqlmodel import Session, select
from src.db.models import SavedTrial
from src.trials.mapper import extract_trial_data

BASE_URL = "https://clinicaltrials.gov/api/v2/studies"

class TrialService:
    
    # --- SEARCH ---
    async def search_trials(self, query: str) -> list[dict]:
        """Hits API using a Chrome-impersonated session to bypass 403."""
        params = {"query.term": query, "pageSize": 20, "countTotal": "false"}
        
        # 'impersonate="chrome"' makes the request look identical to a real browser
        async with AsyncSession(impersonate="chrome") as client:
            resp = await client.get(BASE_URL, params=params)
            resp.raise_for_status()
            return [extract_trial_data(t) for t in resp.json().get("studies", [])]


    # --- BOOKMARKING (Database) ---
    def toggle_save_trial(self, session: Session, trial_meta: SavedTrial) -> str:
        """
        If exists -> Delete (Unsave).
        If new -> Insert (Save).
        """
        existing = session.get(SavedTrial, trial_meta.nct_id)
        if existing:
            session.delete(existing)
            session.commit()
            return "removed"
        else:
            session.add(trial_meta)
            session.commit()
            return "saved"
        
    # --- GET ALL BOOKMARKS ---
    def get_saved_trials(self, session: Session) -> list[SavedTrial]:
        return list(session.exec(select(SavedTrial)).all())


    # --- GET DETAILS FOR specific BOOKMARK ---
    async def get_full_trial(self, nct_id: str) -> dict | None:
        async with AsyncSession(impersonate="chrome") as client:
            try:
                resp = await client.get(f"{BASE_URL}/{nct_id}", timeout=10.0)
                resp.raise_for_status()
                return extract_trial_data(resp.json())
            except Exception as e:
                print(f"Error fetching {nct_id}: {e}")
                return None