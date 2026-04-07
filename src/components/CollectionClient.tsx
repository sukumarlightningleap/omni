"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, ChevronDown } from 'lucide-react';
import ProductCard from './ProductCard';
import FilterSidebar from './FilterSidebar';

// --- Updated Interface to match Page props ---
interface CollectionClientProps {
  initialProducts: any[];
  categories?: string[]; // Added to fix build error
  title?: string;        // Added to fix build error
}

/* ── Inner component that uses useSearchParams ─────── */
const CollectionInner = ({ initialProducts, title }: CollectionClientProps) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q)
      );
    }

    return result;
  }, [initialProducts, searchQuery]);

  return (
    <main className="min-h-screen bg-[#F6F6F6] pt-32 pb-32 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        {/* Header Section */}
        <header className="mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black tracking-tighter text-black font-display uppercase leading-[0.9]"
          >
            {title || 'The Archive'}
          </motion.h1>
          <div className="mt-6 flex items-center gap-4">
            <div className="h-[2px] w-12 bg-black" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-neutral-400">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </header>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-16 mt-12">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product._id || product.slug} product={product} index={index} />
            ))}
          </AnimatePresence>
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-40 text-center">
            <p className="text-neutral-400 uppercase tracking-widest text-[10px] font-black italic">
              Currently no pieces in this collection.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

/* ── Wrapper with Suspense boundary ───────────────── */
const CollectionClient = ({ initialProducts, categories, title }: CollectionClientProps) => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center pt-40">
        <div className="text-black text-[10px] uppercase tracking-[0.5em] animate-pulse italic">
          Loading Filters...
        </div>
      </div>
    }>
      <CollectionInner initialProducts={initialProducts} categories={categories} title={title} />
    </Suspense>
  );
};

export default CollectionClient;
