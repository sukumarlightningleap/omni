"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronRight, Check } from 'lucide-react';
import AddressForm from './AddressForm';
import ShippingMethod from './ShippingMethod';
import PaymentForm from './PaymentForm';
import OrderSummary from './OrderSummary';

export type CheckoutStep = 'INFORMATION' | 'SHIPPING' | 'PAYMENT';

export default function CheckoutWizard() {
  const [step, setStep] = useState<CheckoutStep>('INFORMATION');
  const [checkoutData, setCheckoutData] = useState<any>({
    email: '',
    shippingAddress: null,
    shippingMethod: 'standard',
  });

  const steps = [
    { id: 'INFORMATION', label: 'Info' },
    { id: 'SHIPPING', label: 'Shipping' },
    { id: 'PAYMENT', label: 'Payment' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <div className="min-h-screen bg-[#F6F6F6] pt-12 pb-24 px-4 md:px-12 text-black">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Simplified Nav / Logo */}
        <header className="mb-12 flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">Unrwly</h1>
          <div className="flex items-center gap-2 text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <ShoppingBag size={14} /> Secure Checkout
          </div>
        </header>

        {/* Breadcrumb Steps */}
        <nav className="mb-16 flex items-center justify-center gap-4">
          {steps.map((s, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;
            
            return (
              <React.Fragment key={s.id}>
                <div className={`flex items-center gap-2 ${isActive ? 'text-black' : isCompleted ? 'text-neutral-500' : 'text-neutral-300'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${isActive ? 'border-black bg-black text-white' : isCompleted ? 'border-neutral-500 bg-neutral-500 text-white' : 'border-neutral-200'}`}>
                    {isCompleted ? <Check size={12} /> : idx + 1}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <ChevronRight size={14} className="text-neutral-200" />
                )}
              </React.Fragment>
            );
          })}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
          
          {/* Form Content */}
          <div className="space-y-12">
            <AnimatePresence mode="wait">
              {step === 'INFORMATION' && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <AddressForm 
                    data={checkoutData} 
                    onNext={(data: any) => {
                      setCheckoutData({ ...checkoutData, ...data });
                      setStep('SHIPPING');
                      window.scrollTo(0,0);
                    }} 
                  />
                </motion.div>
              )}

              {step === 'SHIPPING' && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <ShippingMethod 
                    data={checkoutData}
                    onBack={() => setStep('INFORMATION')}
                    onNext={(method: string) => {
                      setCheckoutData({ ...checkoutData, shippingMethod: method });
                      setStep('PAYMENT');
                      window.scrollTo(0,0);
                    }}
                  />
                </motion.div>
              )}

              {step === 'PAYMENT' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <PaymentForm 
                    checkoutData={checkoutData}
                    onBack={() => setStep('SHIPPING')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sticky Summary */}
          <div className="lg:sticky lg:top-12">
            <OrderSummary checkoutData={checkoutData} />
          </div>

        </div>
      </div>
    </div>
  );
}
