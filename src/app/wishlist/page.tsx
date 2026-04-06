"use client";

import React from 'react';
import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6 md:px-12 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-[#f5f5f6] rounded-full flex items-center justify-center mb-8 border border-[#eaeaec]">
        <Heart size={32} className="text-[#d4d5d9]" />
      </div>
      <h1 className="text-3xl font-black tracking-tight uppercase mb-4 text-[#282C3F]">Your Wishlist is Empty</h1>
      <p className="text-[#94969f] text-sm mb-8 max-w-md">Save your favorite items here to keep track of them and buy them later.</p>
      <Link 
        href="/collections"
        className="flex items-center gap-2 text-[#ff3f6c] text-sm font-bold uppercase tracking-widest hover:underline"
      >
        Start Shopping <ArrowRight size={16} />
      </Link>
    </div>
  );
}
