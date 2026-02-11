import asyncio
import json
import os
import sys
from dotenv import load_dotenv

# Ensure the src module is found
sys.path.append(os.getcwd())

from src.trials.service import TrialService

# ANSI Colors
GREEN = "\033[92m"
CYAN = "\033[96m"
YELLOW = "\033[93m"
RESET = "\033[0m"

async def test_pipeline():
    print(f"{CYAN}--- STARTING CLINICAL TRIALS PIPELINE TEST ---{RESET}")
    
    # 1. Initialize Service
    service = TrialService()
    
    # ---------------------------------------------------------
    # TEST 1: LIGHTWEIGHT SEARCH (Verifies List View)
    # ---------------------------------------------------------
    print(f"\n{YELLOW}[1] Testing Lightweight Search...{RESET}")
    try:
        # We search for the specific ID to see how it looks in a card
        results = await service.search_trials("NCT01586975")
        
        if not results:
            print(f"{GREEN}Search returned no results.{RESET}")
            return

        print(f"{GREEN}✓ Search successful.{RESET}")
        print(f"   Title: {results[0]['title']}")
        print(f"   Conditions: {results[0]['conditions']}")
        print(f"   Phases: {results[0]['phases']}")
        
    except Exception as e:
        print(f"❌ Search failed: {e}")
        return

    # ---------------------------------------------------------
    # TEST 2: AI SUMMARIZATION (Verifies Detail View)
    # ---------------------------------------------------------
    target_id = "NCT02571634"
    print(f"\n{YELLOW}[2] Testing AI Summary for {target_id}...{RESET}")
    print("    (Sending full trial data to Gemini... please wait)")
    
    try:
        # Fetch full details + AI analysis
        detailed_results = await service.compare_trials([target_id])
        
        if not detailed_results:
            print("❌ No details returned.")
            return

        trial_detail = detailed_results[0]
        
        print(f"\n{GREEN}✓ AI Analysis Complete!{RESET}")
        print("-" * 50)
        
        print(f"\n{CYAN}--- SAFETY SUMMARY (AI Generated) ---{RESET}")
        print(trial_detail.get('safety_summary'))
        
        print(f"\n{CYAN}--- EFFICACY SUMMARY (AI Generated) ---{RESET}")
        print(trial_detail.get('efficacy_summary'))
        
        print("-" * 50)

    except Exception as e:
        print(f"❌ Detail/AI failed: {e}")

if __name__ == "__main__":
    load_dotenv()

    # Safe Environment Variable Loading
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        os.environ["GOOGLE_API_KEY"] = gemini_key
    else:
        print("⚠️  GEMINI_API_KEY not found in environment.")

    asyncio.run(test_pipeline())