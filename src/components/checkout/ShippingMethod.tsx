"use client";

import React from 'react';
import { Truck, Zap, ChevronLeft } from 'lucide-react';

interface ShippingMethodProps {
  data: any;
  onBack: () => void;
  onNext: (method: string) => void;
}

export default function ShippingMethod({ data, onBack, onNext }: ShippingMethodProps) {
  const [selected, setSelected] = React.useState(data.shippingMethod || 'standard');

  const methods = [
    { id: 'standard', label: 'Standard Shipping', price: 0, time: '3-10 business days', icon: Truck },
    { id: 'priority', label: 'Priority Shipping', price: 15, time: '2-4 business days', icon: Zap }
  ];

  return (
    <div className="bg-white p-8 md:p-12 border border-neutral-200">
      <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8">Shipping Method</h3>
      
      <div className="space-y-4 mb-12">
        {methods.map((m) => (
          <label 
            key={m.id}
            className={`flex items-center justify-between p-6 border cursor-pointer transition-all ${selected === m.id ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-neutral-200 hover:border-neutral-400'}`}
          >
            <div className="flex items-center gap-4">
              <input 
                type="radio" 
                name="shipping" 
                value={m.id} 
                checked={selected === m.id}
                onChange={() => setSelected(m.id)}
                className="accent-black"
              />
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white border border-neutral-100 flex items-center justify-center">
                  <m.icon size={18} className="text-neutral-400" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide">{m.label}</p>
                  <p className="text-[10px] text-neutral-400 uppercase font-black tracking-widest mt-1">{m.time}</p>
                </div>
              </div>
            </div>
            <span className="text-sm font-black tracking-tight">{m.price === 0 ? 'FREE' : `$${m.price.toFixed(2)}`}</span>
          </label>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-black transition-colors order-2 md:order-1"
        >
          <ChevronLeft size={16} /> Return to Info
        </button>
        <button
          onClick={() => onNext(selected)}
          className="w-full md:flex-1 py-5 bg-black text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all shadow-xl shadow-black/10 order-1 md:order-2"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}
