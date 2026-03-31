"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
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
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categoryParam = searchParams.get('category') || '';
  const searchQuery = searchParams.get('q') || '';
  const colorParam = searchParams.get('color') || '';
  const sizeParam = searchParams.get('size') || '';
  const inStockParam = searchParams.get('inStock') === 'true';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';

  const activeCategory = categoryParam || 'All';

  const { availableColors, availableSizes, dynamicCategories } = useMemo(() => {
    const colorSet = new Set<string>();
    const sizeSet = new Set<string>();
    const catSet = new Set<string>();

    initialProducts.forEach(p => {
      p.colors?.forEach((c: string) => colorSet.add(c));
      p.sizes?.forEach((s: string) => sizeSet.add(s));
      if (p.category) catSet.add(p.category);
    });

    return {
      availableColors: Array.from(colorSet),
      availableSizes: Array.from(sizeSet),
      dynamicCategories: ['All', ...Array.from(catSet)],
    };
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    let result = initialProducts;

    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (inStockParam) {
      result = result.filter(p => p.availableForSale === true);
    }

    if (colorParam) {
      result = result.filter(p =>
        p.colors?.some((c: string) => c.toLowerCase() === colorParam.toLowerCase())
      );
    }

    if (sizeParam) {
      result = result.filter(p =>
        p.sizes?.some((s: string) => s.toUpperCase() === sizeParam.toUpperCase())
      );
    }

    const minP = minPriceParam ? parseFloat(minPriceParam) : null;
    const maxP = maxPriceParam ? parseFloat(maxPriceParam) : null;
    if (minP !== null) result = result.filter(p => p.rawPrice >= minP);
    if (maxP !== null) result = result.filter(p => p.rawPrice <= maxP);

    return result;
  }, [initialProducts, activeCategory, searchQuery, inStockParam, colorParam, sizeParam, minPriceParam, maxPriceParam]);

  const setCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    const qs = params.toString();
    router.push(`/collections${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  const clearAll = () => router.push('/collections', { scroll: false });

  return (
    <main className="min-h-screen bg-black pt-40 pb-20 px-6 md:px-12">
      <div className="mb-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter italic mb-8 text-white font-display"
        >
          {/* Uses the dynamic title from Printify or falls back to Archive */}
          {title || 'Archive'}
        </motion.h1>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 overflow-x-auto">
            {dynamicCategories.map((cat: string, i: number) => (
              <motion.button
                key={cat}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setCategory(cat)}
                className={`text-[10px] uppercase tracking-[0.3em] font-medium pb-1 border-b-2 transition-all duration-300 ${
                  activeCategory === cat
                    ? 'text-white border-white'
                    : 'text-neutral-600 border-transparent hover:text-neutral-400'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>

          <div className="hidden md:block w-[1px] h-4 bg-neutral-800" />

          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-white hover:text-neutral-400 transition-colors group"
          >
            Refine
            <span className="w-1.5 h-1.5 rounded-full bg-white group-hover:bg-neutral-400 transition-colors" />
          </button>
        </div>
      </div>

      <div className="flex gap-0 lg:gap-4">
        <FilterSidebar
          availableSizes={availableSizes}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-8">
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-600">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-16">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product._id || product.slug} product={product} index={index} />
              ))}
            </AnimatePresence>
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-40 text-center">
              <p className="text-neutral-600 uppercase tracking-widest text-xs italic">
                No items match your filters.
              </p>
              <button
                onClick={clearAll}
                className="mt-6 text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors underline underline-offset-4"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

/* ── Wrapper with Suspense boundary ───────────────── */
const CollectionClient = ({ initialProducts, categories, title }: CollectionClientProps) => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center pt-40">
        <div className="text-white text-[10px] uppercase tracking-[0.5em] animate-pulse italic">
          Loading Filters...
        </div>
      </div>
    }>
      <CollectionInner initialProducts={initialProducts} categories={categories} title={title} />
    </Suspense>
  );
};

export default CollectionClient;
