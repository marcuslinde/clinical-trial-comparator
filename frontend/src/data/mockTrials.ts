import type { ClinicalTrial } from "@/types/trial";

export const TRIALS: ClinicalTrial[] = [
	{
		nct_id: "NCT00841061",
		title: "Cereals as a Source of Iron for Breastfed Infants",
		organization: "National Institutes of Health (NIH)",
		status: "COMPLETED",
		study_type: "INTERVENTIONAL",
		phase: "NA",
		conditions: ["Iron Deficiency"],
		last_updated: "2009-02-11",

		primary_outcome: "plasma ferritin",

		study_data: {
			enrollment: 111,
			allocation: "RANDOMIZED",
			safety_summary: "Results not posted on ClinicalTrials.gov",
		},
	},
	{
		nct_id: "NCT01234567",
		title: "Safety Study of Ozempic for Weight Loss",
		organization: "Novo Nordisk A/S",
		status: "RECRUITING",
		study_type: "INTERVENTIONAL",
		phase: "PHASE3",
		conditions: ["Obesity", "Diabetes Type 2"],
		last_updated: new Date().toISOString(),
		primary_outcome: "Change in Body Weight (%) from Baseline to Week 68",
		study_data: {
			enrollment: 4500,
			allocation: "RANDOMIZED",
			safety_summary: "Excludes patients with pancreatitis history.",
		},
	},
	{
		nct_id: "NCT09876543",
		title: "Charcot-Marie-Tooth Disease Type 1A Treatment",
		organization: "Pharnext",
		status: "ACTIVE_NOT_RECRUITING",
		study_type: "INTERVENTIONAL",
		phase: "PHASE3",
		conditions: ["Charcot-Marie-Tooth Disease"],
		last_updated: new Date().toISOString(),
		primary_outcome: "Change in ONLS Score",
		study_data: {
			enrollment: 323,
			allocation: "RANDOMIZED",
			safety_summary: "Mild gastrointestinal side effects noted in Phase 2.",
		},
	},
	{
		nct_id: "NCT05555555",
		title: "Cardiovascular Outcomes in Wegovy Users",
		organization: "Novo Nordisk A/S",
		status: "RECRUITING",
		study_type: "OBSERVATIONAL",
		phase: "PHASE4",
		conditions: ["Cardiovascular Diseases"],
		last_updated: new Date().toISOString(),
		primary_outcome: "Time to first MACE (Major Adverse Cardiovascular Event)",
		study_data: {
			enrollment: 12000,
			allocation: "N/A",
			safety_summary: "Long-term surveillance study.",
		},
	},
];
