import asyncio
from curl_cffi.requests import AsyncSession
from sqlmodel import Session, select
from src.db.models import SavedTrial
from src.trials.mapper import map_basic_search, map_detailed_trial, format_trial_for_ai
from google import genai
import json

BASE_URL = "https://clinicaltrials.gov/api/v2/studies"

# SEARCH_FIELDS = [
#     "NCTId", 
#     "BriefTitle", 
#     "LeadSponsorName",
#     "Condition",
#     "InterventionName",
#     "OverallStatus", 
#     "Phase",
#     "StudyType",
#     "BriefSummary",
#     "EnrollmentCount",
#     "PrimaryCompletionDate"
# ]

class TrialService:
    # --- BASIC SEARCH (CARD VIEW) ---
    async def search_trials(self, query: str) -> list[dict]:
        """Hits API using a Chrome-impersonated session to bypass 403."""
        params = {
            "query.term": query, 
            "pageSize": 20, 
            "countTotal": "false",
            # "fields": ",".join(SEARCH_FIELDS)
        }
        
        async with AsyncSession(impersonate="chrome") as client:
            resp = await client.get(BASE_URL, params=params)
            resp.raise_for_status()

            return [map_basic_search(trial) for trial in resp.json().get("studies", [])]

    # --- GET FULL DETAILS (Single Trial) ---
    async def get_full_trial(self, nct_id: str) -> dict | None:
        results = await self.compare_trials([nct_id])
        if results:
            return results[0]
        return None

    # --- SAVE TRIAL ---
    def toggle_save_trial(self, session: Session, trial: SavedTrial) -> str:
        
        existing = session.get(SavedTrial, trial.nct_id)

        if existing:
            # UNSAVE
            session.delete(existing)
            session.commit()
            return "removed"
        
        else:
            # SAVE
            session.add(trial)
            session.commit()
            return "saved"
        
    # --- GET ALL SAVED TRIALS ---
    def get_saved_trials(self, session: Session) -> list[SavedTrial]:
        return list(session.exec(select(SavedTrial)).all())


    # --- AI COMPARISON ---
    async def compare_trials(self, nct_ids: list[str]) -> list[dict]:
        """
        Fetches full data for specific IDs and runs AI summarization.
        """
        if not nct_ids: return []

        # 1. Fetch data for all IDs in one request
        # search for "ID1 OR ID2" to get them in one request
        # This avoids loop-calling the API
        query_term = " OR ".join(nct_ids)
        params = {"query.term": query_term, "pageSize": len(nct_ids)}

        async with AsyncSession(impersonate="chrome") as client:
            resp = await client.get(BASE_URL, params=params)
            trials = resp.json().get("studies", [])

        # 2. Process all trials concurrently (AI generation is the bottleneck)
        # using asyncio.gather ensures they run in parallel
        tasks = [self._analyze_single_trial(trial) for trial in trials]
        return await asyncio.gather(*tasks)

    async def _analyze_single_trial(self, trial_json: dict) -> dict:
        """
        Helper that maps detailed fields AND calls Gemini Async.
        """
        # 1. Map detailed fields (Enrollment, StudyType, etc.)
        detailed_info = map_detailed_trial(trial_json)
        
        # 2. Check for results
        has_results = trial_json.get("hasResults", False)
        if not has_results:
            return {
                **detailed_info,
                "safety_summary": ["No results posted."],
                "efficacy_summary": ["No results posted."]
            }

        # 3. Prepare Context & Call LLM
        context = format_trial_for_ai(trial_json)
        client = genai.Client()
        
        try:
            # PROMPT ENGINEERING
            prompt = (
                "You are a clinical intelligence analyst for a biotech dashboard.\n"
                "Summarize the trial results for a sophisticated audience (PhD/Investors).\n"
                "Format: JSON with keys 'safety' and 'efficacy', each containing a LIST of 3-4 strings.\n\n"
                "STYLE GUIDE:\n"
                "- EFFICACY:\n"
                "   1. Line 1 (Label): Primary Endpoint Name.\n"
                "   2. Line 2 (Data): Compare arms using 'vs' (e.g., 'Drug A (15%) vs Drug B (10%)'). Include Mean/Median.\n"
                "   3. Line 3 (Stat): Standard statistical format (e.g., 'p=0.04 (Significant)' or 'p=0.25 (NS)'). Drop verbose sentences.\n"
                "- SAFETY:\n"
                "   1. Line 1 (Headline): Summary of the imbalance (e.g., 'Higher SAEs in Arm A (5%) vs Arm B (1%)').\n"
                "   2. Line 2 (Detail): Specific rates per arm if needed (n/N).\n"
                "   3. Line 3 (Context): Notable specific events or 'No deaths reported'.\n"
                "- TONE: Telegraphic, dense, high-signal. No 'The', 'A', 'was observed'.\n"
                "- NO markdown formatting."
            )

            response = await client.aio.models.generate_content(
                model="gemini-2.5-flash", 
                contents=f"{prompt}\n\nDATA:\n{context}",
                # Enforce JSON output
                config={"response_mime_type": "application/json"}
            )

            if not response.text:
                return {
                    **detailed_info,
                    "safety_summary": "AI analysis unavailable.",
                    "efficacy_summary": "AI analysis unavailable."
                }

            ai_data = json.loads(response.text)
        
            return {
                **detailed_info,
                "safety_summary": ai_data.get("safety", ["Analysis data missing"]),
                "efficacy_summary": ai_data.get("efficacy", ["Analysis data missing"])
            }
    
        except Exception as e:
            print(f"AI Error: {e}")
            return {
                **detailed_info,
                "safety_summary": ["Service error."],
                "efficacy_summary": ["Service error."]
            }
