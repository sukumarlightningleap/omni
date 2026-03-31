"use client";

import React, { useState } from "react";
import { Search, ChevronDown, CheckSquare, Square, CreditCard, Package, Truck, Zap, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { forcePushToPrintify } from "@/app/actions/admin/orders";

type OrderData = {
  id: string;
  createdAt: Date;
  user: { name: string | null; email: string };
  status: string;
  totalAmount: number;
  printifyOrderId: string | null;
};

export default function OrdersClient({ initialOrders }: { initialOrders: OrderData[] }) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const filteredOrders = initialOrders.filter((o) =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    (o.user.email && o.user.email.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleAll = () => {
    if (selectedIds.size === filteredOrders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const toggleOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleForcePush = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingIds(prev => new Set(prev).add(id));
    await forcePushToPrintify(id);
    setLoadingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <div className="space-y-6 font-mono text-white">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-black border-b border-[#1A1A1A] pb-4">
        <h2 className="text-sm font-black tracking-[0.2em] uppercase">Order Control Tower</h2>
        <div className="flex gap-4">
          <button className="text-[10px] bg-white text-black font-black uppercase tracking-widest px-6 py-2 hover:bg-neutral-200 transition-colors">
            Create Order
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 bg-black border border-[#1A1A1A] p-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={14} />
          <input
            type="text"
            placeholder="FILTER ORDERS (ID / EMAIL)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-[10px] uppercase tracking-widest text-white pl-10 pr-4 py-2 focus:outline-none placeholder:text-neutral-600"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-[#1A1A1A] text-[10px] uppercase tracking-widest hover:bg-white/5 transition-colors">
          Status <ChevronDown size={12} />
        </button>
      </div>

      {/* High-Density Data Table */}
      <div className="bg-black border border-[#1A1A1A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-[#1A1A1A] bg-[#0A0A0A]">
                <th className="p-3 w-12 text-center cursor-pointer" onClick={toggleAll}>
                  {selectedIds.size === filteredOrders.length && filteredOrders.length > 0 ? (
                    <CheckSquare size={14} className="text-white mx-auto" />
                  ) : (
                    <Square size={14} className="text-neutral-600 hover:text-white mx-auto transition-colors" />
                  )}
                </th>
                <th className="p-3 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Order ID</th>
                <th className="p-3 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Date</th>
                <th className="p-3 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Customer</th>
                <th className="p-3 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Payment Status</th>
                <th className="p-3 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Fulfillment Status</th>
                <th className="p-3 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Total</th>
                <th className="p-3 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const isSelected = selectedIds.has(order.id);
                const isPushing = loadingIds.has(order.id);

                // Derived Mockup for Shopify Parity
                const isPaid = order.status === "PAID" || order.status === "PROCESSING" || order.status === "SHIPPED";
                const fulfillmentStatus = order.status === "SHIPPED" ? "SHIPPED" : order.status === "PROCESSING" ? "PROCESSING" : "UNFULFILLED";

                return (
                  <tr 
                    key={order.id} 
                    className={`border-b border-[#1A1A1A] transition-colors group cursor-pointer ${isSelected ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'}`}
                    onClick={(e) => toggleOne(order.id, e)}
                  >
                    <td className="p-3 text-center">
                      {isSelected ? (
                        <CheckSquare size={14} className="text-white mx-auto" />
                      ) : (
                        <Square size={14} className="text-neutral-600 group-hover:text-white mx-auto transition-colors" />
                      )}
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold text-white group-hover:underline uppercase tracking-widest block">#{order.id.substring(0, 8)}</span>
                    </td>
                    <td className="p-3 text-[10px] text-neutral-400">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] text-white uppercase tracking-widest">{order.user.name || order.user.email}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {isPaid ? <CreditCard size={12} className="text-white" /> : <div className="w-3 h-3 rounded-full border border-neutral-600 shrink-0" />}
                        <StatusBadge status={isPaid ? "PAID" : "PENDING"} />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {fulfillmentStatus === "SHIPPED" ? (
                          <Truck size={12} className="text-blue-500" />
                        ) : fulfillmentStatus === "PROCESSING" ? (
                          <Package size={12} className="text-yellow-500" />
                        ) : (
                          <div className="w-3 h-3 rounded border border-neutral-600 shrink-0" />
                        )}
                        <StatusBadge status={fulfillmentStatus} />
                      </div>
                    </td>
                    <td className="p-3 text-[10px] font-bold text-white uppercase tracking-widest">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-3 text-right">
                      {!order.printifyOrderId && isPaid && (
                        <button 
                          disabled={isPushing}
                          onClick={(e) => handleForcePush(order.id, e)}
                          className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1 border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-colors"
                        >
                          {isPushing ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                          Force Push
                        </button>
                      )}
                      {order.printifyOrderId && (
                        <span className="text-[9px] tracking-widest uppercase text-neutral-600">Synced</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-[10px] uppercase tracking-widest text-neutral-600 bg-[#050505]">
                    NO ORDERS FOUND
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
