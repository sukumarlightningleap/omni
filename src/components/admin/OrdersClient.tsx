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
    <div className="space-y-8 font-sans text-neutral-900">
      {/* Header Actions */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Orders Hub</h2>
          <p className="text-sm text-neutral-500 mt-1">Monitor fulfillment, tracking, and customer logistics across all channels.</p>
        </div>
        <div className="flex gap-3">
          <button className="text-xs font-semibold px-5 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-all flex items-center gap-2 shadow-sm">
            Export Records
          </button>
          <button className="text-xs bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            Create Manual Order
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-neutral-200/60 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          <input
            type="text"
            placeholder="Search orders by ID or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-neutral-900 pl-11 pr-4 py-2 focus:outline-none placeholder:text-neutral-400"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-neutral-50 border border-neutral-100 text-xs font-semibold rounded-lg hover:bg-neutral-100 transition-all text-neutral-600">
          Status <ChevronDown size={14} className="text-neutral-400" />
        </button>
      </div>

      {/* High-Density Data Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-neutral-100">
                <th className="p-4 w-12 text-center cursor-pointer" onClick={toggleAll}>
                  {selectedIds.size === filteredOrders.length && filteredOrders.length > 0 ? (
                    <CheckSquare size={18} className="text-indigo-600 mx-auto" />
                  ) : (
                    <Square size={18} className="text-neutral-300 hover:text-neutral-400 mx-auto transition-colors" />
                  )}
                </th>
                <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Order ID</th>
                <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Customer</th>
                <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Payment Status</th>
                <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Fulfillment</th>
                <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total</th>
                <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredOrders.map((order) => {
                const isSelected = selectedIds.has(order.id);
                const isPushing = loadingIds.has(order.id);
                
                const isPaid = order.status === "PAID" || order.status === "PROCESSING" || order.status === "SHIPPED";
                const fulfillmentStatus = order.status === "SHIPPED" ? "SHIPPED" : order.status === "PROCESSING" ? "PROCESSING" : "UNFULFILLED";

                return (
                  <tr 
                    key={order.id} 
                    className={`group transition-all duration-200 cursor-pointer ${isSelected ? 'bg-indigo-50/30' : 'hover:bg-neutral-50/80'}`}
                    onClick={(e) => toggleOne(order.id, e)}
                  >
                    <td className="p-4 text-center">
                      {isSelected ? (
                        <CheckSquare size={18} className="text-indigo-600 mx-auto" />
                      ) : (
                        <Square size={18} className="text-neutral-200 group-hover:text-neutral-300 mx-auto transition-colors" />
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors tracking-tight">#{order.id.substring(0, 8)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-neutral-900">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-medium mt-0.5">
                          {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-neutral-900 tracking-tight">{order.user.name || "Guest"}</span>
                        <span className="text-[10px] text-neutral-400 font-medium truncate max-w-[150px] mt-0.5">{order.user.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={isPaid ? "PAID" : "PENDING"} />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={fulfillmentStatus} />
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-neutral-900 tracking-tight">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-4 text-right">
                      {!order.printifyOrderId && isPaid && (
                        <button 
                          disabled={isPushing}
                          onClick={(e) => handleForcePush(order.id, e)}
                          className="inline-flex items-center gap-2 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all shadow-sm shadow-amber-50"
                        >
                          {isPushing ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                          Propagate
                        </button>
                      )}
                      {order.printifyOrderId && (
                        <div className="flex items-center justify-end gap-1.5 text-neutral-400">
                          <CheckSquare size={14} className="text-emerald-500" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Synced</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center border border-neutral-100">
                        <Search size={24} className="text-neutral-300" />
                      </div>
                      <p className="text-sm font-semibold text-neutral-400">No matching orders identified.</p>
                    </div>
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
