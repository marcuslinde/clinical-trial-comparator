import { Button } from "@/components/ui/button";
import { GitCompare } from "lucide-react";

interface SelectionBarProps {
  count: number;
  onCompare: () => void;
  onClear: () => void;
}

export function SelectionBar({ count, onCompare, onClear }: SelectionBarProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="bg-slate-900 text-white pl-6 pr-2 py-2 rounded-full shadow-2xl flex items-center gap-6 border border-slate-700">
        <div className="flex flex-col">
          <span className="font-bold text-sm">Selection Active</span>
          <span className="text-xs text-slate-400">{count} trials selected</span>
        </div>
        <div className="flex gap-2">
          <Button
            disabled={count < 2}
            size="sm"
            onClick={onCompare}
            className="gap-2 font-bold bg-white text-slate-900 hover:bg-slate-100"
          >
            <GitCompare className="h-4 w-4" />
            {count < 2 ? "Select 2+ to Compare" : "Compare Now"}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full hover:bg-slate-800 text-slate-400"
            onClick={onClear}
          >
            ✕
          </Button>
        </div>
      </div>
    </div>
  );
}
