"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import OrderDetailDrawer from "./OrderDetailDrawer";

type OrderData = {
  id: string;
  user: { name: string | null; email: string };
  status: any;
  totalAmount: number;
  printifyOrderId: string | null;
  shippingAddress: string | null;
  internalNotes: string | null;
  createdAt: Date;
  items: any[];
};

export default function OrderControlClient({ initialOrders }: { initialOrders: OrderData[] }) {
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  const filteredOrders = initialOrders.filter((o) => 
    o.id.toLowerCase().includes(search.toLowerCase()) || 
    (o.user.email && o.user.email.toLowerCase().includes(search.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PAID': return 'text-green-500 border-green-500/30 bg-green-500/10';
      case 'SHIPPED': return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
      case 'CANCELLED': return 'text-red-500 border-red-500/30 bg-red-500/10';
      case 'PROCESSING': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
      case 'PENDING': return 'text-neutral-300 border-neutral-500/30 bg-neutral-500/10';
      default: return 'text-neutral-400 border-white/20';
    }
  };

  return (
    <div className="space-y-8 font-mono">
      {/* Search Protocol */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={16} />
        <input
          type="text"
          placeholder="SEARCH LOGISTICS FOR ORDER ID OR EMAIL..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black border border-white/20 text-[10px] px-12 py-4 text-white focus:outline-none focus:border-white transition-colors rounded-none placeholder:text-neutral-600 uppercase tracking-widest"
        />
      </div>

      {/* Analytics Matrix */}
      <div className="bg-black border border-white/10 overflow-hidden text-white shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-normal">Order Cipher</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-normal">Customer</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-normal">Ledger Date (UTC)</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-normal">Gross Value</th>
                <th className="p-4 text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-normal">Network Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  <td className="p-4">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-normal group-hover:text-blue-400 transition-colors">
                      {order.id.split('-')[0]}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-xs uppercase tracking-widest">{order.user.name || "UNIDENTIFIED"}</p>
                    <p className="text-[9px] text-neutral-500 tracking-widest mt-1 opacity-80">{order.user.email}</p>
                  </td>
                  <td className="p-4 text-[10px] uppercase tracking-widest text-neutral-400">
                    {new Date(order.createdAt).toISOString().split('T')[0]} <span className="opacity-50">/</span> {new Date(order.createdAt).toISOString().split('T')[1].substring(0, 5)}
                  </td>
                  <td className="p-4 text-[10px] tracking-[0.2em] uppercase text-white font-black">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span className={`text-[8px] uppercase tracking-[0.2em] px-3 py-1.5 border font-bold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[10px] uppercase tracking-[0.2em] text-neutral-600 bg-white/[0.01]">
                    NO NETWORK ACTIVITY DETECTED.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Drawer Shell */}
      <OrderDetailDrawer 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
      />
    </div>
  );
}
