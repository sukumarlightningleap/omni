"use client";

import React, { useState } from "react";
import { Search, ChevronDown, CheckSquare, Square, CreditCard, Package, Truck, Zap, Loader2, X } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { forcePushToPrintify, fetchPrintifyTracking } from "@/app/actions/admin/orders";

type OrderData = {
  id: string;
  createdAt: Date;
  user: { name: string | null; email: string } | null;
  status: string;
  totalAmount: number;
  totalPaid?: number | null;
  printifyOrderId: string | null;
  trackingNumber?: string | null;
};

export default function OrdersClient({ initialOrders }: { initialOrders: OrderData[] }) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  const filteredOrders = initialOrders.filter((o) =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    (o.user?.email && o.user.email.toLowerCase().includes(search.toLowerCase()))
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
    <div className="min-h-screen bg-[#050505] text-[#a3a3a3] font-mono p-6 space-y-6">
      {/* HIGH-CONTRAST TECHNICAL HEADER */}
      <div className="flex justify-between items-end border-b border-neutral-900 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-px animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <h1 className="text-white text-xl font-black uppercase tracking-[0.25em]">Command_Center.v2</h1>
          </div>
          <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-[0.3em]">
            ZERO-TOUCH FULFILLMENT // TOTAL FISCAL CLARITY
          </p>
        </div>
        <div className="flex gap-6 text-right">
          <div className="space-y-1">
            <p className="text-[8px] text-neutral-700 uppercase tracking-widest">Net_Yield</p>
            <p className="text-emerald-400 text-sm font-black tracking-tighter">+$1,240.50</p>
          </div>
          <div className="space-y-1">
            <p className="text-[8px] text-neutral-700 uppercase tracking-widest">System_State</p>
            <p className="text-white text-sm font-black flex items-center gap-2 justify-end">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> NOMINAL
            </p>
          </div>
        </div>
      </div>

      {/* FILTER STACK */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-emerald-500 transition-colors" size={14} />
          <input
            type="text"
            placeholder="[ SEARCH_REGISTRY_ID_OR_OPERATOR ]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black border border-neutral-900 text-[11px] text-white pl-12 pr-4 py-3 focus:outline-none focus:border-neutral-700 transition-all placeholder:text-neutral-800 tracking-widest uppercase"
          />
        </div>
        <div className="flex border border-neutral-900 overflow-hidden rounded-sm">
           <button className="px-4 py-2 bg-neutral-900/50 hover:bg-neutral-800 text-[9px] font-black text-neutral-500 hover:text-white uppercase tracking-widest transition-all">Export_Report</button>
           <button className="px-4 py-2 bg-neutral-900/50 border-l border-neutral-900 hover:bg-neutral-800 text-[9px] font-black text-neutral-500 hover:text-white uppercase tracking-widest transition-all">Audit_Log</button>
        </div>
      </div>

      {/* HIGH-DENSITY DATA GRID */}
      <div className="border border-neutral-900 bg-black overflow-hidden shadow-2xl">
        <table className="w-full text-left table-fixed">
          <thead className="bg-neutral-900/40 text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] border-b border-neutral-900">
            <tr>
              <th className="p-4 w-12 text-center">
                <div 
                  className={`w-3 h-3 border mx-auto cursor-pointer transition-all ${selectedIds.size === filteredOrders.length ? 'border-emerald-500 bg-emerald-500' : 'border-neutral-800'}`}
                  onClick={toggleAll}
                />
              </th>
              <th className="p-4 w-1/6">Order_ID</th>
              <th className="p-4 w-1/4">Customer_Name</th>
              <th className="p-4 w-1/8">Amount_($)</th>
              <th className="p-4 w-1/6">Printify_Status</th>
              <th className="p-4 w-1/8">_Track</th>
              <th className="p-4 text-right w-1/8">_Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900/30">
            {filteredOrders.map((order) => {
              const isSelected = selectedIds.has(order.id);
              const isPushing = loadingIds.has(order.id);
              const hasTracking = !!order.trackingNumber;
              
              return (
                <tr 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className={`group transition-all duration-75 text-[11px] ${isSelected ? 'bg-emerald-500/5' : 'hover:bg-neutral-900/40 cursor-pointer'}`}
                >
                  <td className="p-4 text-center" onClick={(e) => toggleOne(order.id, e)}>
                    <div className={`w-3 h-3 border mx-auto transition-all ${isSelected ? 'border-emerald-500 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'border-neutral-800 group-hover:border-neutral-700'}`} />
                  </td>
                  <td className="p-4">
                    <span className="text-white font-black tracking-widest uppercase">0x{order.id.substring(0, 8)}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-0.5">
                       <span className="text-neutral-200 font-bold uppercase truncate">{order.user?.name || "LOG_GUEST"}</span>
                       <span className="text-[9px] text-neutral-700 lowercase truncate">{order.user?.email || "anon_op@unrwly.com"}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-emerald-400 font-black">${(order.totalPaid || order.totalAmount).toFixed(2)}</span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={order.printifyOrderId ? (order.status === "SHIPPED" ? "SHIPPED" : "PROCESSING") : "PENDING"} />
                  </td>
                  <td className="p-4">
                    {hasTracking ? (
                      <a 
                        href={`https://unruly.aftership.com/${order.trackingNumber}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white hover:text-emerald-400 font-bold underline decoration-neutral-800 underline-offset-4 flex items-center gap-1.5 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Truck size={10} />
                        {order.trackingNumber?.substring(0, 8)}...
                      </a>
                    ) : (
                      <span className="text-neutral-800 italic">WAIT_SHIP</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-3">
                      {!order.printifyOrderId && (
                        <button 
                          disabled={isPushing}
                          onClick={(e) => handleForcePush(order.id, e)}
                          className="text-amber-500 hover:text-amber-400 transition-colors uppercase font-black tracking-tighter"
                        >
                          {isPushing ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                        </button>
                      )}
                      <ChevronDown size={12} className="text-neutral-700 group-hover:text-white transition-colors" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* DETAIL SIDEBAR */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
           <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedOrder(null)} />
           <div className="relative w-full max-w-2xl bg-black border-l border-neutral-900 p-10 overflow-y-auto animate-in slide-in-from-right duration-300">
              <OrderDetailDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
           </div>
        </div>
      )}
    </div>
  );
}

function OrderDetailDrawer({ order: initialOrder, onClose }: { order: OrderData; onClose: () => void }) {
  const [order, setOrder] = useState(initialOrder);

  React.useEffect(() => {
    if (order.printifyOrderId && !order.status.includes('SHIPPED')) {
      const timer = setTimeout(async () => {
        const result = await fetchPrintifyTracking(order.id);
        if (result.success) {
           // Reload or local state sync
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [order.id, order.printifyOrderId, order.status]);

  return (
    <div className="space-y-10 font-mono">
      <div className="flex justify-between items-start border-b border-neutral-900 pb-8">
        <div>
          <h2 className="text-white text-2xl font-black uppercase tracking-[0.3em]">Registry_Update</h2>
          <p className="text-[10px] text-neutral-600 mt-2 uppercase tracking-widest font-bold">
            Record_Index: 0x{order.id} // Operator: {order.user?.name || "GUEST"}
          </p>
        </div>
        <button onClick={onClose} className="p-2 border border-neutral-900 text-neutral-600 hover:text-white transition-all">
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-neutral-900/20 border border-neutral-900 p-6 space-y-2">
            <span className="text-[8px] text-neutral-700 uppercase tracking-widest block font-black">Fiscal_Verified</span>
            <span className="text-2xl font-black text-white tracking-tighter">${(order.totalPaid || order.totalAmount).toFixed(2)}</span>
        </div>
        <div className="bg-neutral-900/20 border border-neutral-900 p-6 space-y-2 col-span-2">
            <span className="text-[8px] text-neutral-700 uppercase tracking-widest block font-black">Production_Node_Status</span>
            <div className="flex items-center gap-3">
               <div className={`w-2 h-2 rounded-px ${order.printifyOrderId ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-800'}`} />
               <span className="text-sm font-black text-white uppercase tracking-widest">
                  {order.printifyOrderId ? `SYNCED_TO_NODE_0x${order.printifyOrderId.substring(0,8)}` : 'AWAITING_PRODUCTION_HANDSHAKE'}
               </span>
            </div>
        </div>
      </div>

      <div className="space-y-4">
         <div className="flex items-center gap-3 text-neutral-600">
            <div className="h-px flex-1 bg-neutral-900" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em]">Historical_Logs</span>
            <div className="h-px flex-1 bg-neutral-900" />
         </div>
         <div className="bg-neutral-950 border border-neutral-800 p-6 h-48 overflow-y-auto uppercase text-[10px] space-y-3">
            <div className="flex gap-4">
               <span className="text-neutral-700">[ {new Date(order.createdAt).toISOString()} ]</span>
               <span className="text-blue-500">FISCAL_GENESIS: ORDER_CREATED_SUCCESS</span>
            </div>
            {order.printifyOrderId && (
              <div className="flex gap-4">
                <span className="text-neutral-700">[ {new Date().toISOString()} ]</span>
                <span className="text-emerald-500">PRODUCTION_INIT: PRINTIFY_HANDSHAKE_COMPLETE</span>
              </div>
            )}
            <div className="flex gap-4">
               <span className="text-neutral-700">[ ... ]</span>
               <span className="text-neutral-500 animate-pulse underline decoration-neutral-800 underline-offset-4">LISTENING_FOR_CARRIER_SIGNAL...</span>
            </div>
         </div>
      </div>

      <div className="pt-6">
        <button className="w-full bg-[#ff3f6c] hover:bg-[#ff1f50] text-white font-black py-4 uppercase tracking-[0.3em] text-[11px] transition-all shadow-[0_4px_20px_rgba(255,63,108,0.2)]">
          Manual_Override_System
        </button>
      </div>
    </div>
  );
}
