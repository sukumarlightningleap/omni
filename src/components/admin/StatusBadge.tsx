import React from "react";

export function StatusBadge({ status }: { status: string }) {
  const norm = status.toUpperCase();
  let baseColor = "text-neutral-400 border-neutral-800 bg-neutral-900/50"; 
  let glowColor = "rgba(163, 163, 163, 0.2)";

  switch (norm) {
    case "PAID":
    case "PLACED":
      baseColor = "text-blue-400 border-blue-500/30 bg-blue-500/10 font-bold shadow-[0_0_10px_rgba(59,130,246,0.1)]";
      glowColor = "rgba(59, 130, 246, 0.5)";
      break;
    case "DELIVERED":
      baseColor = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 font-bold shadow-[0_0_10px_rgba(52,211,153,0.1)]";
      glowColor = "rgba(52, 211, 153, 0.5)";
      break;
    case "SHIPPED":
      baseColor = "text-purple-400 border-purple-500/30 bg-purple-500/10 font-bold shadow-[0_0_10px_rgba(168,85,247,0.1)]";
      glowColor = "rgba(168, 85, 247, 0.5)";
      break;
    case "CANCELLED":
    case "FAILED":
    case "MANUAL_INTERVENTION_REQUIRED":
      baseColor = "text-rose-400 border-rose-500/30 bg-rose-500/10 font-bold shadow-[0_0_10px_rgba(244,63,94,0.1)] animate-pulse";
      glowColor = "rgba(244, 63, 94, 0.5)";
      break;
    case "PROCESSING":
      baseColor = "text-amber-400 border-amber-500/30 bg-amber-500/10 font-bold shadow-[0_0_10px_rgba(251,191,36,0.1)]";
      glowColor = "rgba(251, 191, 36, 0.5)";
      break;
  }

  return (
    <span className={`inline-flex items-center text-[9px] font-mono uppercase tracking-[0.1em] px-2.5 py-1 border rounded-sm whitespace-nowrap transition-all duration-300 ${baseColor}`}>
      <div className={`w-1 h-1 rounded-full mr-2 shadow-[0_0_4px_currentColor]`} style={{ backgroundColor: glowColor }} />
      {norm === 'MANUAL_INTERVENTION_REQUIRED' ? 'INTERVENTION REQ' : norm}
    </span>
  );
}
