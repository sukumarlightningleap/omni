"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCcw, Save, Loader2, Package, MapPin, Hash, Network } from "lucide-react";
import { fetchPrintifyTracking, updateOrderStatus } from "@/app/actions/admin/orders";
import { OrderStatus } from "@prisma/client";

export default function OrderDetailDrawer({ order, onClose }: { order: any; onClose: () => void }) {
  const [status, setStatus] = useState<OrderStatus>("PENDING");
  const [notes, setNotes] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setNotes(order.internalNotes || "");
    }
  }, [order]);

  if (!order) return null;

  const handleSyncPrintify = async () => {
    if (!order.printifyOrderId) {
      alert("NO PRINTIFY CIPHER ATTACHED TO THIS ORDER.");
      return;
    }
    
    setIsSyncing(true);
    try {
      const res = await fetchPrintifyTracking(order.id);
      if (res.success) {
        setStatus("SHIPPED");
      }
      // We would ideally notify success, but the UI updates natively 
    } catch {
      alert("FAILED TO SYNC WITH LOGISTICS NETWORK.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateOrderStatus(order.id, status, notes);
    } catch {
      alert("FAILED TO COMMIT CHANGES TO THE DATABASE.");
    } finally {
      setIsSaving(false);
      onClose(); // Auto-close drawer on successful commit
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex justify-end"
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-black border-l border-white/10 h-full overflow-y-auto font-mono flex flex-col"
        >
          {/* Drawer Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur z-10">
            <div className="space-y-1">
              <h2 className="text-white text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Network size={14} className="text-neutral-500" />
                Network Intel
              </h2>
              <p className="text-[9px] text-neutral-500 tracking-[0.3em] uppercase">ID: {order.id}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 border border-white/10 hover:bg-white/10 transition-colors text-white"
            >
              <X size={14} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 flex-1 space-y-10">
            
            {/* Logistics Sync */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-b border-white/10 pb-2">Tracking Protocols</h3>
              
              <div className="bg-white/[0.02] border border-white/10 p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Hash size={14} className="text-neutral-500" />
                  <div className="space-y-1 w-full">
                    <p className="text-[8px] uppercase tracking-widest text-neutral-600">Printify Identity Code</p>
                    <p className="text-xs text-white tracking-widest">
                      {order.printifyOrderId || "AWAITING FULFILLMENT ASSIGNMENT"}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleSyncPrintify}
                  disabled={isSyncing || !order.printifyOrderId}
                  className="w-full py-3 border border-white/10 text-[9px] text-white uppercase tracking-[0.3em] font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSyncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
                  Ping Printify Network
                </button>
              </div>
            </div>

            {/* Manual Status Override */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-b border-white/10 pb-2">Status Coordinator</h3>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className={`w-full bg-black border text-[10px] uppercase tracking-[0.2em] p-4 focus:outline-none transition-colors appearance-none cursor-pointer font-bold ${
                  status === 'PAID' ? 'text-green-500 border-green-500/30' : 
                  status === 'SHIPPED' ? 'text-blue-500 border-blue-500/30' : 
                  status === 'CANCELLED' ? 'text-red-500 border-red-500/30' : 
                  status === 'PROCESSING' ? 'text-yellow-500 border-yellow-500/30' : 
                  'text-neutral-300 border-white/20'
                }`}
              >
                {["PENDING", "PAID", "PROCESSING", "SHIPPED", "CANCELLED"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Destination Vector */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-b border-white/10 pb-2">Destination Vector</h3>
              <div className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/10">
                <MapPin size={14} className="text-neutral-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-neutral-300 leading-relaxed tracking-wider uppercase">
                  {order.shippingAddress || "NO DESTINATION RECORDED. DIGITAL DELIVERY ONLY."}
                </p>
              </div>
            </div>

            {/* Cart Manifest */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-b border-white/10 pb-2">Cart Manifest</h3>
              <div className="space-y-2">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-start justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] px-2 transition-colors">
                    <div className="flex items-center gap-3">
                      <Package size={12} className="text-neutral-600" />
                      <div>
                        <p className="text-[10px] text-white tracking-widest uppercase">{item.product.name}</p>
                        <p className="text-[8px] text-neutral-600 tracking-widest mt-1">QTY: {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {order.items.length === 0 && (
                  <p className="text-[9px] text-neutral-600 tracking-widest uppercase py-4">Manifest Empty.</p>
                )}
              </div>
            </div>

            {/* Internal Authored Notes */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-b border-white/10 pb-2">Internal Authored Intel</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="APPEND OPERATION NOTES HERE..."
                className="w-full h-32 bg-black border border-white/10 text-[10px] p-4 text-white focus:border-white transition-colors rounded-none placeholder:text-neutral-700 uppercase tracking-widest resize-none custom-scrollbar"
              />
            </div>
            
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-6 border-t border-white/10 bg-black sticky bottom-0 z-10">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-white text-black py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-200 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Commit Configuration
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
