import { useState } from "react";
import type { Trial } from "@/services/api";
import { searchTrials } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft, GitCompare, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ComparisonView } from "@/components/ComparisonView";
import { TrialCard } from "@/components/TrialCard";
import { EmptyState } from "@/components/EmptyState";
import { SelectionBar } from "@/components/SelectionBar";

export default function DashboardHome() {
	const [query, setQuery] = useState("");
	const [trials, setTrials] = useState<Trial[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [isComparing, setIsComparing] = useState(false);

	const handleSearch = async () => {
		if (!query.trim()) return;

		setLoading(true);
		setError("");
		setSelectedIds([]);

		try {
			const results = await searchTrials(query);
			setTrials(results);
			if (results.length === 0) {
				setError("No trials found. Try a different term.");
			}
		} catch (err) {
			console.error(err);
			setError("Failed to connect to the clinical trials database.");
		} finally {
			setLoading(false);
		}
	};

	const toggleSelection = (id: string) => {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
		);
	};

	const selectedTrials = trials.filter((t) => selectedIds.includes(t.nct_id));

	return (
		<DashboardLayout>
			<div className="max-w-7xl mx-8 space-y-8 h-full flex flex-col pt-6">
				{/* Header */}
				<header className="flex flex-col gap-2 shrink-0">
					<h1 className="text-3xl font-bold tracking-tight text-slate-900">
						Clinical Trial Intelligence
					</h1>
					<p className="text-slate-500 text-lg">
						Search live data from ClinicalTrials.gov
					</p>
				</header>

				{isComparing ? (
					<ComparisonView
						trials={selectedTrials}
						onBack={() => setIsComparing(false)}
					/>
				) : (
					<div className="space-y-6 animate-in fade-in duration-500">
						{/* Search Bar */}
						<div className="relative max-w-3xl">
							<Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
							<Input
								placeholder="Search by drug (e.g. 'Ozempic') or condition..."
								className="pl-12 h-12 text-lg shadow-sm border-slate-200 rounded-full bg-white"
								value={query}
								disabled={loading}
								onChange={(e) => setQuery(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleSearch()}
							/>
							{loading && (
								<Loader2 className="absolute right-4 top-3.5 h-5 w-5 animate-spin text-blue-500" />
							)}
						</div>

						{error && (
							<div className="text-red-500 ml-4 font-medium">{error}</div>
						)}

						{/* Results */}
						{trials.length > 0 ? (
							<div className="flex flex-col gap-4 pb-20">
								{trials.map((trial) => (
									<TrialCard
										key={trial.nct_id}
										trial={trial}
										isSelected={selectedIds.includes(trial.nct_id)}
										onToggle={toggleSelection}
									/>
								))}
							</div>
						) : (
							!loading && !error && <EmptyState />
						)}
					</div>
				)}

				{/* Selection Bar */}
				{!isComparing && selectedIds.length > 0 && (
					<SelectionBar
						count={selectedIds.length}
						onCompare={() => setIsComparing(true)}
						onClear={() => setSelectedIds([])}
					/>
				)}
			</div>
		</DashboardLayout>
	);
}
