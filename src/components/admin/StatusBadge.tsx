import React from "react";

export function StatusBadge({ status }: { status: string }) {
  const norm = status.toUpperCase();
  let baseColor = "text-neutral-400 border-white/20 bg-white/5"; // default

  switch (norm) {
    case "ACTIVE":
    case "PAID":
    case "DELIVERED":
      baseColor = "text-black border-white bg-white font-black"; // Solid white for active per spec
      break;
    case "SHIPPED":
    case "IN TRANSIT":
      baseColor = "text-blue-500 border-blue-500/30 bg-blue-500/10";
      break;
    case "CANCELLED":
    case "ARCHIVED":
    case "FAILED":
      baseColor = "text-red-500 border-red-500/30 bg-red-500/10";
      break;
    case "PROCESSING":
    case "PENDING":
      baseColor = "text-yellow-500 border-yellow-500/30 bg-yellow-500/10";
      break;
    case "DRAFT":
      baseColor = "text-yellow-500 border-yellow-500 bg-yellow-500/10 animate-pulse"; // Pulsing yellow per spec
      break;
  }

  return (
    <span className={`inline-flex items-center text-[8px] uppercase tracking-[0.2em] px-2 py-1 border font-bold rounded-none whitespace-nowrap ${baseColor}`}>
      {norm}
    </span>
  );
}
