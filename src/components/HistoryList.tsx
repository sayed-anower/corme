import React from "react";
import { Trash2, FileText, ChevronRight, Bookmark } from "lucide-react";
import { SmokeTestAnalysis } from "../types";

interface SavedEntry {
  id: string;
  timestamp: string;
  originalIdea: string;
  analysis: SmokeTestAnalysis;
}

interface HistoryListProps {
  entries: SavedEntry[];
  activeId: string | null;
  onSelect: (entry: SavedEntry) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export default function HistoryList({ entries, activeId, onSelect, onDelete }: HistoryListProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
        <Bookmark className="w-8 h-8 text-slate-700 mb-2" />
        <span className="text-sm font-display text-slate-400">No Saved SideHustles</span>
        <p className="text-xs text-slate-600 max-w-[200px] mt-1">
          Once you analyze an idea, save it to compare side-by-side!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-h-[450px] overflow-y-auto custom-scrollbar pr-1">
      {entries.map(entry => {
        const isActive = activeId === entry.id;
        const score = entry.analysis.feasibilityScore;
        
        let scoreColor = "text-rose-400 border-rose-500/20 bg-rose-500/5";
        if (score >= 75) scoreColor = "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
        else if (score >= 45) scoreColor = "text-indigo-400 border-indigo-500/20 bg-indigo-500/5";

        return (
          <div
            key={entry.id}
            onClick={() => onSelect(entry)}
            className={`group flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
              isActive
                ? "bg-indigo-500/10 border-indigo-500/50 text-slate-100"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900/90 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`p-2 rounded-lg shrink-0 ${isActive ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-400"}`}>
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-display font-medium text-slate-200 truncate leading-tight group-hover:text-indigo-300 transition-colors">
                  {entry.analysis.projectTitle}
                </span>
                <span className="text-[10px] font-mono text-slate-500 mt-1 truncate">
                  {new Date(entry.timestamp).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${scoreColor}`}>
                {score}% Feasible
              </span>
              <button
                onClick={(e) => onDelete(entry.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-rose-500/10 hover:text-rose-400 text-slate-600 transition"
                title="Delete saved idea"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
