"use client";

import React from 'react';
import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlistStore } from '@/store/useWishlistStore';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const wishlistItems = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const wishlistCount = wishlistItems.length;

  if (wishlistCount === 0) {
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

  return (
    <div className="min-h-screen bg-[#F6F6F6] pt-32 pb-20 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-black mb-2 italic">
            Wishlist
          </h1>
          <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">
            {wishlistCount} {wishlistCount === 1 ? 'Item' : 'Items'} Saved
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {wishlistItems.map((item) => (
            <ProductCard 
              key={item.id} 
              showRemove={true}
              onRemove={removeItem}
              product={{
                _id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                slug: item.slug,
                rawPrice: item.rawPrice
              }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
