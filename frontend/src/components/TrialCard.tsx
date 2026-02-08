import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Activity, Bookmark } from "lucide-react";
import type { Trial } from "@/services/api";
import { getStatusStyles } from "@/utils/trialHelpers";

interface TrialCardProps {
	trial: Trial;
	isSelected: boolean;
	onToggle: (id: string) => void;
}

export function TrialCard({ trial, isSelected, onToggle }: TrialCardProps) {
	const interventions = (trial.interventions || "")
		.split(",")
		.filter(Boolean)
		.slice(0, 3);
	const hasMore = (trial.interventions || "").split(",").length > 3;

	return (
		<Card
			className={`group relative cursor-pointer transition-all duration-200 border rounded-xl overflow-hidden
        ${isSelected ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/10" : "border-slate-200 hover:border-blue-300 hover:shadow-md bg-white"}
      `}
			onClick={() => onToggle(trial.nct_id)}
		>
			<div className="flex items-stretch">
				<div
					className={`w-1.5 shrink-0 ${isSelected ? "bg-blue-500" : "bg-transparent group-hover:bg-slate-200"}`}
				/>

				<div className="p-5 flex-1 flex flex-col sm:flex-row gap-5">
					{/* Actions Column */}
					<div className="pt-1 flex flex-col gap-4 items-center">
						<Checkbox
							checked={isSelected}
							className="data-[state=checked]:bg-blue-600 h-5 w-5"
						/>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 text-slate-400 hover:text-blue-500"
							onClick={(e) => {
								e.stopPropagation();
								console.log("Save trial", trial.nct_id);
							}}
						>
							<Bookmark className="h-4 w-4" />
						</Button>
					</div>

					{/* Content */}
					<div className="flex-1 min-w-0 space-y-3">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<div className="flex items-center gap-2">
								<Badge
									className={`${getStatusStyles(trial.status)} border font-medium px-2.5 py-0.5 rounded-full shadow-none`}
								>
									{trial.status}
								</Badge>
								<Badge
									variant="outline"
									className="text-slate-600 border-slate-200 bg-slate-50 font-medium"
								>
									{trial.phase}
								</Badge>
							</div>
							<span className="font-mono text-xs text-slate-400">
								{trial.nct_id}
							</span>
						</div>

						<h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-700">
							{trial.title}
						</h3>

						<div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-600">
							<div className="flex items-center gap-2 min-w-0">
								<Building2 className="h-4 w-4 text-slate-400 shrink-0" />
								<span className="truncate font-medium">
									{trial.organization}
								</span>
							</div>
							<div className="flex items-center gap-2 min-w-0 max-w-md">
								<Activity className="h-4 w-4 text-slate-400 shrink-0" />
								<span className="truncate">{trial.conditions}</span>
							</div>
						</div>

						{interventions.length > 0 && (
							<div className="pt-2 flex flex-wrap gap-2 items-center">
								{interventions.map((tag, i) => (
									<Badge
										key={i}
										variant="secondary"
										className="bg-slate-100 text-slate-700 border border-slate-200 font-normal"
									>
										{tag.trim()}
									</Badge>
								))}
								{hasMore && (
									<span className="text-xs text-slate-400 font-medium">
										+more
									</span>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</Card>
	);
}
