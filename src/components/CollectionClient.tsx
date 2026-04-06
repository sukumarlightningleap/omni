"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

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
    let result = [...initialProducts];

    // Filter Logic
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

    // Sort Logic
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.rawPrice - b.rawPrice);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.rawPrice - a.rawPrice);
    } else if (sortBy === 'newest') {
      // Assuming initialProducts is already sorted by Newest from Prisma, 
      // but we re-apply for safety if filter changed it.
    }

    return result;
  }, [initialProducts, activeCategory, searchQuery, inStockParam, colorParam, sizeParam, minPriceParam, maxPriceParam, sortBy]);

  const setCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    const qs = params.toString();
    router.push(`/collections/all${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  const clearAll = () => router.push('/collections/all', { scroll: false });

  return (
    <main className="min-h-screen bg-white pt-32 pb-20 px-6 md:px-12">
      <div className="mb-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black tracking-tighter italic mb-8 text-black font-display uppercase"
        >
          {title || 'New Arrivals'}
        </motion.h1>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-neutral-100 pb-8">
          <div className="flex flex-wrap gap-6 overflow-x-auto no-scrollbar">
            {dynamicCategories.map((cat: string, i: number) => (
              <motion.button
                key={cat}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setCategory(cat)}
                className={`text-[9px] uppercase tracking-[0.3em] font-black transition-all duration-300 ${
                  activeCategory === cat
                    ? 'text-black translate-y-[-2px]'
                    : 'text-neutral-400 hover:text-neutral-900'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-8">
            {/* Sort By Dropdown */}
            <div className="relative group/sort">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-transparent text-[9px] font-black uppercase tracking-[0.2em] pr-6 focus:outline-none cursor-pointer"
              >
                <option value="newest">Sort By: Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none group-hover/sort:translate-y-[-40%] transition-transform">
                <ChevronDown size={10} />
              </div>
            </div>

            <div className="w-[1px] h-4 bg-neutral-100" />

            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] font-black text-black hover:text-neutral-500 transition-colors group"
            >
              Filter
              <span className="w-1.5 h-1.5 rounded-full bg-black group-hover:scale-125 transition-transform" />
            </button>
          </div>
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

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 md:gap-x-8 gap-y-12 md:gap-y-16">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product._id || product.slug} product={product} index={index} />
              ))}
            </AnimatePresence>
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-40 text-center">
              <p className="text-neutral-400 uppercase tracking-widest text-xs italic">
                No items match your filters.
              </p>
              <button
                onClick={clearAll}
                className="mt-6 text-[10px] uppercase tracking-[0.2em] text-black/50 hover:text-black transition-colors underline underline-offset-4"
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
