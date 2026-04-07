"use client";

import React from 'react';
import { useForm } from 'react-hook-form';

interface AddressFormProps {
  data: any;
  onNext: (data: any) => void;
}

export default function AddressForm({ data, onNext }: AddressFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: data.shippingAddress || {
      email: data.email,
      firstName: '',
      lastName: '',
      address1: '',
      address2: '',
      city: '',
      postalCode: '',
      country: 'US',
      phone: ''
    }
  });

  const onSubmit = (formData: any) => {
    onNext({
      email: formData.email,
      shippingAddress: formData
    });
  };

  return (
    <div className="bg-white p-8 md:p-12 border border-neutral-200">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        <section>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6">Contact</h3>
          <input
            {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
            placeholder="Email address"
            className="w-full bg-[#f8f8f9] border border-transparent focus:border-black p-4 text-sm transition-all focus:outline-none"
          />
        </section>

        <section>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6">Shipping Address</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              {...register('firstName', { required: true })}
              placeholder="First Name"
              className="w-full bg-[#f8f8f9] border border-transparent focus:border-black p-4 text-sm transition-all focus:outline-none"
            />
            <input
              {...register('lastName', { required: true })}
              placeholder="Last Name"
              className="w-full bg-[#f8f8f9] border border-transparent focus:border-black p-4 text-sm transition-all focus:outline-none"
            />
          </div>
          
          <div className="mt-4 space-y-4">
            <input
              {...register('address1', { required: true })}
              placeholder="Address"
              className="w-full bg-[#f8f8f9] border border-transparent focus:border-black p-4 text-sm transition-all focus:outline-none"
            />
            <input
              {...register('address2')}
              placeholder="Apartment, suite, etc. (optional)"
              className="w-full bg-[#f8f8f9] border border-transparent focus:border-black p-4 text-sm transition-all focus:outline-none"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <input
                {...register('city', { required: true })}
                placeholder="City"
                className="w-full bg-[#f8f8f9] border border-transparent focus:border-black p-4 text-sm transition-all focus:outline-none"
              />
              <input
                {...register('postalCode', { required: true })}
                placeholder="Postal Code"
                className="w-full bg-[#f8f8f9] border border-transparent focus:border-black p-4 text-sm transition-all focus:outline-none"
              />
            </div>

            <select
              {...register('country', { required: true })}
              className="w-full bg-[#f8f8f9] border border-transparent focus:border-black p-4 text-sm transition-all focus:outline-none appearance-none"
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="IN">India</option>
            </select>

            <input
              {...register('phone', { required: true })}
              placeholder="Phone"
              className="w-full bg-[#f8f8f9] border border-transparent focus:border-black p-4 text-sm transition-all focus:outline-none"
            />
          </div>
        </section>

        <button
          type="submit"
          className="w-full py-5 bg-black text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all shadow-xl shadow-black/10"
        >
          Continue to Shipping
        </button>
      </form>
    </div>
  );
}
