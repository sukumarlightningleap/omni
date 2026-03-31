"use client"

import React from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, Activity, DollarSign } from "lucide-react"

type AnalyticsData = {
  grossRevenue: number;
  productionCost: number;
  stripeFeeEstimate: number;
  netProfit: number;
  graphData: { date: string; revenue: number; orders: number }[];
  liveTickerTotal: number;
}

export default function AnalyticsClient({ data }: { data: AnalyticsData }) {
  // Formatters
  const formatUSD = (val: number) => `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="space-y-8 font-mono text-white">
      <div className="flex justify-between items-center border-b border-[#1A1A1A] pb-4">
        <h2 className="text-sm font-black tracking-[0.2em] uppercase">Profit Engine</h2>
        <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#00FF00]">
          <Activity size={12} className="animate-pulse" /> Live Uplink
        </span>
      </div>

      {/* High-Impact Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 border border-[#1A1A1A] bg-black group hover:bg-[#050505] transition-colors relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <DollarSign size={100} />
          </div>
          <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2">Gross Processing Volume</h3>
          <p className="text-2xl font-black tracking-widest">{formatUSD(data.grossRevenue)}</p>
        </div>

        <div className="p-6 border border-[#1A1A1A] bg-black group hover:bg-[#050505] transition-colors relative overflow-hidden">
          <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2">Omnidrop Baseline Costs</h3>
          <p className="text-2xl font-black tracking-widest text-neutral-400">-{formatUSD(data.productionCost + data.stripeFeeEstimate)}</p>
          <div className="mt-2 text-[8px] uppercase tracking-[0.2em] text-neutral-600">
            Prod: {formatUSD(data.productionCost)} | Gate: {formatUSD(data.stripeFeeEstimate)}
          </div>
        </div>

        <div className="p-6 border border-[#00FF00]/30 bg-[#00FF00]/5 group hover:bg-[#00FF00]/10 transition-colors relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={100} className="text-[#00FF00]" />
          </div>
          <h3 className="text-[10px] uppercase tracking-widest text-[#00FF00]/60 font-bold mb-2">Net Profit Realized</h3>
          <p className="text-2xl font-black tracking-widest text-[#00FF00]">{formatUSD(data.netProfit)}</p>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="p-6 border border-[#1A1A1A] bg-black">
        <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-6">30-Day Revenue vs Volume</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.graphData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#666" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                yAxisId="left"
                stroke="#666" 
                fontSize={10}
                tickFormatter={(value) => `$${value}`}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#333" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dx={10}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: "#000", border: "1px solid #1A1A1A", borderRadius: "0px", boxSizing: "border-box" }}
                itemStyle={{ color: "#FFF", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}
                labelStyle={{ color: "#666", fontSize: "10px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.1em" }}
                formatter={(value: any, name: any) => {
                  if (name === "revenue") return [formatUSD(value), "Gross"]
                  return [value, "Volume"]
                }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                stroke="#00FF00" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: "#00FF00", stroke: "#000", strokeWidth: 2 }}
              />
              <Line 
                yAxisId="right"
                type="stepAfter" 
                dataKey="orders" 
                stroke="#333" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
