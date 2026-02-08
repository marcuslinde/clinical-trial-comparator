import { useState } from "react";
import { TRIALS } from "@/data/mockTrials";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
	Search,
	ArrowLeft,
	GitCompare,
	AlertTriangle,
	FileText,
	CheckCircle2,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";

export default function DashboardHome() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [isComparing, setIsComparing] = useState(false);

	// --- FILTERING ---
	const filteredTrials = TRIALS.filter((trial) => {
		const term = searchQuery.toLowerCase();
		return (
			trial.title.toLowerCase().includes(term) ||
			trial.conditions.toLowerCase().includes(term) ||
			trial.nct_id.toLowerCase().includes(term)
		);
	});

	// --- SELECTION LOGIC ---
	const toggleSelection = (id: string) => {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
		);
	};

	const selectedTrialsData = TRIALS.filter((t) =>
		selectedIds.includes(t.nct_id),
	);

	// --- HELPER: SAFETY BADGE ---
	const getSafetyBadge = (safetyText: string) => {
		if (safetyText.includes("No Results"))
			return (
				<Badge variant="outline" className="text-gray-400 border-gray-200">
					No Data
				</Badge>
			);
		if (safetyText.includes("Serious Events"))
			return (
				<Badge
					variant="destructive"
					className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
				>
					<AlertTriangle className="w-3 h-3 mr-1" /> SAEs Reported
				</Badge>
			);
		return (
			<Badge
				variant="secondary"
				className="bg-green-100 text-green-700 hover:bg-green-200"
			>
				<CheckCircle2 className="w-3 h-3 mr-1" /> Clean
			</Badge>
		);
	};

	return (
		<DashboardLayout>
			<div className="max-w-7xl mx-auto space-y-6">
				{/* --- HEADER --- */}
				<div className="flex flex-col gap-2 mb-8">
					<h1 className="text-3xl font-bold tracking-tight text-slate-900">
						Clinical Trial Intelligence
					</h1>
					<p className="text-slate-500">
						Compare safety, efficacy, and design across Novo Nordisk therapeutic
						areas.
					</p>
				</div>

				{/* ==========================
            VIEW 2: COMPARISON MATRIX
           ========================== */}
				{isComparing ? (
					<div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
						<div className="flex items-center justify-between">
							<Button
								variant="ghost"
								onClick={() => setIsComparing(false)}
								className="gap-2 hover:bg-slate-200"
							>
								<ArrowLeft className="h-4 w-4" /> Back to Search
							</Button>
							<h2 className="text-lg font-semibold text-slate-700">
								Comparing {selectedTrialsData.length} Trials
							</h2>
						</div>

						<Card className="border-slate-200 shadow-lg overflow-hidden">
							<ScrollArea className="w-full">
								<div className="min-w-max">
									<Table>
										<TableHeader className="bg-slate-50">
											<TableRow>
												<TableHead className="w-[180px] bg-slate-100 font-bold sticky left-0 z-10 border-r">
													Metric
												</TableHead>
												{selectedTrialsData.map((trial) => (
													<TableHead
														key={trial.nct_id}
														className="w-[400px] min-w-[300px] align-top py-4"
													>
														<div className="space-y-2">
															<Badge variant="outline">{trial.nct_id}</Badge>
															<div
																className="font-bold text-slate-900 leading-snug text-sm line-clamp-2"
																title={trial.title}
															>
																{trial.title}
															</div>
														</div>
													</TableHead>
												))}
											</TableRow>
										</TableHeader>
										<TableBody>
											{/* ROW: STATUS */}
											<TableRow>
												<TableCell className="font-medium bg-slate-50/50 sticky left-0 border-r">
													Status
												</TableCell>
												{selectedTrialsData.map((t) => (
													<TableCell key={t.nct_id}>
														<Badge
															variant={
																t.status.includes("COMPLETED")
																	? "secondary"
																	: "default"
															}
														>
															{t.status}
														</Badge>
													</TableCell>
												))}
											</TableRow>

											{/* ROW: EFFICACY */}
											<TableRow className="bg-blue-50/30">
												<TableCell className="font-bold text-blue-900 bg-blue-50 sticky left-0 border-r">
													<div className="flex items-center gap-2">
														<FileText className="w-4 h-4" /> Efficacy
													</div>
												</TableCell>
												{selectedTrialsData.map((t) => (
													<TableCell key={t.nct_id} className="align-top">
														<div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
															{t.efficacy.split("||").map((part, i) => (
																<div
																	key={i}
																	className={`p-2 rounded mb-2 ${
																		part.includes("p=") &&
																		!part.includes("Not Sig")
																			? "bg-white border border-blue-100 shadow-sm"
																			: ""
																	}`}
																>
																	{part.trim()}
																</div>
															))}
														</div>
													</TableCell>
												))}
											</TableRow>

											{/* ROW: SAFETY */}
											<TableRow>
												<TableCell className="font-bold text-slate-900 bg-slate-50/50 sticky left-0 border-r">
													Safety
												</TableCell>
												{selectedTrialsData.map((t) => (
													<TableCell key={t.nct_id} className="align-top">
														<div className="space-y-2">
															{getSafetyBadge(t.safety)}
															<p className="text-sm text-slate-600 mt-1">
																{t.safety.replace("Serious Events:", "").trim()}
															</p>
														</div>
													</TableCell>
												))}
											</TableRow>

											{/* ROW: INTERVENTIONS */}
											<TableRow>
												<TableCell className="font-medium bg-slate-50/50 sticky left-0 border-r">
													Interventions
												</TableCell>
												{selectedTrialsData.map((t) => (
													<TableCell
														key={t.nct_id}
														className="text-sm text-slate-600"
													>
														{t.interventions}
													</TableCell>
												))}
											</TableRow>

											{/* ROW: ENROLLMENT */}
											<TableRow>
												<TableCell className="font-medium bg-slate-50/50 sticky left-0 border-r">
													Enrollment
												</TableCell>
												{selectedTrialsData.map((t) => (
													<TableCell key={t.nct_id} className="text-sm">
														{t.enrollment_count} participants (
														{t.enrollment_type})
													</TableCell>
												))}
											</TableRow>
										</TableBody>
									</Table>
								</div>
								<ScrollBar orientation="horizontal" />
							</ScrollArea>
						</Card>
					</div>
				) : (
					/* ==========================
              VIEW 1: SEARCH LIST (Wide Cards)
             ========================== */
					<div className="space-y-6">
						<div className="relative max-w-3xl">
							<Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
							<Input
								placeholder="Search by drug (e.g., 'Ozempic'), condition, or ID..."
								className="pl-12 h-12 text-lg shadow-sm border-slate-300 focus:border-blue-500 rounded-full"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>

						<div className="flex flex-col gap-4">
							{filteredTrials.map((trial) => {
								const isSelected = selectedIds.includes(trial.nct_id);

								return (
									<Card
										key={trial.nct_id}
										className={`
                      cursor-pointer transition-all duration-200 border hover:border-blue-400 hover:shadow-md
                      ${
												isSelected
													? "border-blue-600 ring-1 ring-blue-600 bg-blue-50/30"
													: "border-slate-200"
											}
                    `}
										onClick={() => toggleSelection(trial.nct_id)}
									>
										<div className="p-5 flex flex-col sm:flex-row gap-4 items-start">
											{/* CHECKBOX COLUMN */}
											<div className="pt-1">
												<Checkbox
													checked={isSelected}
													className="data-[state=checked]:bg-blue-600 h-5 w-5 border-slate-300"
												/>
											</div>

											{/* MAIN CONTENT COLUMN */}
											<div className="flex-1 space-y-3">
												{/* TOP ROW: ID + STATUS + PHASE */}
												<div className="flex flex-wrap items-center gap-3 text-sm">
													<span className="font-mono text-slate-500 font-medium">
														{trial.nct_id}
													</span>

													{/* STATUS BADGE */}
													<Badge
														variant={
															trial.status.includes("COMPLETED")
																? "secondary"
																: "default"
														}
														className="rounded-sm px-2 font-normal"
													>
														{trial.status}
													</Badge>

													{/* PHASE TAG */}
													<span className="text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
														{trial.phase || "N/A"}
													</span>
												</div>

												{/* TITLE - FULL WIDTH, NO CUTOFF */}
												<h3 className="text-lg font-bold text-slate-900 leading-snug">
													{trial.title}
												</h3>

												{/* META ROW: ORG + CONDITIONS */}
												<div className="text-slate-600 text-sm flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
													<div className="flex items-center gap-2">
														<span className="text-slate-400">Sponsor:</span>
														<span className="font-medium">
															{trial.organization}
														</span>
													</div>
													<div className="flex items-center gap-2">
														<span className="text-slate-400">Conditions:</span>
														<span
															className="truncate max-w-[300px]"
															title={trial.conditions}
														>
															{trial.conditions}
														</span>
													</div>
												</div>

												{/* KEY INTERVENTIONS (High Value for Investors) */}
												<div className="bg-slate-50 rounded-md p-3 border border-slate-100 mt-2">
													<span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
														Interventions
													</span>
													<div className="text-sm font-medium text-slate-700">
														{trial.interventions}
													</div>
												</div>
											</div>

											{/* RIGHT COLUMN: ACTION ARROW */}
											<div className="hidden sm:block text-slate-300 self-center">
												<ArrowLeft className="h-5 w-5 rotate-180" />
											</div>
										</div>
									</Card>
								);
							})}
						</div>

						{filteredTrials.length === 0 && (
							<div className="text-center py-20 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
								<p className="text-slate-500 text-lg">
									No trials found matching "{searchQuery}"
								</p>
								<p className="text-slate-400 text-sm">
									Try searching for an ID (NCT...) or condition (e.g. Stroke)
								</p>
							</div>
						)}
					</div>
				)}

				{/* --- FLOATING ACTION BAR --- */}
				{!isComparing && selectedIds.length > 0 && (
					<div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 w-auto">
						<div className="bg-slate-900 text-white pl-6 pr-2 py-2 rounded-full shadow-2xl flex items-center gap-6 border border-slate-700">
							<div className="flex flex-col">
								<span className="font-bold text-sm">Selection Active</span>
								<span className="text-xs text-slate-400">
									{selectedIds.length} trials selected
								</span>
							</div>

							<div className="flex gap-2">
								<Button
									disabled={selectedIds.length < 2}
									size="sm"
									variant="secondary"
									onClick={() => setIsComparing(true)}
									className="gap-2 font-bold"
								>
									<GitCompare className="h-4 w-4" />
									{selectedIds.length < 2
										? "Select 2+ to Compare"
										: "Compare Now"}
								</Button>
								<Button
									size="icon"
									variant="ghost"
									className="h-9 w-9 rounded-full hover:bg-slate-800 text-slate-400"
									onClick={() => setSelectedIds([])}
								>
									✕
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
