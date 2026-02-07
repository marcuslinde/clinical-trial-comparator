export interface ClinicalTrial {
	nct_id: string;
	title: string;
	organization: string;
	status: string;
	study_type?: string;
	phase?: string;
	primary_outcome?: string;
	conditions: string[];
	last_updated: string;
	study_data: any;
}
