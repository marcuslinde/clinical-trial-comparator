import { useState } from "react";
import { TRIALS } from "@/data/mockTrials";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
	Building2,
	Activity,
	ChevronRight,
	FlaskConical,
	Users,
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

	// --- VISUAL HELPERS ---
	const getSafetyBadge = (safetyText: string) => {
		if (safetyText.includes("No Results"))
			return (
				<Badge
					variant="outline"
					className="text-slate-400 border-slate-200 font-normal"
				>
					No Data
				</Badge>
			);
		if (safetyText.includes("Serious Events"))
			return (
				<Badge
					variant="destructive"
					className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200 border shadow-none font-medium"
				>
					<AlertTriangle className="w-3 h-3 mr-1" /> SAEs Found
				</Badge>
			);
		return (
			<Badge
				variant="secondary"
				className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 border shadow-none font-medium"
			>
				<CheckCircle2 className="w-3 h-3 mr-1" /> Clean Profile
			</Badge>
		);
	};

	const getStatusStyles = (status: string) => {
		const s = status.toLowerCase();
		if (s.includes("completed")) {
			return "bg-emerald-50 text-emerald-700 border-emerald-200";
		}
		if (s.includes("recruiting") || s.includes("active")) {
			return "bg-blue-50 text-blue-700 border-blue-200";
		}
		if (s.includes("terminated")) {
			return "bg-red-50 text-red-700 border-red-200";
		}
		return "bg-slate-100 text-slate-600 border-slate-200";
	};

	// --- CONSTANTS ---
	const COL_WIDTH = "w-[320px] min-w-[320px] max-w-[320px]";
	const LABEL_COL_WIDTH = "w-[180px] min-w-[180px]";

	return (
		<DashboardLayout>
			<div className="max-w-7xl mx-auto space-y-8 h-full flex flex-col">
				{/* --- HEADER --- */}
				<div className="flex flex-col gap-2 shrink-0">
					<h1 className="text-3xl font-bold tracking-tight text-slate-900">
						Clinical Trial Intelligence
					</h1>
					<p className="text-slate-500 text-lg">
						Search, filter, and analyze clinical studies across therapeutic
						areas.
					</p>
				</div>

				{/* ==========================
            VIEW 2: COMPARISON MATRIX
           ========================== */}
				{isComparing ? (
					<div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
						<div className="flex items-center justify-between mb-4 shrink-0">
							<Button
								variant="ghost"
								onClick={() => setIsComparing(false)}
								className="gap-2 hover:bg-slate-200 text-slate-600"
							>
								<ArrowLeft className="h-4 w-4" /> Back to Search
							</Button>
							<div className="flex items-center gap-3">
								<span className="text-sm text-slate-500">
									Comparing <strong>{selectedTrialsData.length}</strong> trials
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setSelectedIds([])}
									className="text-xs h-8"
								>
									Clear All
								</Button>
							</div>
						</div>

						{/* SCROLLABLE TABLE CONTAINER */}
						<div className="flex-1 border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden relative flex flex-col">
							<ScrollArea className="flex-1 w-full h-full">
								<div className="min-w-max">
									<Table>
										<TableHeader>
											<TableRow className="border-b border-slate-200 hover:bg-transparent">
												{/* 1. STICKY CORNER (Metric Label) */}
												<TableHead
													className={`${LABEL_COL_WIDTH} sticky left-0 top-0 z-50 bg-slate-50 border-r border-slate-200 p-4 shadow-[1px_1px_4px_rgba(0,0,0,0.05)]`}
												>
													<span className="font-bold text-slate-900">
														Metric
													</span>
												</TableHead>

												{/* 2. STICKY HEADER ROW (Trial Titles) */}
												{selectedTrialsData.map((trial) => (
													<TableHead
														key={trial.nct_id}
														className={`${COL_WIDTH} sticky top-0 z-40 bg-slate-50 p-4 align-top border-b border-r border-slate-200 last:border-r-0`}
													>
														<div className="space-y-3">
															{/* ID & Status */}
															<div className="flex justify-between items-start gap-2">
																<Badge
																	variant="outline"
																	className="font-mono text-[10px] text-slate-400 bg-white"
																>
																	{trial.nct_id}
																</Badge>
																<Badge
																	className={`text-[10px] px-1.5 py-0 h-5 ${getStatusStyles(trial.status)} shadow-none`}
																>
																	{trial.status.split(" ")[0]}
																</Badge>
															</div>
															{/* Title (Clamped) */}
															<div
																className="font-bold text-slate-900 leading-snug text-sm line-clamp-2 h-[40px]"
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
											{/* --- ROW: PHASE & ENROLLMENT --- */}
											<TableRow className="hover:bg-transparent border-b border-slate-100">
												<TableCell
													className={`sticky left-0 z-30 bg-white font-semibold text-slate-700 border-r border-slate-100 p-4 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]`}
												>
													<div className="flex items-center gap-2">
														<Users className="w-4 h-4 text-slate-400" />
														Design
													</div>
												</TableCell>
												{selectedTrialsData.map((t) => (
													<TableCell
														key={t.nct_id}
														className={`${COL_WIDTH} p-4 align-top border-r border-slate-100 last:border-r-0`}
													>
														<div className="flex flex-col gap-2 text-sm">
															<div className="flex justify-between border-b border-slate-50 pb-2">
																<span className="text-slate-500 text-xs uppercase tracking-wide">
																	Phase
																</span>
																<span className="font-medium text-slate-900">
																	{t.phase || "N/A"}
																</span>
															</div>
															<div className="flex justify-between">
																<span className="text-slate-500 text-xs uppercase tracking-wide">
																	Enrollment
																</span>
																<span className="font-medium text-slate-900">
																	{t.enrollment_count?.toLocaleString()} (
																	{t.enrollment_type})
																</span>
															</div>
														</div>
													</TableCell>
												))}
											</TableRow>

											{/* --- ROW: EFFICACY (Large Text) --- */}
											<TableRow className="hover:bg-transparent border-b border-slate-100 bg-blue-50/10">
												<TableCell
													className={`sticky left-0 z-30 bg-blue-50/30 font-bold text-blue-900 border-r border-slate-100 p-4 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]`}
												>
													<div className="flex items-center gap-2">
														<FileText className="w-4 h-4" />
														Efficacy
													</div>
												</TableCell>
												{selectedTrialsData.map((t) => (
													<TableCell
														key={t.nct_id}
														className={`${COL_WIDTH} p-4 align-top border-r border-slate-100 last:border-r-0`}
													>
														{/* Scrollable Cell Content for Long Text */}
														<div className="max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
															<div className="text-sm text-slate-700 space-y-2">
																{t.efficacy.split("||").map((part, i) => (
																	<div
																		key={i}
																		className={`p-2.5 rounded-lg text-xs leading-relaxed ${
																			part.includes("p=") &&
																			!part.includes("Not Sig")
																				? "bg-white border border-blue-200 shadow-sm text-slate-900 font-medium"
																				: "text-slate-600 bg-slate-50/50"
																		}`}
																	>
																		{part.trim()}
																	</div>
																))}
															</div>
														</div>
													</TableCell>
												))}
											</TableRow>

											{/* --- ROW: SAFETY --- */}
											<TableRow className="hover:bg-transparent border-b border-slate-100">
												<TableCell
													className={`sticky left-0 z-30 bg-white font-bold text-slate-900 border-r border-slate-100 p-4 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]`}
												>
													<div className="flex items-center gap-2">
														<Activity className="w-4 h-4 text-slate-400" />
														Safety
													</div>
												</TableCell>
												{selectedTrialsData.map((t) => (
													<TableCell
														key={t.nct_id}
														className={`${COL_WIDTH} p-4 align-top border-r border-slate-100 last:border-r-0`}
													>
														<div className="space-y-3">
															{getSafetyBadge(t.safety)}
															<p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
																{t.safety.replace("Serious Events:", "").trim()}
															</p>
														</div>
													</TableCell>
												))}
											</TableRow>

											{/* --- ROW: INTERVENTIONS --- */}
											<TableRow className="hover:bg-transparent">
												<TableCell
													className={`sticky left-0 z-30 bg-white font-semibold text-slate-700 border-r border-slate-100 p-4 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]`}
												>
													<div className="flex items-center gap-2">
														<FlaskConical className="w-4 h-4 text-slate-400" />
														Interventions
													</div>
												</TableCell>
												{selectedTrialsData.map((t) => (
													<TableCell
														key={t.nct_id}
														className={`${COL_WIDTH} p-4 align-top border-r border-slate-100 last:border-r-0`}
													>
														<div className="flex flex-wrap gap-1.5">
															{t.interventions.split(",").map((drug, i) => (
																<Badge
																	key={i}
																	variant="outline"
																	className="font-normal text-slate-600 bg-slate-50 border-slate-200"
																>
																	{drug.trim()}
																</Badge>
															))}
														</div>
													</TableCell>
												))}
											</TableRow>
										</TableBody>
									</Table>
								</div>
								<ScrollBar orientation="horizontal" />
							</ScrollArea>
						</div>
					</div>
				) : (
					/* ==========================
              VIEW 1: SEARCH LIST
             ========================== */
					<div className="space-y-6 animate-in fade-in duration-500">
						<div className="relative max-w-3xl">
							<Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
							<Input
								placeholder="Search by drug (e.g., 'Ozempic'), condition, or ID..."
								className="pl-12 h-12 text-lg shadow-sm border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-full bg-white transition-all"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>

						<div className="flex flex-col gap-4 pb-20">
							{filteredTrials.map((trial) => {
								const isSelected = selectedIds.includes(trial.nct_id);
								const statusColor = getStatusStyles(trial.status);

								const interventionTags = trial.interventions
									.split(",")
									.slice(0, 4);
								const hasMoreInterventions =
									trial.interventions.split(",").length > 4;

								return (
									<Card
										key={trial.nct_id}
										className={`
                      group relative cursor-pointer transition-all duration-200 border rounded-xl overflow-hidden
                      ${
												isSelected
													? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/10 shadow-md"
													: "border-slate-200 hover:border-blue-300 hover:shadow-lg bg-white"
											}
                    `}
										onClick={() => toggleSelection(trial.nct_id)}
									>
										<div className="flex items-stretch">
											<div
												className={`w-1.5 shrink-0 transition-colors ${isSelected ? "bg-blue-500" : "bg-transparent group-hover:bg-slate-200"}`}
											/>

											<div className="p-5 flex-1 flex flex-col sm:flex-row gap-5">
												<div className="pt-1">
													<Checkbox
														checked={isSelected}
														className="data-[state=checked]:bg-blue-600 h-5 w-5 border-slate-300 rounded-md"
													/>
												</div>

												<div className="flex-1 min-w-0 space-y-3">
													<div className="flex flex-wrap items-center justify-between gap-2">
														<div className="flex items-center gap-2">
															<Badge
																className={`${statusColor} border font-medium px-2.5 py-0.5 rounded-full shadow-none`}
															>
																{trial.status}
															</Badge>
															<Badge
																variant="outline"
																className="text-slate-600 border-slate-200 bg-slate-50 font-medium"
															>
																{trial.phase || "N/A"}
															</Badge>
														</div>
														<span className="font-mono text-xs text-slate-400">
															{trial.nct_id}
														</span>
													</div>

													<h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
														{trial.title}
													</h3>

													<div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-600">
														<div className="flex items-center gap-2 min-w-0">
															<Building2 className="h-4 w-4 text-slate-400 shrink-0" />
															<span className="truncate font-medium">
																{trial.organization}
															</span>
														</div>
														<div className="hidden sm:block h-1 w-1 rounded-full bg-slate-300" />
														<div className="flex items-center gap-2 min-w-0 max-w-md">
															<Activity className="h-4 w-4 text-slate-400 shrink-0" />
															<span className="truncate">
																{trial.conditions}
															</span>
														</div>
													</div>

													<div className="pt-2 flex flex-wrap gap-2 items-center">
														<span className="text-xs font-semibold text-slate-400 mr-1 uppercase tracking-wider">
															Interventions:
														</span>
														{interventionTags.map((tag, i) => (
															<Badge
																key={i}
																variant="secondary"
																className="bg-slate-100 text-slate-700 border border-slate-200 font-normal"
															>
																{tag.trim()}
															</Badge>
														))}
														{hasMoreInterventions && (
															<span className="text-xs text-slate-400 font-medium">
																+more
															</span>
														)}
													</div>
												</div>

												<div className="hidden sm:flex items-center justify-center text-slate-300 group-hover:text-blue-400 pl-2">
													<ChevronRight className="h-6 w-6" />
												</div>
											</div>
										</div>
									</Card>
								);
							})}
						</div>

						{filteredTrials.length === 0 && (
							<div className="text-center py-24 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
								<Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />
								<p className="text-slate-600 font-medium text-lg">
									No trials found matching "{searchQuery}"
								</p>
							</div>
						)}
					</div>
				)}

				{/* --- FLOATING ACTION BAR --- */}
				{!isComparing && selectedIds.length > 0 && (
					<div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 w-auto">
						<div className="bg-slate-900 text-white pl-6 pr-2 py-2 rounded-full shadow-2xl flex items-center gap-6 border border-slate-700 ring-4 ring-slate-900/20">
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
									onClick={() => setIsComparing(true)}
									className="gap-2 font-bold bg-white text-slate-900 hover:bg-slate-100"
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
