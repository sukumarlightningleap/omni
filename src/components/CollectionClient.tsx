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


  const clearFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(`${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
  };

  const activeFilters = [
    { key: 'category', value: categoryParam, label: categoryParam },
    { key: 'size', value: sizeParam, label: `Size: ${sizeParam}` },
    { key: 'minPrice', value: minPriceParam, label: `min ₹${minPriceParam}` },
    { key: 'maxPrice', value: maxPriceParam, label: `max ₹${maxPriceParam}` },
    { key: 'q', value: searchQuery, label: `"${searchQuery}"` },
  ].filter(f => f.value);

  return (
    <main className="min-h-screen bg-white pt-24 pb-20 px-4 md:px-12 max-w-[1600px] mx-auto overflow-hidden">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-8 overflow-x-auto no-scrollbar whitespace-nowrap">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span>/</span>
        <span className="text-black italic">{title || 'Collections'}</span>
      </nav>

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 mb-4">
        <div className="flex items-baseline gap-4">
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter italic text-black font-display uppercase">
            {title || 'The Archive'}
          </h1>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest translate-y-[-2px]">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Desktop Top Controls */}
        <div className="flex items-center gap-8 justify-between md:justify-end border-b border-neutral-100 pb-2 md:border-none">
          {/* Mobile Filter Trigger */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-black text-black"
          >
            Filter <span className="w-1.5 h-1.5 rounded-full bg-[#ff3f6c]" />
          </button>

          <div className="relative group/sort">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-transparent text-[10px] font-black uppercase tracking-[0.2em] pr-6 focus:outline-none cursor-pointer text-black"
            >
              <option value="newest">Sort By: Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none group-hover/sort:translate-y-[-40%] transition-transform">
              <ChevronDown size={10} className="text-neutral-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Pills */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {activeFilters.map(filter => (
            <button
              key={`${filter.key}-${filter.value}`}
              onClick={() => clearFilter(filter.key)}
              className="group flex items-center gap-2 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-full text-[9px] font-black uppercase tracking-widest text-neutral-600 hover:border-[#ff3f6c] hover:text-[#ff3f6c] transition-all"
            >
              {filter.label}
              <X size={10} className="text-neutral-400 group-hover:text-[#ff3f6c]" />
            </button>
          ))}
          <button
            onClick={() => router.push(window.location.pathname, { scroll: false })}
            className="text-[9px] font-black uppercase tracking-widest text-[#ff3f6c] px-3 py-1.5 hover:underline"
          >
            Clear All
          </button>
        </div>
      )}

      <div className="flex gap-4 lg:gap-0 mt-8 border-t border-neutral-100 pt-12">
        <FilterSidebar
          availableSizes={availableSizes}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />

        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-x-4 md:gap-x-8 gap-y-12 md:gap-y-16">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product._id || product.slug} product={product} index={index} />
              ))}
            </AnimatePresence>
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-40 text-center">
              <p className="text-neutral-400 uppercase tracking-widest text-[10px] font-bold italic">
                No items match your criteria.
              </p>
              <button
                onClick={() => router.push(window.location.pathname, { scroll: false })}
                className="mt-6 text-[10px] uppercase tracking-[0.2em] font-black text-[#ff3f6c] hover:underline"
              >
                Reset Search
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
