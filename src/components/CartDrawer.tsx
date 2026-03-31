"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight, Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';

const CartDrawer: React.FC = () => {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const isDrawerOpen = useCartStore((state) => state.isDrawerOpen);
  const setDrawerOpen = useCartStore((state) => state.setDrawerOpen);

  // Added a loading state so the button updates while Stripe is connecting
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  // The actual Stripe Checkout trigger
  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Something went wrong loading the checkout.");
      setIsCheckingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />

          {/* Drawer Panel - Deep dark background for high contrast */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-800 z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-zinc-400" />
                <h2 className="text-xl font-bold tracking-tighter uppercase text-white">Your Cart</h2>
                {itemCount > 0 && (
                  <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded-full font-bold">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-8 border border-zinc-800"
                  >
                    <ShoppingBag size={32} className="text-zinc-500" />
                  </motion.div>
                  <h3 className="text-lg font-medium mb-2 text-white">Your cart is currently empty.</h3>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="mt-6 flex items-center gap-2 text-white text-xs uppercase tracking-[0.2em] hover:text-blue-400 transition-colors"
                  >
                    Continue Browsing <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 group bg-zinc-900/50 p-3 rounded-md border border-zinc-800/50">
                      {/* Image */}
                      <div className="relative w-20 aspect-[4/5] bg-zinc-800 rounded-sm overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-sm font-bold text-white leading-tight line-clamp-2">{item.name}</h4>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-sm font-mono text-zinc-400 mt-1">${item.price.toFixed(2)}</p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center mt-3">
                          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-sm overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer / Checkout Section */}
            <div className="p-6 bg-zinc-950 border-t border-zinc-800 mt-auto">
              <div className="flex justify-between items-end mb-6">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold mb-1">Subtotal</span>
                  <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Taxes & shipping calculated at checkout</span>
                </div>
                <span className="text-2xl font-bold text-white">${subtotal.toFixed(2)}</span>
              </div>

              {/* HIGH CONTRAST CHECKOUT BUTTON */}
              <button
                onClick={handleCheckout}
                disabled={items.length === 0 || isCheckingOut}
                className="w-full py-4 bg-white text-black text-sm font-extrabold uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center rounded-sm"
              >
                {isCheckingOut ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin" /> Processing...
                  </span>
                ) : (
                  "Secure Checkout"
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
