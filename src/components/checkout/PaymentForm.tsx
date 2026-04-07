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

function CheckoutForm({ checkoutData, onBack }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/?success=1`,
        shipping: {
          name: `${checkoutData.shippingAddress.firstName} ${checkoutData.shippingAddress.lastName}`,
          address: {
            line1: checkoutData.shippingAddress.address1,
            line2: checkoutData.shippingAddress.address2,
            city: checkoutData.shippingAddress.city,
            postal_code: checkoutData.shippingAddress.postalCode,
            country: checkoutData.shippingAddress.country,
          },
        },
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || "An unexpected error occurred.");
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <PaymentElement options={{ layout: 'tabs' }} />
      
      {message && (
        <div className="p-4 bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-100">
          {message}
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center gap-6">
        <button 
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-black transition-colors order-2 md:order-1"
        >
          <ChevronLeft size={16} /> Return to Shipping
        </button>
        <button
          disabled={isLoading || !stripe || !elements}
          className="w-full md:flex-1 py-5 bg-black text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all shadow-xl shadow-black/10 order-1 md:order-2 flex justify-center items-center gap-3 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Processing...
            </>
          ) : (
            <>
              <Lock size={14} /> Complete Purchase
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function PaymentForm({ checkoutData, onBack }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch('/api/checkout', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        items: JSON.parse(localStorage.getItem('unrwly-cart-storage') || '{"state":{"items":[]}}').state.items,
        shippingAddress: checkoutData.shippingAddress
      }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
      .catch(() => setError("Failed to initialize payment."));
  }, [checkoutData.shippingAddress]);

  if (error) return <div className="p-12 text-center text-rose-500 font-bold uppercase tracking-widest italic">{error}</div>;
  if (!clientSecret) return (
    <div className="bg-white p-20 border border-neutral-200 flex flex-col items-center justify-center gap-4">
      <Loader2 size={32} className="animate-spin text-neutral-300" />
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 italic">Authenticating Secure Gateway...</span>
    </div>
  );

  return (
    <div className="bg-white p-8 md:p-12 border border-neutral-200">
      <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8">Payment Details</h3>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm checkoutData={checkoutData} onBack={onBack} />
      </Elements>
    </div>
  );
}
