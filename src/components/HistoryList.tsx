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
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <Bookmark className="w-8 h-8 text-slate-400 mb-2" />
        <span className="text-sm font-display font-medium text-slate-700">No Saved SideHustles</span>
        <p className="text-xs text-slate-500 max-w-[200px] mt-1">
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
        
        let scoreColor = "text-rose-600 border-rose-100 bg-rose-50";
        if (score >= 75) scoreColor = "text-emerald-600 border-emerald-100 bg-emerald-50";
        else if (score >= 45) scoreColor = "text-indigo-600 border-indigo-100 bg-indigo-50";

        return (
          <div
            key={entry.id}
            onClick={() => onSelect(entry)}
            className={`group flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
              isActive
                ? "bg-indigo-50 border-indigo-200 text-slate-900"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`p-2 rounded-lg shrink-0 ${isActive ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600"}`}>
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-display font-medium text-slate-800 truncate leading-tight group-hover:text-indigo-600 transition-colors">
                  {entry.analysis.projectTitle}
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1 truncate">
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
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition"
                title="Delete saved idea"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
