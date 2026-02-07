import { useState } from "react";
import { TRIALS } from "@/data/mockTrials";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
import { Search, ArrowLeft, GitCompare } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";

export default function DashboardHome() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [isComparing, setIsComparing] = useState(false);

	// Filter Logic
	const filteredTrials = TRIALS.filter((trial) => {
		const term = searchQuery.toLowerCase();
		const title = trial.title.toLowerCase();
		const condition = trial.conditions.join(" ").toLowerCase();
		return title.includes(term) || condition.includes(term);
	});

	// Toggle Selection
	const toggleSelection = (id: string) => {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
		);
	};

	// Get Selected Trial Objects
	const selectedTrialsData = TRIALS.filter((t) =>
		selectedIds.includes(t.nct_id),
	);

	return (
		<DashboardLayout>
			<div className="max-w-6xl mx-auto space-y-6">
				{/* --- HEADER --- */}
				<div className="flex flex-col gap-2">
					<h1 className="text-3xl font-bold tracking-tight text-slate-900">
						Clinical Trial Intelligence
					</h1>
					<p className="text-slate-500">
						Search and compare clinical studies across Novo Nordisk therapeutic
						areas.
					</p>
				</div>

				{/* --- VIEW: COMPARISON TABLE --- */}
				{isComparing ? (
					<div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
						<Button
							variant="outline"
							onClick={() => setIsComparing(false)}
							className="gap-2"
						>
							<ArrowLeft className="h-4 w-4" /> Back to Search
						</Button>

						<Card>
							<CardHeader>
								<CardTitle>
									Comparing {selectedTrialsData.length} Trials
								</CardTitle>
							</CardHeader>
							<CardContent>
								<ScrollArea className="w-full whitespace-nowrap rounded-md border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className="w-[200px] bg-slate-50 font-bold">
													Attribute
												</TableHead>
												{selectedTrialsData.map((trial) => (
													<TableHead
														key={trial.nct_id}
														className="min-w-[300px]"
													>
														{trial.nct_id}
													</TableHead>
												))}
											</TableRow>
										</TableHeader>
										<TableBody>
											<TableRow>
												<TableCell className="font-medium">Title</TableCell>
												{selectedTrialsData.map((t) => (
													<TableCell
														key={t.nct_id}
														className="whitespace-normal"
													>
														{t.title}
													</TableCell>
												))}
											</TableRow>
											<TableRow>
												<TableCell className="font-medium">Status</TableCell>
												{selectedTrialsData.map((t) => (
													<TableCell key={t.nct_id}>
														<Badge
															variant={
																t.status === "RECRUITING"
																	? "default"
																	: "secondary"
															}
														>
															{t.status}
														</Badge>
													</TableCell>
												))}
											</TableRow>
											<TableRow>
												<TableCell className="font-medium">Phase</TableCell>
												{selectedTrialsData.map((t) => (
													<TableCell key={t.nct_id}>
														{t.phase || "N/A"}
													</TableCell>
												))}
											</TableRow>
											<TableRow>
												<TableCell className="font-medium">
													Enrollment
												</TableCell>
												{selectedTrialsData.map((t) => (
													<TableCell key={t.nct_id}>
														{t.study_data.enrollment?.toLocaleString() || "N/A"}
													</TableCell>
												))}
											</TableRow>
											<TableRow>
												<TableCell className="font-medium">
													Conditions
												</TableCell>
												{selectedTrialsData.map((t) => (
													<TableCell
														key={t.nct_id}
														className="whitespace-normal"
													>
														{t.conditions.slice(0, 3).join(", ")}
													</TableCell>
												))}
											</TableRow>
										</TableBody>
									</Table>
									<ScrollBar orientation="horizontal" />
								</ScrollArea>
							</CardContent>
						</Card>
					</div>
				) : (
					/* --- VIEW: SEARCH GRID --- */
					<div className="space-y-6">
						<div className="relative">
							<Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
							<Input
								placeholder="Search by drug name, condition, or ID..."
								className="pl-10 h-12 text-lg"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredTrials.map((trial) => {
								const isSelected = selectedIds.includes(trial.nct_id);

								return (
									<Card
										key={trial.nct_id}
										className={`transition-all duration-200 ${isSelected ? "ring-2 ring-slate-900 shadow-lg" : "hover:shadow-md"}`}
									>
										<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
											<div className="space-y-1 pr-2">
												<Badge variant="outline" className="mb-2">
													{trial.nct_id}
												</Badge>
												<CardTitle className="text-base leading-tight">
													{trial.title}
												</CardTitle>
											</div>
											<Checkbox
												checked={isSelected}
												onCheckedChange={() => toggleSelection(trial.nct_id)}
											/>
										</CardHeader>
										<CardContent>
											<p className="text-sm text-slate-500 line-clamp-2">
												{trial.organization}
											</p>
											<div className="flex flex-wrap gap-1 mt-3">
												{trial.conditions.slice(0, 2).map((c) => (
													<Badge
														key={c}
														variant="secondary"
														className="text-xs"
													>
														{c}
													</Badge>
												))}
												{trial.conditions.length > 2 && (
													<span className="text-xs text-slate-400 self-center">
														+more
													</span>
												)}
											</div>
										</CardContent>
										<CardFooter className="flex justify-between border-t p-4 bg-slate-50/50">
											<div className="text-sm font-medium text-slate-700">
												{trial.status}
											</div>
											<div className="text-sm text-slate-500">
												{trial.phase || "N/A"}
											</div>
										</CardFooter>
									</Card>
								);
							})}
						</div>
					</div>
				)}

				{/* --- FLOATING ACTION BAR --- */}
				{!isComparing && selectedIds.length > 1 && (
					<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
						<div className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4">
							<span className="font-medium">
								{selectedIds.length} trials selected
							</span>
							<Button
								size="sm"
								variant="secondary"
								onClick={() => setIsComparing(true)}
								className="gap-2"
							>
								<GitCompare className="h-4 w-4" /> Compare Now
							</Button>
							<Button
								size="icon"
								variant="ghost"
								className="h-6 w-6 rounded-full hover:bg-slate-800 text-slate-400"
								onClick={() => setSelectedIds([])}
							>
								✕
							</Button>
						</div>
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
