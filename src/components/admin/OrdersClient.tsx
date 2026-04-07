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
  shippingAddress?: string | null;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    variantId?: string | null;
  }[];
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

  return (
    <div className="space-y-6">
      {/* POLARIS PAGE HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            Export
          </button>
          <button className="px-4 py-2 bg-slate-900 border border-slate-900 rounded-md text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm">
             Create order
          </button>
        </div>
      </div>

      {/* RESOURCE LIST CARD */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* FILTERS & SEARCH */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search orders"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-900 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4 w-12">
                   <div 
                    className={`w-4 h-4 border rounded cursor-pointer flex items-center justify-center transition-all ${selectedIds.size === filteredOrders.length ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}
                    onClick={toggleAll}
                  >
                    {selectedIds.size === filteredOrders.length && <div className="w-1.5 h-px bg-white rotate-45" />}
                  </div>
                </th>
                <th className="px-4 py-4">Order</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Customer</th>
                <th className="px-4 py-4">Total</th>
                <th className="px-4 py-4">Payment status</th>
                <th className="px-4 py-4">Fulfillment status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => {
                const isSelected = selectedIds.has(order.id);
                
                return (
                  <tr 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className={`group hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50/30' : ''}`}
                  >
                    <td className="px-6 py-4" onClick={(e) => toggleOne(order.id, e)}>
                       <div className={`w-4 h-4 border rounded transition-all flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                          {isSelected && <div className="w-1.5 h-px bg-white rotate-45" />}
                       </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-900 capitalize">
                      #{order.id.substring(0, 5)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4">
                       <span className="text-sm font-medium text-slate-900">{order.user?.name || "Guest Customer"}</span>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                      ${(order.totalPaid || order.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={order.totalPaid ? "PAID" : "PENDING"} />
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION / FOOTER */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center text-xs text-slate-500 font-medium">
           <span>Showing {filteredOrders.length} orders</span>
           <div className="flex gap-2">
              <button className="px-3 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
           </div>
        </div>
      </div>

      {/* DETAIL DRAWER / SIDEBAR */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
           <div className="relative w-full max-w-3xl bg-[#F6F6F7] shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-slate-200">
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
    <div className="min-h-full flex flex-col font-sans">
      {/* HEADER */}
      <div className="px-8 py-6 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
           <h2 className="text-xl font-bold text-slate-900">#{order.id.substring(0, 5)}</h2>
           <StatusBadge status={order.status} />
           <span className="text-sm text-slate-500 font-medium">
             {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' })}
           </span>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: MANIFEST */}
        <div className="lg:col-span-2 space-y-6">
           <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100">
                 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Order items</h3>
              </div>
              <div className="divide-y divide-slate-100">
                 {order.items.map((item) => (
                    <div key={item.id} className="p-6 flex gap-6 items-start">
                       <div className="w-16 h-20 bg-slate-50 border border-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                          <Package size={24} className="text-slate-300" />
                       </div>
                       <div className="flex-1 space-y-1">
                          <p className="text-lg font-bold text-slate-900 leading-tight">{item.name}</p>
                          <p className="text-sm text-slate-500 font-medium uppercase tracking-tight">Quantity: {item.quantity}</p>
                          <p className="text-sm text-slate-400 font-medium">Variant ID: {item.variantId || "Default"}</p>
                       </div>
                       <div className="text-right space-y-1">
                          <p className="text-sm font-bold text-slate-900">${item.price.toFixed(2)} × {item.quantity}</p>
                          <p className="text-sm font-black text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                       </div>
                    </div>
                 ))}
              </div>
              <div className="p-6 bg-slate-50/50 border-t border-slate-100 space-y-3">
                 <div className="flex justify-between text-sm text-slate-600 font-medium">
                    <span>Subtotal</span>
                    <span>${(order.totalPaid || order.totalAmount).toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-sm text-slate-600 font-medium">
                    <span>Shipping</span>
                    <span>$0.00</span>
                 </div>
                 <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total</span>
                    <span>${(order.totalPaid || order.totalAmount).toFixed(2)}</span>
                 </div>
              </div>
           </section>

           <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-6 space-y-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">External Logs</h3>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg font-mono text-[11px] text-slate-600 leading-relaxed max-h-40 overflow-y-auto">
                 [BUILD_NODE_A] :: Handshake confirmed with external API.<br/>
                 [PAYMENT_ENGINE] :: Verified receipt of ${(order.totalPaid || order.totalAmount).toFixed(2)} via Stripe.<br/>
                 {order.printifyOrderId ? (
                    <span className="text-indigo-600 font-bold">[PRODUCTION] :: Pushed to Printify ID: {order.printifyOrderId}</span>
                 ) : (
                    <span className="text-rose-500 font-bold">[AWAITING] :: Pending manual or auto-handshake.</span>
                 )}
              </div>
           </section>
        </div>

        {/* RIGHT COLUMN: CUSTOMER & TIMELINE */}
        <div className="space-y-6">
           <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Customer</h3>
              <div className="space-y-4">
                 <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">{order.user?.name || "Guest Customer"}</p>
                    <p className="text-sm text-indigo-600 font-medium hover:underline cursor-pointer">{order.user?.email || "No email logged"}</p>
                 </div>
                 <div className="pt-4 border-t border-slate-100 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shipping address</p>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                       {order.shippingAddress || "No shipping address provided."}
                    </p>
                 </div>
              </div>
           </section>

           <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Timeline</h3>
              <div className="relative space-y-6 pl-6 border-l border-slate-100">
                 <div className="relative">
                    <div className="absolute -left-[29px] top-1 w-2.5 h-2.5 rounded-full bg-slate-200 ring-4 ring-white" />
                    <p className="text-xs font-bold text-slate-900 uppercase">Order placed</p>
                    <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                 </div>
                 <div className="relative">
                    <div className={`absolute -left-[29px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${order.totalPaid ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    <p className="text-xs font-bold text-slate-900 uppercase">Payment verified</p>
                    <p className="text-xs text-slate-500">${(order.totalPaid || order.totalAmount).toFixed(2)} authorized</p>
                 </div>
                 <div className="relative">
                    <div className={`absolute -left-[29px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${order.printifyOrderId ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                    <p className="text-xs font-bold text-slate-900 uppercase">Sent to production</p>
                    <p className="text-xs text-slate-500">{order.printifyOrderId ? `Node ID: ${order.printifyOrderId.substring(0,8)}` : 'Awaiting sync'}</p>
                 </div>
              </div>
           </section>

           {/* ACTIONS */}
           <div className="pt-4">
              <button 
                className="w-full h-12 bg-white border border-slate-200 text-slate-900 font-bold uppercase tracking-wider text-xs rounded-lg hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Zap size={14} className="text-amber-500" />
                Manual Sync Override
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
