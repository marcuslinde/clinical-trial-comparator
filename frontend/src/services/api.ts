export interface Trial {
	// Metadata
	nct_id: string;
	title: string;
	organization: string;
	status: string;
	last_updated: string;

	// Searchables
	conditions: string;
	interventions: string;

	// Comparison Data
	design: string;
	phase: string;
	enrollment_count: number | null;
	enrollment_type: string | null;
	safety: string;
	efficacy: string;
}

const BASE_URL = import.meta.env.VITE_API_URL;

export const searchTrials = async (query: string): Promise<Trial[]> => {
	if (!query) return [];

	const response = await fetch(
		`${BASE_URL}/search?query=${encodeURIComponent(query)}`,
	);

	if (!response.ok) {
		throw new Error("Failed to fetch trials");
	}

	return response.json();
};

// for saved trials
export const getTrialDetails = async (nctId: string): Promise<Trial> => {
	const response = await fetch(`${BASE_URL}/trials/${nctId}`);

	if (!response.ok) {
		throw new Error("Failed to fetch trial details");
	}

	return response.json();
};
