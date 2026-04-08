"use client";

import React, { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { motion } from 'framer-motion';
import { ShoppingBag, ShieldCheck, ArrowRight, Loader2, Package, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);

  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout Redirect Failed:", error);
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F6F6F7] pt-40 pb-20 px-6 flex flex-col items-center justify-center space-y-8">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-neutral-200 shadow-sm border border-neutral-100">
          <ShoppingBag size={48} />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-black font-display">Your Cart is Empty</h1>
          <p className="text-neutral-400 text-[10px] uppercase font-bold tracking-[0.3em]">No acquisitions identified in your current session.</p>
        </div>
        <Link 
          href="/collections" 
          className="px-12 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-neutral-800 transition-all shadow-lg active:scale-95"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F7] pt-40 pb-20 px-6 md:px-12 font-sans text-black">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Order Review Section */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-black font-display">
                Order Review
              </h1>
              <p className="text-neutral-400 text-[10px] uppercase font-bold tracking-[0.4em]">
                Acquisition Clearance Node • {items.length} {items.length === 1 ? 'Item' : 'Items'} Ready
              </p>
            </motion.div>

            <div className="bg-white border border-neutral-200 rounded-[40px] p-8 md:p-10 shadow-sm space-y-8">
              <div className="space-y-6">
                {items.map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex gap-6 items-center border-b border-neutral-50 pb-6 last:border-0 last:pb-0"
                  >
                    <div className="w-24 h-24 bg-neutral-100 rounded-[30px] overflow-hidden flex-shrink-0 relative border border-neutral-200/50">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    <div className="flex-grow space-y-1">
                      <h3 className="text-sm font-black uppercase italic tracking-wider text-black">{item.name}</h3>
                      <div className="flex justify-between items-center text-[10px] text-neutral-400 uppercase font-black tracking-widest pt-1">
                        <span>Quantity: {item.quantity}</span>
                        <span className="text-black">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 bg-white/50 border border-neutral-200/50 rounded-[30px] p-6">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-black">Secure SSL Encryption</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-400">Identity protected by verified protocol</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/50 border border-neutral-200/50 rounded-[30px] p-6">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Package size={20} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-black">Express Logistics</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-400">Global production tracking enabled</p>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-neutral-200 rounded-[50px] p-10 shadow-sm space-y-10 sticky top-40">
              <div className="space-y-6">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-black font-display border-b border-neutral-50 pb-6">Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-[11px] uppercase font-black tracking-widest text-neutral-400">
                    <span>Subtotal</span>
                    <span className="text-black">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] uppercase font-black tracking-widest text-neutral-400">
                    <span>Logistics</span>
                    <span className="text-black italic">Calculated at Checkout</span>
                  </div>
                  <div className="flex justify-between text-xl font-black uppercase italic tracking-tighter text-black pt-6 border-t border-neutral-100">
                    <span>Total Estimated</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  disabled={isLoading}
                  onClick={handleCheckout}
                  className="w-full bg-black text-white text-[11px] font-black uppercase tracking-[0.4em] py-6 rounded-[30px] hover:bg-neutral-800 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      Proceed to Secure Payment
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                <p className="text-center text-[9px] text-neutral-400 uppercase font-black tracking-widest">
                  Authentication and Shipping collected by Stripe Verified
                </p>
              </div>

              <div className="pt-6 border-t border-neutral-50 flex items-center justify-center gap-8 opacity-40">
                <CheckCircle2 size={16} />
                <CheckCircle2 size={16} />
                <CheckCircle2 size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
