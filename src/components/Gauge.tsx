import { useEffect, useState } from "react";
import { motion } from "motion/react";

interface GaugeProps {
  value: number;
  label: string;
  subtitle?: string;
  color: "cyan" | "indigo" | "rose" | "emerald";
  size?: "sm" | "md" | "lg";
}

export default function Gauge({ value, label, subtitle, color, size = "md" }: GaugeProps) {
  const [offset, setOffset] = useState(0);

  // Gauge configurations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (value / 100) * circumference;

  useEffect(() => {
    // Trigger smooth loading animation
    const timer = setTimeout(() => {
      setOffset(progressOffset);
    }, 150);
    return () => clearTimeout(timer);
  }, [value, progressOffset]);

  const colorThemes = {
    cyan: {
      stroke: "stroke-cyan-500",
      text: "text-cyan-600",
      bg: "bg-cyan-500/10",
      glow: "shadow-[0_0_15px_rgba(6,182,212,0.15)]",
      border: "border-cyan-200",
    },
    indigo: {
      stroke: "stroke-indigo-500",
      text: "text-indigo-600",
      bg: "bg-indigo-500/10",
      glow: "shadow-[0_0_15px_rgba(99,102,241,0.15)]",
      border: "border-indigo-200",
    },
    rose: {
      stroke: "stroke-rose-500",
      text: "text-rose-600",
      bg: "bg-rose-500/10",
      glow: "shadow-[0_0_15px_rgba(244,63,94,0.15)]",
      border: "border-rose-200",
    },
    emerald: {
      stroke: "stroke-emerald-500",
      text: "text-emerald-600",
      bg: "bg-emerald-500/10",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
      border: "border-emerald-200",
    },
  };

  const theme = colorThemes[color];

  const sizeClasses = {
    sm: {
      box: "w-28 h-28",
      circleSize: 120,
      centerText: "text-xl",
      labelStyle: "text-xs",
    },
    md: {
      box: "w-36 h-36",
      circleSize: 140,
      centerText: "text-3xl font-bold",
      labelStyle: "text-sm",
    },
    lg: {
      box: "w-44 h-44",
      circleSize: 180,
      centerText: "text-4xl font-extrabold",
      labelStyle: "text-base font-medium",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className={`relative flex items-center justify-center ${currentSize.box}`}>
        {/* Glow effect backdrops */}
        <div className={`absolute inset-4 rounded-full ${theme.bg} blur-xl opacity-60`} />

        {/* SVG Circular Dial */}
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 120 120"
        >
          {/* Background circle track */}
          <circle
            className="text-slate-100 stroke-current"
            strokeWidth="8"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
          />
          {/* Animated active path */}
          <circle
            className={`${theme.stroke} stroke-current transition-all duration-1000 ease-out`}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset === 0 ? circumference : offset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
          />
        </svg>

        {/* Center Text (Value & Label) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono tracking-tighter text-slate-950 ${currentSize.centerText}`}>
            {value}
            <span className="text-sm font-normal text-slate-400">%</span>
          </span>
          {subtitle && (
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      <span className={`mt-3 font-display font-medium text-slate-700 ${currentSize.labelStyle}`}>
        {label}
      </span>
    </div>
  );
}
