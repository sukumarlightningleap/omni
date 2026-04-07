"use client";

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, ChevronLeft, Lock } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  checkoutData: any;
  onBack: () => void;
}

export default function PaymentForm({ checkoutData, onBack }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/checkout', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          items: JSON.parse(localStorage.getItem('unrwly-cart-storage') || '{"state":{"items":[]}}').state.items,
          shippingAddress: checkoutData.shippingAddress
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Failed to get checkout URL");
      }
    } catch (err: any) {
      console.error("CHECKOUT ERROR:", err);
      setError("Failed to initialize secure payment session.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 md:p-12 border border-neutral-200 space-y-8">
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-[0.2em]">Secure Checkout</h3>
        <p className="text-neutral-500 text-[10px] tracking-widest uppercase leading-relaxed max-w-sm italic">
          You are about to be redirected to our encrypted Stripe payment gateway to complete your purchase.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-100 italic">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center gap-6">
        <button 
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-black transition-colors order-2 md:order-1"
          disabled={isLoading}
        >
          <ChevronLeft size={16} /> Return to Shipping
        </button>
        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full md:flex-1 py-5 bg-black text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all shadow-xl shadow-black/10 order-1 md:order-2 flex justify-center items-center gap-3 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Handshaking...
            </>
          ) : (
            <>
              <Lock size={14} /> Pay via Secure Stripe
            </>
          )}
        </button>
      </div>
    </div>
  );
}
