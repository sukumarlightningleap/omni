import React from "react";

export function StatusBadge({ status }: { status: string }) {
  const norm = status.toUpperCase();
  let baseColor = "text-neutral-500 border-neutral-200 bg-neutral-50"; 

  switch (norm) {
    case "ACTIVE":
    case "PAID":
    case "DELIVERED":
      baseColor = "text-emerald-700 border-emerald-200 bg-emerald-50 font-bold shadow-sm shadow-emerald-100";
      break;
    case "SHIPPED":
    case "IN TRANSIT":
      baseColor = "text-blue-700 border-blue-200 bg-blue-50 font-bold";
      break;
    case "CANCELLED":
    case "ARCHIVED":
    case "FAILED":
      baseColor = "text-rose-700 border-rose-200 bg-rose-50 font-bold";
      break;
    case "PROCESSING":
    case "PENDING":
      baseColor = "text-amber-700 border-amber-200 bg-amber-50 font-bold";
      break;
    case "DRAFT":
      baseColor = "text-indigo-700 border-indigo-200 bg-indigo-50 font-bold animate-pulse";
      break;
  }

  return (
    <span className={`inline-flex items-center text-[10px] uppercase tracking-[0.05em] px-3 py-1 border rounded-full whitespace-nowrap transition-all duration-300 ${baseColor}`}>
      <div className={`w-1 h-1 rounded-full mr-2 ${norm === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-current opacity-40'}`} />
      {norm}
    </span>
  );
}
