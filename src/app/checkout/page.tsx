"use client";

import React from 'react';
import CheckoutWizard from '@/components/checkout/CheckoutWizard';

/**
 * CUSTOM CHECKOUT ENTRY
 * Modern multi-step flow: Info -> Shipping -> Payment
 */
export default function CheckoutPage() {
  return (
    <div className="bg-[#F6F6F6] min-h-screen">
      <CheckoutWizard />
    </div>
  );
}
