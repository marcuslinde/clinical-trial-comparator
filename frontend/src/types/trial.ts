export interface Trial {
	nct_id: string;
	title: string;
	organization: string;
	status: string;
	last_updated: string;
	conditions: string;
	interventions: string;
	design: string;
	safety: string;
	efficacy: string;
	enrollment_count: number | null;
	enrollment_type: string | null;
	phase: string;
}
