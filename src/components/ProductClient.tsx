"use client";

import React, { useState, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowLeft, Loader2, ChevronDown, X, Ruler, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Link from 'next/link';
import VTOModal from '@/components/VTOModal';
import ProductCard from '@/components/ProductCard';
import ProductReviews from '@/components/ProductReviews';
import { useCartStore } from '@/store/useCartStore'; // UPDATED IMPORT

/* ── Color Map (shared with FilterSidebar) ─────────── */
const COLOR_MAP: Record<string, string> = {
  Black: '#000000', White: '#FFFFFF', Red: '#DC2626', Blue: '#2563EB',
  Navy: '#1E3A5F', Green: '#16A34A', Pink: '#EC4899', Beige: '#D4B896',
  Grey: '#6B7280', Brown: '#92400E', Yellow: '#EAB308', Orange: '#EA580C',
  Purple: '#7C3AED',
};


/* ── Cross-Sell Carousel ───────────────────────────── */
const CrossSellCarousel = ({ products }: { products: any[] }) => {
  if (!products || products.length === 0) return null;
  return (
    <section className="border-t border-white/[0.06] bg-black px-6 md:px-12 py-20">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-12">
          <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 font-bold">Curated</span>
          <h2 className="text-3xl md:text-4xl font-light italic text-white mt-2 font-display">You May Also Like</h2>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory cross-sell-scroll">
          {products.map((product, index) => (
            <div key={product._id || product.slug} className="flex-shrink-0 w-[280px] md:w-[320px] snap-start">
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── Main PDP Component ────────────────────────────── */
interface ProductClientProps {
  product: any;
  recommendations?: any[];
}

export default function ProductClient({ product, recommendations = [] }: ProductClientProps) {
  const [isVTOOpen, setIsVTOOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  // ZUSTAND STORE HOOKS
  const addItem = useCartStore((state) => state.addItem);
  const setDrawerOpen = useCartStore((state) => state.setDrawerOpen);

  const images = product.allImages && product.allImages.length > 0
    ? product.allImages
    : [product.image];

  const variants = product.variants || [];

  const availableColors = useMemo(() => {
    const set = new Set<string>();
    variants.forEach((v: any) => { if (v.color) set.add(v.color); });
    product.colors?.forEach((c: string) => set.add(c));
    return Array.from(set);
  }, [variants, product.colors]);

  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    variants.forEach((v: any) => { if (v.size) set.add(v.size); });
    product.sizes?.forEach((s: string) => set.add(s));
    return Array.from(set);
  }, [variants, product.sizes]);

  const selectedVariant = useMemo(() => {
    if (variants.length === 0) return null;
    return variants.find((v: any) => {
      const colorMatch = !selectedColor || v.color.toLowerCase() === selectedColor.toLowerCase();
      const sizeMatch = !selectedSize || v.size.toUpperCase() === selectedSize.toUpperCase();
      return colorMatch && sizeMatch;
    }) || variants[0];
  }, [variants, selectedColor, selectedSize]);

  const isSizeAvailable = useCallback((size: string) => {
    if (variants.length === 0) return true;
    return variants.some((v: any) => {
      const colorMatch = !selectedColor || v.color.toLowerCase() === selectedColor.toLowerCase();
      return colorMatch && v.size.toUpperCase() === size.toUpperCase() && v.availableForSale;
    });
  }, [variants, selectedColor]);

  const displayImages = useMemo(() => {
    if (selectedVariant?.image && selectedVariant.image !== '') {
      const variantImg = selectedVariant.image;
      const rest = images.filter((img: string) => img !== variantImg);
      return [variantImg, ...rest];
    }
    return images;
  }, [selectedVariant, images]);

  const activeVariantId = selectedVariant?.id || product.variantId;
  const activePriceDisplay = selectedVariant?.price || product.price;

  // Helper to convert price string "$25.00" to number for the cart store
  const activePriceNumber = useMemo(() => {
    if (typeof activePriceDisplay === 'number') return activePriceDisplay;
    return parseFloat(activePriceDisplay.replace(/[^0-9.-]+/g, ""));
  }, [activePriceDisplay]);

  const handleAddToCart = () => {
    addItem({
      id: `${product._id}-${activeVariantId}`,
      productId: product._id,
      name: product.name,
      price: activePriceNumber,
      image: displayImages[0] || product.image,
      quantity: 1,
      variantId: activeVariantId,
    });
    setDrawerOpen(true);
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 max-w-7xl mx-auto pt-32 pb-24 px-6 md:px-12">

        {/* LEFT: Carousel */}
        <div className="relative group">
          <Link href="/collections" className="absolute -top-12 left-0 z-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-medium hover:text-neutral-400 transition-colors">
            <ArrowLeft size={12} /> Return to Archive
          </Link>

          <div className="relative flex items-center">
            <div ref={scrollRef} className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar scroll-smooth w-full">
              {displayImages.map((img: string, idx: number) => (
                <div key={idx} className="min-w-full snap-center relative aspect-[3/4] overflow-hidden bg-neutral-950">
                  <Image src={img} alt={`${product.name} - ${idx + 1}`} fill className="object-cover object-center" sizes="(max-width: 768px) 100vw, 50vw" priority={idx === 0} />
                </div>
              ))}
            </div>
            {displayImages.length > 1 && (
              <>
                <button onClick={() => scroll('left')} className="absolute left-4 z-20 p-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-black"><ChevronLeft size={20} /></button>
                <button onClick={() => scroll('right')} className="absolute right-4 z-20 p-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-black"><ChevronRight size={20} /></button>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: Info */}
        <div className="md:sticky md:top-24 h-fit flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 font-bold">{product.category}</span>
              <div className="h-[1px] w-12 bg-neutral-800" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter leading-[0.9] italic mb-6 font-display uppercase">{product.name}</h1>

            <button onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-2 mb-6 group">
              <div className="flex text-white">{[1, 2, 3, 4, 5].map((s) => <Star key={s} size={10} fill="currentColor" />)}</div>
              <span className="text-[10px] font-syne font-bold text-neutral-500 uppercase tracking-widest group-hover:text-white transition-colors">4.8 / 124 Reviews</span>
            </button>

            <p className="text-2xl font-light text-neutral-200 font-mono tracking-tighter">{activePriceDisplay}</p>
          </div>

          <div className="space-y-8 py-8 border-y border-white/[0.06]">
            {availableColors.length > 0 && (
              <div>
                <span className="block text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-semibold mb-4">Color{selectedColor ? `: ${selectedColor}` : ''}</span>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map(color => {
                    const isActive = selectedColor.toLowerCase() === color.toLowerCase();
                    const hex = COLOR_MAP[color] || '#888';
                    return <button key={color} onClick={() => setSelectedColor(isActive ? '' : color)} className={`w-8 h-8 rounded-full transition-all duration-300 ${color === 'White' ? 'border border-white/20' : ''} ${isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'hover:scale-110'}`} style={{ backgroundColor: hex }} />;
                  })}
                </div>
              </div>
            )}

            {availableSizes.length > 0 && (
              <div>
                <span className="block text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-semibold mb-4">Size{selectedSize ? `: ${selectedSize}` : ''}</span>
                <div className="grid grid-cols-4 gap-2">
                  {availableSizes.map(size => {
                    const isActive = selectedSize.toUpperCase() === size.toUpperCase();
                    const available = isSizeAvailable(size);
                    return <button key={size} onClick={() => available && setSelectedSize(isActive ? '' : size)} disabled={!available} className={`py-3 text-[10px] font-medium tracking-widest border transition-all duration-200 ${isActive ? 'bg-white text-black border-white' : available ? 'bg-transparent text-neutral-500 border-white/10 hover:border-white/30 hover:text-white' : 'opacity-20 cursor-not-allowed'}`}>{size}</button>;
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleAddToCart}
              className="w-full py-5 bg-white text-black font-bold uppercase tracking-[0.3em] text-xs hover:bg-neutral-200 transition-all flex items-center justify-center gap-3"
            >
              Add to Archive
            </button>

            <button onClick={() => setIsVTOOpen(true)} className="w-full py-5 border border-white/10 bg-neutral-900/50 text-white font-bold uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 hover:bg-white/5 transition-all">
              <Sparkles size={16} className="text-blue-500" /> AI Virtual Try-On
            </button>
          </div>

          <div className="mt-4">
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 font-bold mb-4">Description</h2>
            {product.descriptionHtml ? (
              <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} className="prose prose-sm prose-invert max-w-none text-neutral-500 leading-relaxed font-inter" />
            ) : (
              <p className="text-neutral-500 text-sm italic font-inter">{product.description}</p>
            )}
          </div>
        </div>
      </div>

      <CrossSellCarousel products={recommendations} />
      <ProductReviews />
      <VTOModal isOpen={isVTOOpen} onClose={() => setIsVTOOpen(false)} productImage={displayImages[0] || product.image} productName={product.name} />
    </div>
  );
}
