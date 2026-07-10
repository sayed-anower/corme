import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Cpu,
  Coins,
  ShieldAlert,
  ListChecks,
  Bookmark,
  Send,
  Copy,
  Check,
  Moon,
  Lightbulb,
  ArrowUpRight,
  Users,
  TrendingUp,
  Compass,
  HelpCircle,
  ExternalLink,
  History,
  Trash2,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SmokeTestAnalysis } from "./types";
import { EXAMPLE_IDEAS, generateMarkdownReport } from "./utils";
import Gauge from "./components/Gauge";
import LoadingSteps from "./components/LoadingSteps";
import HistoryList from "./components/HistoryList";

interface SavedEntry {
  id: string;
  timestamp: string;
  originalIdea: string;
  analysis: SmokeTestAnalysis;
}

export default function App() {
  // Input form state
  const [idea, setIdea] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [budget, setBudget] = useState("");
  const [timeCommitment, setTimeCommitment] = useState("");

  // UI Flow State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SmokeTestAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Local Storage Saved Runs
  const [savedEntries, setSavedEntries] = useState<SavedEntry[]>([]);
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null);

  // Growth Roadmap Checked Actions
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({});

  // Markdown Report Copy State
  const [copiedReport, setCopiedReport] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load Saved Entries on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sidehustle_smoketest_saved");
      if (stored) {
        setSavedEntries(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved analyses from localStorage:", e);
    }
  }, []);

  // Save entries helper
  const updateSavedEntries = (newEntries: SavedEntry[]) => {
    setSavedEntries(newEntries);
    try {
      localStorage.setItem("sidehustle_smoketest_saved", JSON.stringify(newEntries));
    } catch (e) {
      console.error("Failed to save entries to localStorage:", e);
    }
  };

  // Trigger brief toast message
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Submit idea to server for analysis
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;

    setIsAnalyzing(true);
    setErrorMsg(null);
    setAnalysisResult(null);
    setActiveSavedId(null);
    setCheckedActions({});

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea,
          targetAudience: targetAudience.trim() || undefined,
          budget: budget.trim() || undefined,
          timeCommitment: timeCommitment.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server failed to analyze the idea.");
      }

      const data: SmokeTestAnalysis = await response.json();
      setAnalysisResult(data);
      triggerToast("Smoke-test analysis completed successfully!");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to communicate with the AI model. Check your server.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Fill in suggestion preset
  const selectPreset = (preset: typeof EXAMPLE_IDEAS[0]) => {
    setIdea(preset.idea);
    setTargetAudience(preset.audience);
    setBudget(preset.budget);
    setTimeCommitment(preset.timeCommitment);
    setErrorMsg(null);
  };

  // Save current analysis to history
  const handleSaveResult = () => {
    if (!analysisResult) return;

    // Check if already saved
    if (savedEntries.some(entry => entry.analysis.projectTitle === analysisResult.projectTitle)) {
      triggerToast("Idea already saved under this title!");
      return;
    }

    const newEntry: SavedEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      originalIdea: idea,
      analysis: analysisResult,
    };

    const updated = [newEntry, ...savedEntries];
    updateSavedEntries(updated);
    setActiveSavedId(newEntry.id);
    triggerToast(`"${analysisResult.projectTitle}" saved to history tray.`);
  };

  // Load a saved analysis
  const handleLoadSaved = (entry: SavedEntry) => {
    setAnalysisResult(entry.analysis);
    setIdea(entry.originalIdea);
    setTargetAudience(entry.analysis.marketData.targetAudienceSize || "");
    setBudget(entry.analysis.techArchitecture.developmentComplexity || "");
    setTimeCommitment("");
    setActiveSavedId(entry.id);
    setCheckedActions({});
    window.scrollTo({ top: 350, behavior: "smooth" });
    triggerToast(`Loaded saved report: ${entry.analysis.projectTitle}`);
  };

  // Delete saved entry
  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = savedEntries.filter(entry => entry.id !== id);
    updateSavedEntries(filtered);
    if (activeSavedId === id) {
      setActiveSavedId(null);
    }
    triggerToast("Idea removed from history.");
  };

  // Copy Markdown README to clipboard
  const handleCopyMarkdown = async () => {
    if (!analysisResult) return;
    const md = generateMarkdownReport(analysisResult, idea);
    try {
      await navigator.clipboard.writeText(md);
      setCopiedReport(true);
      triggerToast("Markdown report copied to clipboard!");
      setTimeout(() => setCopiedReport(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
      triggerToast("Failed to copy markdown. Please select and copy manually.");
    }
  };

  // Get passion vs feasibility interpretation text and category
  const getMatrixEvaluation = (feasibility: number, passion: number) => {
    if (feasibility >= 65 && passion >= 65) {
      return {
        label: "The Golden Unicorn",
        desc: "High demand, low complexity, and maximum passion. You've struck absolute late-night developer gold. Start coding immediately.",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      };
    } else if (feasibility < 50 && passion >= 70) {
      return {
        label: "The Labor of Love",
        desc: "Technically a nightmare or logistically brutal, but you are deeply passionate. This is a classic long-term challenge. Perfect if you want to learn, risky as a rapid commercial hussle.",
        color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
      };
    } else if (feasibility >= 70 && passion < 50) {
      return {
        label: "The Pragmatic Utility",
        desc: "Super easy to build, but you have medium-to-low passion. You will likely get bored of this in 3 weeks. Try to automate the product fully or partner with an operator.",
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
      };
    } else {
      return {
        label: "The 2 A.M. Mirage",
        desc: "High complexity and low genuine excitement once the caffeine wears off. We suggest setting this idea aside and sleeping on it. You've avoided wasting months!",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      };
    }
  };

  const matrixEval = analysisResult
    ? getMatrixEvaluation(analysisResult.feasibilityScore, analysisResult.passionMultiplier)
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Dev Weekend Challenge Ribbon */}
      <div className="bg-indigo-600 text-white text-[11px] font-mono py-1.5 px-4 text-center tracking-widest uppercase flex items-center justify-center gap-1.5 border-b border-indigo-500">
        <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-300" />
        Built for the <a href="https://dev.to/devteam/join-our-dev-weekend-challenge-passion-edition-1000-in-prizes-across-five-winners-submissions-10j5" target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-200 inline-flex items-center gap-0.5 font-bold">#DevWeekend Challenge <ExternalLink className="w-3 h-3" /></a>
      </div>

      {/* Hero Header Area */}
      <header className="relative py-12 px-6 max-w-7xl mx-auto overflow-hidden">
        {/* Glow ambient decorations */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute top-0 right-10 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl -z-10" />

        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-indigo-400 mb-6">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
            </span>
            Late-Night Project Feasibility Engine
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
            SideHustle <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Smoke-Test</span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed">
            Diagnose whether your passionate late-night side-project idea actually has commercial legs, or if you're just blinded by excitement. Instantly generate competitors, architectures, and monetization roadmaps.
          </p>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Input Form and Templates (span 5) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-900/85 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4 mb-5">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-slate-100">Describe Your Idea</h2>
                <p className="text-xs text-slate-400">Draft your passionate, raw 2 A.M. vision</p>
              </div>
            </div>

            <form onSubmit={handleAnalyze} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase font-mono tracking-wider text-slate-400 flex items-center justify-between">
                  <span>The Raw Project Idea <span className="text-indigo-400 font-bold">*</span></span>
                  <span className="text-[10px] text-slate-500 font-normal">Messy text welcome</span>
                </label>
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="e.g. A lightweight sticker for coffee mugs with a Raspberry Pi that sends a webhook Slack alert when the coffee drops to the perfect temperature range (130-140F)..."
                  className="w-full h-32 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm placeholder-slate-600 transition text-slate-200 outline-none resize-none"
                  required
                />
              </div>

              {/* Optional Advanced Tuning */}
              <div className="border-t border-slate-800 pt-4 flex flex-col gap-4">
                <h3 className="text-xs uppercase font-mono tracking-wider text-indigo-400">Optional Diagnostics Tuning</h3>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-slate-400 font-mono">Target Audience</label>
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g. Remote software engineers, tea enthusiasts"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs focus:border-indigo-500 transition text-slate-200 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-slate-400 font-mono">Budget Constraint</label>
                      <input
                        type="text"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="e.g. Under $100 / $0 SaaS free-tiers"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs focus:border-indigo-500 transition text-slate-200 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-slate-400 font-mono">Time Commit</label>
                      <input
                        type="text"
                        value={timeCommitment}
                        onChange={(e) => setTimeCommitment(e.target.value)}
                        placeholder="e.g. Weekend hack / 4 hours a week"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs focus:border-indigo-500 transition text-slate-200 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAnalyzing || !idea.trim()}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 rounded-xl font-display font-semibold text-sm text-white transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-indigo-600/10"
              >
                <Send className="w-4 h-4" />
                {isAnalyzing ? "Smoking the Code..." : "Run SideHustle Smoke-Test"}
              </button>
            </form>
          </div>

          {/* Quickstart Preset Templates */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5">
            <h3 className="text-xs uppercase font-mono tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
              Not inspired yet? Load a preset
            </h3>
            <div className="flex flex-col gap-2">
              {EXAMPLE_IDEAS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => selectPreset(preset)}
                  className="flex items-start text-left p-2.5 rounded-lg bg-slate-950/40 border border-slate-900 hover:border-indigo-500/30 hover:bg-slate-900 transition gap-2.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-indigo-400" />
                  <div className="min-w-0">
                    <span className="font-display font-semibold text-slate-300 block mb-0.5">{preset.title}</span>
                    <p className="truncate text-[11px] text-slate-500">{preset.idea}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Saved History Side Panel */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs uppercase font-mono tracking-widest text-slate-500 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-indigo-400" />
                Saved Concept History ({savedEntries.length})
              </h3>
            </div>
            <HistoryList
              entries={savedEntries}
              activeId={activeSavedId}
              onSelect={handleLoadSaved}
              onDelete={handleDeleteSaved}
            />
          </div>
        </section>

        {/* RIGHT COLUMN: Results Display Panel (span 7) */}
        <section className="lg:col-span-7 flex flex-col gap-6">

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 flex items-start gap-3.5 text-rose-300 text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <strong className="block font-semibold mb-1">Diagnostic Failed</strong>
                {errorMsg}
              </div>
            </div>
          )}

          {/* Analyzing State Loading */}
          {isAnalyzing && (
            <LoadingSteps onCancel={() => setIsAnalyzing(false)} />
          )}

          {/* Initial Clean State */}
          {!isAnalyzing && !analysisResult && !errorMsg && (
            <div className="bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 p-12 text-center flex flex-col items-center justify-center min-h-[450px]">
              <div className="w-16 h-16 bg-slate-900 border border-slate-800 text-indigo-400 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
                <Moon className="w-8 h-8 animate-pulse text-indigo-400" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-200">Awaiting 2 A.M. Inspiration</h3>
              <p className="text-slate-500 text-sm max-w-sm mt-2">
                Type your side-project concept on the left, load one of our wacky developer presets, or inspect past diagnostics to begin.
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-md mt-6">
                <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 text-left">
                  <span className="text-xs font-mono text-indigo-400 block mb-1">REAL COMPETITORS</span>
                  <p className="text-[11px] text-slate-400">AI maps out true business models and status-quo alternatives.</p>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 text-left">
                  <span className="text-xs font-mono text-indigo-400 block mb-1">LEAN ARCHITECTURE</span>
                  <p className="text-[11px] text-slate-400">Saves you from over-engineering with highly realistic stack outlines.</p>
                </div>
              </div>
            </div>
          )}

          {/* Diagnostic Result Dashboard */}
          {!isAnalyzing && analysisResult && (
            <div className="flex flex-col gap-6">

              {/* Header Reality Card */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950/20 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <span className="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-500/20">
                    Smoke-Test Completed
                  </span>
                </div>

                <div className="flex items-start gap-4 pr-16">
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {analysisResult.projectTitle}
                    </h2>
                    <p className="text-indigo-300 font-display italic text-sm mt-1">
                      &ldquo;{analysisResult.tagline}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Sardonically honest verdict box */}
                <div className="mt-6 bg-slate-950/80 rounded-xl border border-slate-800/80 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs uppercase font-mono tracking-widest text-slate-500">The 2 A.M. Verdict</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed font-sans">
                    {analysisResult.analysisSummary}
                  </p>
                </div>

                {/* Utility Export & Save bar */}
                <div className="flex items-center justify-between border-t border-slate-800 mt-5 pt-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveResult}
                      className={`py-1.5 px-3.5 rounded-lg border text-xs font-medium font-display transition flex items-center gap-1.5 cursor-pointer ${
                        activeSavedId
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-default"
                          : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                      }`}
                      disabled={!!activeSavedId}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      {activeSavedId ? "Saved in History" : "Save Concept"}
                    </button>
                    <button
                      onClick={handleCopyMarkdown}
                      className="py-1.5 px-3.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 text-xs font-medium font-display transition flex items-center gap-1.5 cursor-pointer"
                      title="Copy DEV.to readme submission template"
                    >
                      {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedReport ? "Copied!" : "Export README"}
                    </button>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    Press README to copy DEV.to challenge draft
                  </span>
                </div>
              </div>

              {/* Passion vs Feasibility Score Section */}
              <div className="bg-slate-900/85 rounded-2xl border border-slate-800 p-6 shadow-xl">
                <h3 className="text-xs uppercase font-mono tracking-widest text-slate-500 border-b border-slate-800 pb-3 mb-5 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  Passion vs. Feasibility Matrix
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="flex justify-around items-center gap-4">
                    <Gauge
                      value={analysisResult.feasibilityScore}
                      label="Feasibility"
                      subtitle="Easy Build"
                      color="cyan"
                      size="md"
                    />
                    <Gauge
                      value={analysisResult.passionMultiplier}
                      label="Excitement"
                      subtitle="Pure Grit"
                      color="rose"
                      size="md"
                    />
                  </div>

                  {/* Quadrant Category verdict */}
                  {matrixEval && (
                    <div className={`p-4 rounded-xl border ${matrixEval.color} flex flex-col gap-2`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Idea Category</span>
                        <span className="h-1 w-1 rounded-full bg-slate-500" />
                        <span className="text-xs font-bold font-display">{matrixEval.label}</span>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-300">
                        {matrixEval.desc}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Competitor Reality Grid */}
              <div className="bg-slate-900/85 rounded-2xl border border-slate-800 p-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
                  <h3 className="text-xs uppercase font-mono tracking-widest text-slate-500 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    Market Landscape & Alternatives
                  </h3>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-400 font-mono">
                    <TrendingUp className="w-3 h-3" /> Demand Score: {analysisResult.marketData.demandScore}%
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 mb-2">
                    <span className="text-[10px] font-mono uppercase text-indigo-400 block mb-1">Target Beachhead Market</span>
                    <p className="text-xs text-slate-300 font-medium">{analysisResult.marketData.targetAudienceSize}</p>
                  </div>

                  <span className="text-xs font-mono uppercase text-slate-500 mb-1 block">Current Competitors / Alternatives</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysisResult.competitors.map((comp, idx) => (
                      <div key={idx} className="bg-slate-950/40 rounded-xl border border-slate-800/80 p-4 flex flex-col justify-between">
                        <div>
                          <span className="text-sm font-display font-semibold text-slate-200 block mb-2">{comp.name}</span>
                          <div className="mb-2">
                            <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-400 block">Their Strength</span>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">{comp.strength}</p>
                          </div>
                          <div className="mb-2">
                            <span className="text-[9px] uppercase font-mono tracking-widest text-rose-400 block font-semibold">Their Flaw</span>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">{comp.weakness}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                          <span className="text-[10px] font-mono text-indigo-300 block font-medium">Your 10x Angle:</span>
                          <p className="text-[11px] italic text-indigo-200 mt-1 leading-normal">{comp.differentiationAngle}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 bg-slate-950/40 rounded-xl border border-slate-800 p-4">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block mb-2">Relevant Market Macro Trends</span>
                    <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {analysisResult.marketData.marketTrends.map((trend, idx) => (
                        <li key={idx} className="text-xs text-slate-400 flex items-start gap-2 leading-relaxed">
                          <span className="text-indigo-400 font-bold shrink-0 mt-0.5">•</span>
                          <span>{trend}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Technical Architecture Blueprint */}
              <div className="bg-slate-900/85 rounded-2xl border border-slate-800 p-6 shadow-xl">
                <h3 className="text-xs uppercase font-mono tracking-widest text-slate-500 border-b border-slate-800 pb-3 mb-5 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  Technical Blueprint & Architecture
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Blueprint info */}
                  <div className="md:col-span-2 flex flex-col gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-2">Recommended Lean Tech Stack</span>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.techArchitecture.recommendedStack.map((tech, idx) => (
                          <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1">Architecture Overview</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {analysisResult.techArchitecture.architectureOverview}
                      </p>
                    </div>
                  </div>

                  {/* Right metrics */}
                  <div className="flex flex-col gap-3 bg-slate-950/40 rounded-xl border border-slate-800 p-4 justify-center">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Dev Complexity</span>
                      <span className="block text-sm font-semibold text-white font-display mt-0.5">
                        {analysisResult.techArchitecture.developmentComplexity}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Estimated MVP Build</span>
                      <span className="block text-sm font-semibold text-cyan-400 font-display mt-0.5">
                        {analysisResult.techArchitecture.estimatedBuildTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key architectural risks */}
                <div className="mt-4 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                  <span className="text-xs uppercase font-mono tracking-wider text-rose-400 flex items-center gap-1 mb-2">
                    <ShieldAlert className="w-3.5 h-3.5" /> Technical Risks & Pitfalls
                  </span>
                  <ul className="text-xs text-slate-400 flex flex-col gap-2">
                    {analysisResult.techArchitecture.keyRisks.map((risk, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-rose-500 font-bold shrink-0">!</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Monetization Strategy Grid */}
              <div className="bg-slate-900/85 rounded-2xl border border-slate-800 p-6 shadow-xl">
                <h3 className="text-xs uppercase font-mono tracking-widest text-slate-500 border-b border-slate-800 pb-3 mb-5 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-indigo-400" />
                  Monetization Matrix
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResult.monetization.map((money, idx) => {
                    const potentialColor =
                      money.revenuePotential === "High"
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : money.revenuePotential === "Medium"
                        ? "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
                        : "text-slate-400 bg-slate-800 border-slate-700";

                    return (
                      <div key={idx} className="bg-slate-950/50 rounded-xl border border-slate-800/80 p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span className="font-display font-bold text-sm text-slate-200">
                              {money.model}
                            </span>
                            <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full border ${potentialColor}`}>
                              {money.revenuePotential} Revenue
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed font-sans">
                            {money.description}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-800/50 flex justify-between items-center">
                          <span className="text-[10px] font-mono text-slate-500">Difficulty</span>
                          <span className="text-[11px] font-mono text-slate-300 font-semibold">{money.difficulty}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Roadmap Phase List */}
              <div className="bg-slate-900/85 rounded-2xl border border-slate-800 p-6 shadow-xl">
                <h3 className="text-xs uppercase font-mono tracking-widest text-slate-500 border-b border-slate-800 pb-3 mb-5 flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-indigo-400" />
                  Lean Growth & Launch Roadmap
                </h3>

                <div className="flex flex-col gap-5">
                  {analysisResult.growthRoadmap.map((milestone, mIdx) => (
                    <div key={mIdx} className="bg-slate-950/40 rounded-xl border border-slate-800 p-4">
                      <div className="flex justify-between items-center border-b border-slate-800/60 pb-2 mb-3">
                        <span className="text-xs font-display font-bold text-slate-200">{milestone.phase}</span>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/5 border border-cyan-500/20 px-2 py-0.5 rounded">
                          {milestone.timeline}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        {milestone.actions.map((action, aIdx) => {
                          const actionKey = `${mIdx}-${aIdx}`;
                          const isChecked = !!checkedActions[actionKey];

                          return (
                            <div
                              key={aIdx}
                              onClick={() => setCheckedActions(prev => ({ ...prev, [actionKey]: !isChecked }))}
                              className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition ${
                                isChecked
                                  ? "bg-indigo-500/5 text-slate-400"
                                  : "hover:bg-slate-900 text-slate-300"
                              }`}
                            >
                              <div className={`mt-0.5 shrink-0 w-4 h-4 border rounded flex items-center justify-center transition-all ${
                                isChecked
                                  ? "bg-indigo-500 border-indigo-500 text-slate-950"
                                  : "border-slate-700"
                              }`}>
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className={`text-xs leading-normal font-sans ${isChecked ? "line-through opacity-60" : ""}`}>
                                {action}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hard Reality-Check Reflection Questions */}
              <div className="bg-slate-900/85 rounded-2xl border border-slate-800 p-6 shadow-xl">
                <h3 className="text-xs uppercase font-mono tracking-widest text-slate-500 border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  Honest Reality-Check Questions
                </h3>
                <p className="text-xs text-slate-500 leading-normal mb-4 font-sans">
                  The AI startup veteran suggests answering these honestly before committing your next weekend to this idea.
                </p>

                <div className="flex flex-col gap-3.5">
                  {analysisResult.realityCheckQuestions.map((question, idx) => (
                    <div key={idx} className="flex gap-3 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                      <span className="text-sm font-mono text-indigo-400 font-bold">0{idx + 1}.</span>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed font-sans">{question}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </section>

      </main>

      {/* Floating toast notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 py-3 px-5 rounded-xl bg-slate-900 text-slate-100 border border-indigo-500/30 shadow-2xl flex items-center gap-2.5 font-sans"
          >
            <div className="p-1 rounded bg-indigo-500/20 text-indigo-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footnote */}
      <footer className="border-t border-slate-900 py-8 px-6 mt-12 text-center text-slate-600 text-xs font-mono">
        <p>&copy; 2026 SideHustle Smoke-Test. Driven securely via Google Gemini 3.5-flash. Happy Hacking!</p>
      </footer>

    </div>
  );
}
