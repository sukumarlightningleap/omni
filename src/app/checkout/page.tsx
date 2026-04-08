"use client";

import React, { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { motion } from 'framer-motion';
import { ShoppingBag, ShieldCheck, ArrowRight, Loader2, Package, CheckCircle2, Lock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items } = useCartStore();
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
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* LEFT PANE: PRODUCT LISTING */}
          <div className="lg:col-span-7 space-y-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-black font-display leading-[0.9]">
                Final<br />Review
              </h1>
              <p className="text-neutral-400 text-[11px] uppercase font-bold tracking-[0.4em]">
                Acquisition Manifest • {items.length} Units Ready
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6">
              {items.map((item, idx) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white border border-neutral-200/60 rounded-[40px] p-6 flex gap-8 items-center shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-neutral-100 rounded-[30px] overflow-hidden flex-shrink-0 relative border border-neutral-100">
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 128px, 160px"
                    />
                  </div>
                  <div className="flex-grow space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tighter text-black leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-[10px] text-neutral-400 uppercase font-black tracking-widest">
                        Variant Clearance Check Required
                      </p>
                    </div>
                    <div className="flex justify-between items-center bg-neutral-50/50 rounded-2xl p-4 border border-neutral-100/50">
                      <div className="text-[10px] uppercase font-black tracking-widest text-neutral-500">
                        Qty: <span className="text-black">{item.quantity}</span>
                      </div>
                      <div className="text-lg font-black italic tracking-tighter text-black">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT PANE: ADMINISTRATIVE SUMMARY CARD */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border border-neutral-200 rounded-[60px] p-12 shadow-2xl space-y-12 sticky top-40"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Lock size={14} fill="currentColor" className="opacity-20" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Secure Administrative Hub</span>
                </div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-black font-display">Final Total</h2>
              </div>

              <div className="space-y-8 border-y border-neutral-50 py-10">
                <div className="space-y-6">
                  <div className="flex justify-between text-[12px] uppercase font-black tracking-widest text-neutral-400">
                    <span>Subtotal Manifest</span>
                    <span className="text-black">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[12px] uppercase font-black tracking-widest text-neutral-400">
                    <span>Global Logistics</span>
                    <span className="text-black italic">Auto-Calculated</span>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-8">
                  <div className="text-6xl font-black italic tracking-tighter text-black leading-none drop-shadow-sm">
                    ${subtotal.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-neutral-300 font-bold uppercase tracking-widest mb-1">
                    USD Verified
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <button
                  disabled={isLoading}
                  onClick={handleCheckout}
                  className="w-full bg-black text-white text-[12px] md:text-[14px] font-black uppercase tracking-[0.5em] py-8 rounded-[35px] hover:bg-neutral-800 hover:shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 group relative overflow-hidden"
                >
                  {isLoading ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <>
                      Proceed To Secure Payment
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                
                <div className="flex items-center justify-center gap-6 pt-4">
                  <div className="flex items-center gap-2 grayscale opacity-40">
                    <ShieldCheck size={18} />
                    <span className="text-[8px] font-black uppercase tracking-widest">SSL Secure</span>
                  </div>
                  <div className="flex items-center gap-2 grayscale opacity-40">
                    <Package size={18} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Global Ops</span>
                  </div>
                </div>
              </div>
              
              <p className="text-center text-[9px] text-neutral-300 uppercase font-bold tracking-[0.2em] leading-relaxed">
                By Proceeding, you trigger verified acquisition logistics.<br />Identity and Shipping managed by Stripe.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
