import { Search } from "lucide-react";

export function EmptyState() {
  return (
    <div className="text-center py-24 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
      <Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />
      <p className="text-slate-600 font-medium text-lg">
        Enter a keyword to start your research
      </p>
    </div>
  );
}
