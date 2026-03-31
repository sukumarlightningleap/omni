"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const SORT_OPTIONS = [
  { label: 'Featured', value: '', reverse: '' },
  { label: 'Price: Low → High', value: 'PRICE', reverse: 'false' },
  { label: 'Price: High → Low', value: 'PRICE', reverse: 'true' },
  { label: 'Newest', value: 'CREATED_AT', reverse: 'true' },
  { label: 'A → Z', value: 'TITLE', reverse: 'false' },
];

/* ── Section Wrapper ──────────────────────────────────── */
const FilterSection = ({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/[0.06] pb-6 mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-[10px] uppercase tracking-[0.3em] font-semibold text-neutral-400 hover:text-white transition-colors mb-4"
      >
        {title}
        <ChevronDown size={12} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface FilterSidebarProps {
  availableSizes: string[];
  isOpen: boolean;
  onClose: () => void;
}

const FilterSidebar = ({ availableSizes, isOpen, onClose }: FilterSidebarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  // Read current filter state from URL
  const activeSize = searchParams.get('size') || '';
  const inStock = searchParams.get('inStock') === 'true';
  const activeSort = searchParams.get('sort') || '';
  const activeReverse = searchParams.get('reverse') || '';

  // Sync price inputs when URL changes externally
  useEffect(() => {
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
  }, [searchParams]);

  /* ── URL Update Helper ────────────────────────────── */
  const updateParams = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const qs = params.toString();
    router.push(`/collections${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [router, searchParams]);

  const updateMultipleParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    const qs = params.toString();
    router.push(`/collections${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [router, searchParams]);

  /* ── Price Debounce ───────────────────────────────── */
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (minPrice) params.set('minPrice', minPrice); else params.delete('minPrice');
      if (maxPrice) params.set('maxPrice', maxPrice); else params.delete('maxPrice');
      const qs = params.toString();
      const currentQs = searchParams.toString();
      if (qs !== currentQs) {
        router.push(`/collections${qs ? `?${qs}` : ''}`, { scroll: false });
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [minPrice, maxPrice]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Handle Sort ──────────────────────────────────── */
  const handleSort = (sortValue: string, reverseValue: string) => {
    updateMultipleParams({ sort: sortValue, reverse: reverseValue });
  };

  /* ── Determine which sizes to show ─────────── */
  const sizesToShow = availableSizes.length > 0
    ? availableSizes.filter(s => SIZE_OPTIONS.includes(s))
    : SIZE_OPTIONS;

  /* ── Filter Content ── */
  const filterContent = (
    <div className="space-y-0">
      {/* Sort */}
      <FilterSection title="Sort By">
        <div className="space-y-1">
          {SORT_OPTIONS.map(opt => {
            const isActive = activeSort === opt.value && activeReverse === opt.reverse;
            return (
              <button
                key={opt.label}
                onClick={() => handleSort(opt.value, opt.reverse)}
                className={`block w-full text-left text-xs py-2 px-3 rounded-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-black font-medium'
                    : 'text-neutral-500 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability">
        <button
          onClick={() => updateParams('inStock', inStock ? '' : 'true')}
          className="flex items-center gap-3 group/toggle w-full"
        >
          <div className={`relative w-10 h-[22px] rounded-full transition-colors duration-300 ${
            inStock ? 'bg-white' : 'bg-white/10'
          }`}>
            <div className={`absolute top-[3px] w-4 h-4 rounded-full transition-all duration-300 ${
              inStock ? 'left-[22px] bg-black' : 'left-[3px] bg-neutral-500'
            }`} />
          </div>
          <span className={`text-xs transition-colors ${inStock ? 'text-white' : 'text-neutral-500'}`}>
            In Stock Only
          </span>
        </button>
      </FilterSection>

      {/* Size Grid */}
      {sizesToShow.length > 0 && (
        <FilterSection title="Size">
          <div className="grid grid-cols-3 gap-2">
            {sizesToShow.map(size => {
              const isActive = activeSize.toUpperCase() === size;
              return (
                <button
                  key={size}
                  onClick={() => updateParams('size', isActive ? '' : size)}
                  className={`py-2.5 text-xs font-medium tracking-wider border transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-neutral-500 border-white/10 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 text-xs">₹</span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 text-white text-xs py-2.5 pl-7 pr-3 placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <span className="text-neutral-600 text-[10px] tracking-widest">—</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 text-xs">₹</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 text-white text-xs py-2.5 pl-7 pr-3 placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
      </FilterSection>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70]"
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-black border-l border-white/[0.06] z-[70] overflow-y-auto p-8"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold text-neutral-400">
                  Refine
                </h2>
                <button
                  onClick={() => router.push('/collections', { scroll: false })}
                  className="text-[9px] uppercase tracking-[0.2em] text-neutral-600 hover:text-white transition-colors"
                >
                  Clear All
                </button>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-neutral-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            {filterContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterSidebar;
