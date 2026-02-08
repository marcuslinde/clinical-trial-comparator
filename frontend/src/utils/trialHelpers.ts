// Styling utilities for trial data

export function getStatusStyles(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("completed")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (s.includes("recruiting") || s.includes("active")) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  if (s.includes("terminated") || s.includes("withdrawn")) {
    return "bg-red-50 text-red-700 border-red-200";
  }
  return "bg-slate-100 text-slate-600 border-slate-200";
}

export function getSafetyBadgeVariant(safetyText: string = ""): "outline" | "destructive" | "secondary" {
  if (safetyText.includes("No Results")) return "outline";
  if (safetyText.includes("Serious Events") || safetyText.includes("SAE Rate")) {
    return "destructive";
  }
  return "secondary";
}
