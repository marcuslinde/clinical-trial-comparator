import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ArrowLeft, Users, FileText, Activity } from "lucide-react";
import type { Trial } from "@/services/api";
import { getStatusStyles } from "@/utils/trialHelpers";

interface ComparisonViewProps {
	trials: Trial[];
	onBack: () => void;
}

const COL_WIDTH = "w-[560px] min-w-[560px] max-w-[560px]";
const LABEL_COL_WIDTH = "w-[160px] min-w-[160px]";

export function ComparisonView({ trials, onBack }: ComparisonViewProps) {
	return (
		<div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
			{/* Header */}
			<div className="flex items-center justify-between mb-4 shrink-0">
				<Button
					variant="ghost"
					onClick={onBack}
					className="gap-2 hover:bg-slate-200 text-slate-600"
				>
					<ArrowLeft className="h-4 w-4" /> Back to Search
				</Button>
				<span className="text-sm text-slate-500">
					Comparing <strong>{trials.length}</strong> trials
				</span>
			</div>

			{/* Table */}
			<div className="flex-1 border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden">
				<ScrollArea className="h-full w-full">
					<Table>
						<TableHeader>
							<TableRow className="border-b border-slate-200 hover:bg-transparent">
								<TableHead
									className={`${LABEL_COL_WIDTH} sticky left-0 top-0 z-50 bg-slate-50 border-r border-slate-200 p-4`}
								>
									<span className="font-bold text-slate-900">Metric</span>
								</TableHead>
								{trials.map((trial) => (
									<TableHead
										key={trial.nct_id}
										className={`${COL_WIDTH} sticky top-0 z-40 bg-slate-50 p-4 align-top border-b border-r border-slate-200`}
									>
										<div className="space-y-3">
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
											<div
												className="font-bold text-slate-900 text-sm truncate"
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
							<ComparisonRow
								label="Design"
								icon={<Users className="w-4 h-4 text-slate-400" />}
							>
								{trials.map((t) => (
									<TableCell
										key={t.nct_id}
										className={`${COL_WIDTH} p-4 align-top border-r border-slate-100`}
									>
										<DataGrid
											items={[
												{ label: "Type", value: t.design },
												{ label: "Phase", value: t.phase },
												{
													label: "Enrollment",
													value: t.enrollment_count
														? `${t.enrollment_count}${t.enrollment_type ? ` (${t.enrollment_type})` : ""}`
														: "N/A",
												},
											]}
										/>
									</TableCell>
								))}
							</ComparisonRow>

							<ComparisonRow
								label="Interventions"
								icon={<Activity className="w-4 h-4 text-slate-400" />}
							>
								{trials.map((t) => (
									<TableCell
										key={t.nct_id}
										className={`${COL_WIDTH} p-4 align-top border-r border-slate-100`}
									>
										<div className="text-sm text-slate-700 space-y-2 whitespace-normal break-words">
											{(t.interventions || "").split(",").map((part, i) => (
												<p key={i}>{part.trim()}</p>
											))}
										</div>
									</TableCell>
								))}
							</ComparisonRow>

							<ComparisonRow
								label="Efficacy"
								icon={<FileText className="w-4 h-4 text-slate-400" />}
							>
								{trials.map((t) => (
									<TableCell
										key={t.nct_id}
										className={`${COL_WIDTH} p-4 align-top border-r border-slate-100`}
									>
										<div className="text-sm text-slate-700 space-y-2 whitespace-normal break-words">
											{t.efficacy.split("||").map((part, i) => (
												<p key={i}>{part.trim()}</p>
											))}
										</div>
									</TableCell>
								))}
							</ComparisonRow>

							<ComparisonRow
								label="Safety"
								icon={<Activity className="w-4 h-4 text-slate-400" />}
							>
								{trials.map((t) => (
									<TableCell
										key={t.nct_id}
										className={`${COL_WIDTH} p-4 align-top border-r border-slate-100`}
									>
										<p className="text-sm text-slate-700 whitespace-normal break-words">
											{t.safety}
										</p>
									</TableCell>
								))}
							</ComparisonRow>
						</TableBody>
					</Table>
					<ScrollBar orientation="horizontal" />
				</ScrollArea>
			</div>
		</div>
	);
}

// Helper components
interface ComparisonRowProps {
	label: string;
	icon: React.ReactNode;
	children: React.ReactNode;
}

function ComparisonRow({ label, icon, children }: ComparisonRowProps) {
	return (
		<TableRow className="hover:bg-transparent border-b border-slate-100">
			<TableCell className="sticky left-0 z-30 bg-white font-semibold text-slate-700 border-r border-slate-100 p-4">
				<div className="flex items-center gap-2">
					{icon} {label}
				</div>
			</TableCell>
			{children}
		</TableRow>
	);
}

interface DataGridProps {
	items: { label: string; value: string }[];
}

function DataGrid({ items }: DataGridProps) {
	return (
		<div className="flex flex-col gap-2 text-sm">
			{items.map((item, i) => (
				<div
					key={i}
					className={`flex justify-between ${i < items.length - 1 ? "border-b border-slate-50 pb-2" : ""}`}
				>
					<span className="text-slate-500 text-xs uppercase">{item.label}</span>
					<span className="font-medium text-slate-900">{item.value}</span>
				</div>
			))}
		</div>
	);
}
