export interface Trial {
	nct_id: string;
	title: string;
	organization: string;
	status: string;
	conditions: string;
	interventions: string;
	design: string;
	safety: string;
	efficacy: string;
	enrollment_count: number;
	enrollment_type: string;
	phase: string;
}

export const TRIALS: Trial[] = [
	{
		nct_id: "NCT01586975",
		title: "Aspirin Resistance and Stroke Risk: Platelet Function Analysis",
		organization: "Northwestern University",
		status: "COMPLETED (2011-12)",
		conditions: "Stroke, Myocardial Infarctions",
		interventions: "Clopidogrel (DRUG), Aspirin 81 mg (DRUG)",
		design: "INTERVENTIONAL",
		safety: "Serious Events: Clinical Stroke, MI, TIA",
		efficacy: "[PFA1] Clopidogrel: 202.0 vs Aspirin: 271.1 (p=0.0742)",
		enrollment_count: 93,
		enrollment_type: "ACTUAL",
		phase: "PHASE2, PHASE3",
	},
	{
		nct_id: "NCT04239222",
		title:
			"Feasibility Study to Evaluate a New Energy Storage and Return Prosthetic Foot",
		organization: "Otto Bock Healthcare Products GmbH",
		status: "COMPLETED (2022-03-11)",
		conditions: "Lower Limb Amputation",
		interventions: "Revo-M (DEVICE), Taleo (DEVICE)",
		design: "INTERVENTIONAL",
		safety: "Serious Events: Intestinal blockage, Bacterial Infection",
		efficacy:
			"[Mobility] Revo: 58.3 vs Reference: 56.9 (p=0.286) || [Activity] Revo: 0.569 vs Reference: 0.686 (p=0.031)",
		enrollment_count: 27,
		enrollment_type: "ACTUAL",
		phase: "NOT APPLICABLE",
	},
	{
		nct_id: "NCT04368728",
		title:
			"Study to Describe the Safety, Tolerability, Immunogenicity, and Efficacy of RNA Vaccine Candidates",
		organization: "BioNTech SE",
		status: "COMPLETED (2023-02-10)",
		conditions: "COVID-19, SARS-CoV-2",
		interventions: "BNT162b2 (BIOLOGICAL), Placebo (OTHER)",
		design: "INTERVENTIONAL",
		safety: "No Results Posted",
		efficacy: "No Results Posted (See Publications)",
		enrollment_count: 47079,
		enrollment_type: "ACTUAL",
		phase: "PHASE2, PHASE3",
	},
];
