"use client"

import React, { useState } from "react"
import { Search, ChevronDown, Activity, Box, DollarSign } from "lucide-react"
import { StatusBadge } from "@/components/admin/StatusBadge"
import Image from "next/image"

type UnitData = {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  cost: number;
  marginPercent: number;
  unitsSold: number;
  totalProfitGenerated: number;
  status: string;
}

export default function FinanceClient({ items }: { items: UnitData[] }) {
  const [search, setSearch] = useState("")

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
  const formatUSD = (val: number) => `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="space-y-6 font-mono text-white">
      {/* Header Actions */}
      <div className="flex justify-between items-center border-b border-[#1A1A1A] pb-4">
        <h2 className="text-sm font-black tracking-[0.2em] uppercase">Unit Economics Matrix</h2>
        <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#00FF00]">
          <Activity size={12} className="animate-pulse" /> Live Uplink
        </span>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 bg-black border border-[#1A1A1A] p-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={14} />
          <input
            type="text"
            placeholder="FILTER ASSETS BY CLASSIFICATION..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-[10px] uppercase tracking-widest text-white pl-10 pr-4 py-2 focus:outline-none placeholder:text-neutral-600"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-[#1A1A1A] text-[10px] uppercase tracking-widest hover:bg-white/5 transition-colors">
          Sort By: Profit <ChevronDown size={12} />
        </button>
      </div>

      {/* High-Density Data Table */}
      <div className="bg-black border border-[#1A1A1A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-[#1A1A1A] bg-[#0A0A0A]">
                <th className="p-3 w-16 text-center"></th>
                <th className="p-3 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Asset Overview</th>
                <th className="p-3 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Retail Rate</th>
                <th className="p-3 text-[9px] uppercase tracking-[0.2em] text-[#FF4444] font-bold">Base Cost</th>
                <th className="p-3 text-[9px] uppercase tracking-[0.2em] text-[#00FF00] font-bold">Margin %</th>
                <th className="p-3 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold text-center">Velocity (Units)</th>
                <th className="p-3 text-[9px] uppercase tracking-[0.2em] text-[#00FF00] font-bold text-right">Profit Generated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const isHighMargin = item.marginPercent >= 60

                return (
                  <tr 
                    key={item.id} 
                    className="border-b border-[#1A1A1A] hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="p-3 text-center">
                      <div className="w-10 h-10 border border-[#1A1A1A] bg-white/5 flex items-center justify-center shrink-0 relative overflow-hidden">
                        {item.imageUrl && item.imageUrl.includes('http') ? (
                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                        ) : (
                          <Box size={14} className="text-neutral-500" />
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">{item.name}</span>
                        <StatusBadge status={item.status} />
                      </div>
                    </td>
                    <td className="p-3 text-[10px] font-bold text-white uppercase tracking-widest">
                      {formatUSD(item.price)}
                    </td>
                    <td className="p-3 text-[10px] font-bold text-[#FF4444]/80 uppercase tracking-widest">
                      -{formatUSD(item.cost)}
                    </td>
                    <td className="p-3 text-[10px] font-bold uppercase tracking-widest">
                      <span className={isHighMargin ? "text-[#00FF00]" : "text-yellow-500"}>
                        {item.marginPercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3 text-[10px] text-white text-center font-bold">
                      {item.unitsSold}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1 text-[10px] tracking-widest text-[#00FF00] font-black uppercase">
                        <DollarSign size={10} />
                        {item.totalProfitGenerated.toFixed(2)}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[10px] uppercase tracking-widest text-neutral-600 bg-[#050505]">
                    NO FINANCIAL DATA FOUND
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
