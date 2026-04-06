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
  isAssigned: boolean;
}

export default function FinanceClient({ items }: { items: UnitData[] }) {
  const [search, setSearch] = useState("")

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
  const formatUSD = (val: number) => `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="space-y-12 font-sans text-neutral-900">
      {/* Header - Integrated */}
      <div className="flex justify-between items-end mb-8">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 italic">Unit Economics</h2>
          <p className="text-sm text-neutral-500 font-medium">Analyze asset performance, base costs, and profit velocity.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
          <Activity size={12} className="animate-pulse" /> Live Uplink
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 p-4 bg-white border border-neutral-200/60 rounded-3xl shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Filter assets by classification or marketing name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-100 text-sm font-bold text-neutral-900 pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-neutral-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:bg-neutral-50 transition-all">
          Sort By: Profit <ChevronDown size={14} />
        </button>
      </div>

      {/* High-Density Data Table */}
      <div className="bg-white border border-neutral-200/60 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="p-4 w-20 text-center"></th>
                <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-black">Asset Overview</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-black">Retail price</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-rose-400 font-black">Base Production Cost</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-black">Margin percentage</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-black text-center">Velocity (Units)</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-black text-right">Profit generated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const isHighMargin = item.marginPercent >= 60

                return (
                  <tr 
                    key={item.id} 
                    className="hover:bg-neutral-50/50 transition-colors group border-b border-neutral-100 last:border-0"
                  >
                    <td className="p-5 text-center">
                      <div className="w-14 h-14 border border-neutral-100 bg-neutral-50 rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform">
                        {item.imageUrl && item.imageUrl.includes('http') ? (
                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                        ) : (
                          <Box size={20} className="text-neutral-300" />
                        )}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-black text-neutral-900 font-sans uppercase italic tracking-tight">{item.name}</span>
                        <StatusBadge status={item.status} />
                      </div>
                    </td>
                    <td className="p-5 text-sm font-black text-neutral-900 tracking-tight">
                      {formatUSD(item.price)}
                    </td>
                    <td className="p-5 text-sm font-black text-rose-500 tracking-tight">
                      -{formatUSD(item.cost)}
                    </td>
                    <td className="p-5">
                      <div className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black tracking-widest ${isHighMargin ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`}>
                        {item.marginPercent.toFixed(1)}%
                      </div>
                    </td>
                    <td className="p-5 text-sm text-neutral-900 text-center font-black">
                      {item.unitsSold}
                    </td>
                    <td className="p-5 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-black rounded-xl border border-indigo-100">
                        <DollarSign size={14} className="text-indigo-400" />
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
