import { useState, useEffect } from "react";
import { Terminal, RefreshCw, CheckCircle2, Moon, Cpu, Globe, DollarSign } from "lucide-react";
import { motion } from "motion/react";

interface LoadingStepsProps {
  onCancel?: () => void;
}

interface Step {
  id: number;
  label: string;
  icon: any;
  status: "idle" | "running" | "completed";
  duration: number;
  log: string;
}

export default function LoadingSteps({ onCancel }: LoadingStepsProps) {
  const [steps, setSteps] = useState<Step[]>([
    {
      id: 1,
      label: "Scanning GitHub & Product Hunt",
      icon: Globe,
      status: "running",
      duration: 1800,
      log: "GET /api/scour-market... scanning 14 repositories with similar names (all abandoned since 2023)."
    },
    {
      id: 2,
      label: "Stripping Away 2 A.M. Exaggeration",
      icon: Moon,
      status: "idle",
      duration: 1600,
      log: "Filter out: 'This is the next Uber for custom mechanical keyboard lube API.' Standardizing to realistic SaaS boundaries."
    },
    {
      id: 3,
      label: "Designing Lightweight Architecture Plan",
      icon: Cpu,
      status: "idle",
      duration: 2000,
      log: "WARN: Custom Kubernetes configuration detected. Replacing with Vercel + Supabase free tier to save weekend labor."
    },
    {
      id: 4,
      label: "Evaluating Monetization Potential",
      icon: DollarSign,
      status: "idle",
      duration: 1600,
      log: "Calculating customer acquisition cost vs. likelihood of users requesting refunds for $2/month services."
    }
  ]);

  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "Initializing SideHustle Smoke-Test v1.4.0...",
    "Injecting Gemini API key... Connected to gemini-3.5-flash.",
    "Loading Senior Startup Architect cognitive weights..."
  ]);

  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    if (activeStepIdx >= steps.length) {
      return;
    }

    const currentStep = steps[activeStepIdx];
    
    // Add log immediately upon step activation
    setTerminalLogs(prev => [...prev, `[ACTIVE] ${currentStep.log}`]);

    const stepTimer = setTimeout(() => {
      // Mark current step as completed
      setSteps(prev =>
        prev.map((step, idx) => {
          if (idx === activeStepIdx) {
            return { ...step, status: "completed" };
          }
          if (idx === activeStepIdx + 1) {
            return { ...step, status: "running" };
          }
          return step;
        })
      );
      
      setTerminalLogs(prev => [...prev, `[SUCCESS] Finished: ${currentStep.label}`]);
      setActiveStepIdx(prev => prev + 1);
    }, currentStep.duration);

    return () => clearTimeout(stepTimer);
  }, [activeStepIdx]);

  // Overall progress bar simulation
  useEffect(() => {
    const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);
    const intervalTime = 100;
    const progressStep = (intervalTime / totalDuration) * 95; // Go up to 95% until response arrives

    const progressTimer = setInterval(() => {
      setOverallProgress(prev => {
        if (prev < 95) {
          return Math.min(95, prev + progressStep);
        }
        return prev;
      });
    }, intervalTime);

    return () => clearInterval(progressTimer);
  }, []);

  // Extra funny background logs simulation
  useEffect(() => {
    const funnyLogs = [
      "Buying premium domain name for $12.99... (just kidding, stay strong)",
      "Configuring eslint rules... 453 warnings suppressed.",
      "Optimizing database indices for 10 hypothetically simultaneous users.",
      "Searching for co-founders on HackerNews... found 0 available.",
      "Drafting pitch deck slide 1: 'The Problem with Existing Solutions'...",
      "Brewing fresh server-side caffeine simulation..."
    ];

    const logTimer = setInterval(() => {
      if (activeStepIdx < steps.length) {
        const randomLog = funnyLogs[Math.floor(Math.random() * funnyLogs.length)];
        setTerminalLogs(prev => [...prev, `[PROCESS] ${randomLog}`]);
      }
    }, 1200);

    return () => clearInterval(logTimer);
  }, [activeStepIdx]);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-2xl border border-indigo-100 shadow-md flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-indigo-500 animate-pulse" />
          <div>
            <h3 className="font-display font-semibold text-lg text-slate-900">AI Diagnostic In Progress</h3>
            <p className="text-xs text-slate-500 font-mono">Running realistic feasibility check...</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-slate-400 animate-spin" />
          <span className="text-xs font-mono text-indigo-600">{Math.round(overallProgress)}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500"
          initial={{ width: 0 }}
          animate={{ width: `${overallProgress}%` }}
          transition={{ ease: "easeInOut" }}
        />
      </div>

      {/* Step Grid */}
      <div className="grid gap-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                step.status === "completed"
                  ? "bg-emerald-50/50 border-emerald-100 text-slate-700"
                  : step.status === "running"
                  ? "bg-indigo-50/50 border-indigo-100 text-slate-900 shadow-sm"
                  : "bg-slate-50/30 border-slate-100 text-slate-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    step.status === "completed"
                      ? "bg-emerald-100 text-emerald-600"
                      : step.status === "running"
                      ? "bg-indigo-100 text-indigo-600 animate-pulse"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-display text-sm font-medium">{step.label}</span>
              </div>

              <div>
                {step.status === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-bounce" />
                ) : step.status === "running" ? (
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-600 font-semibold">Analyzing</span>
                  </div>
                ) : (
                  <span className="text-xs font-mono text-slate-400">Pending</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini Console Logs */}
      <div className="bg-slate-950 rounded-xl border border-slate-900 p-4 font-mono text-xs text-slate-300 flex flex-col gap-1.5 max-h-48 overflow-y-auto custom-scrollbar">
        {terminalLogs.map((log, idx) => {
          let style = "text-slate-400";
          if (log.startsWith("[ACTIVE]")) style = "text-indigo-300";
          else if (log.startsWith("[SUCCESS]")) style = "text-emerald-400";
          else if (log.startsWith("[PROCESS]")) style = "text-slate-500 italic";
          else if (log.includes("WARN")) style = "text-amber-400";

          return (
            <div key={idx} className="flex gap-2">
              <span className="text-indigo-500/60 font-semibold select-none">&gt;</span>
              <span className={style}>{log}</span>
            </div>
          );
        })}
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="text-center py-2 px-4 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-xs font-mono border border-slate-200 transition"
        >
          Cancel Diagnostic
        </button>
      )}
    </div>
  );
}
