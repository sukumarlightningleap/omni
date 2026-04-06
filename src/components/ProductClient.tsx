"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowLeft, Star, ShoppingBag, ShieldCheck, Truck, RotateCcw, MapPin, ChevronRight, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';
import VTOModal from '@/components/VTOModal';
import ProductCard from '@/components/ProductCard';
import ProductReviews from '@/components/ProductReviews';
import { useCartStore } from '@/store/useCartStore';

const COLOR_MAP: Record<string, string> = {
  Black: '#000000', White: '#FFFFFF', Red: '#DC2626', Blue: '#2563EB',
  Navy: '#1E3A5F', Green: '#16A34A', Pink: '#EC4899', Beige: '#D4B896',
  Grey: '#6B7280', Brown: '#92400E', Yellow: '#EAB308', Orange: '#EA580C',
  Purple: '#7C3AED',
};

const CrossSellCarousel = ({ products }: { products: any[] }) => {
  if (!products || products.length === 0) return null;
  return (
    <section className="bg-white px-4 md:px-12 py-16" style={{ borderTop: '1px solid #eaeaec' }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-[16px] font-bold text-[#282C3F] mb-6 uppercase tracking-wide">Similar Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {products.map((product, index) => (
            <ProductCard key={product._id || product.slug} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default function ProductClient({ product, recommendations = [] }: ProductClientProps) {
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [isVTOOpen, setIsVTOOpen] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<null | 'valid' | 'invalid'>(null);
  const [currentSlide, setCurrentSlide] = useState(1);

  const addItem = useCartStore((state) => state.addItem);
  const setDrawerOpen = useCartStore((state) => state.setDrawerOpen);

  const images = useMemo(() => (
    product.allImages && product.allImages.length > 0 ? product.allImages : [product.image]
  ), [product.allImages, product.image]);

  const variants = product.variants || [];
  const availableColors = useMemo(() => {
    const set = new Set<string>();
    variants.forEach((v: any) => { if (v.color) set.add(v.color); });
    return Array.from(set);
  }, [variants]);

  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    variants.forEach((v: any) => { if (v.size) set.add(v.size); });
    return Array.from(set);
  }, [variants]);

  const activePriceDisplay = product.price;
  const activePriceNumber = useMemo(() => {
    if (typeof activePriceDisplay === 'number') return activePriceDisplay;
    return parseFloat(activePriceDisplay.replace(/[^0-9.-]+/g, ""));
  }, [activePriceDisplay]);

  const strikethroughPrice = (activePriceNumber * 1.5).toFixed(2);
  const discountPercent = 33;

  const handleAddToCart = () => {
    addItem({
      id: `${product._id}`,
      productId: product._id,
      name: product.name,
      price: activePriceNumber,
      image: images[0],
      quantity: 1,
      variantId: product.variantId,
    });
    setDrawerOpen(true);
  };

  const handlePincodeCheck = () => {
    if (pincode.length === 6) setPincodeStatus('valid');
    else setPincodeStatus('invalid');
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      {/* Breadcrumb */}
      <div className="hidden md:block max-w-7xl mx-auto px-12 pt-32 pb-4" style={{paddingTop: '128px'}}>
        <nav className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
          <Link href="/" className="hover:text-black">Home</Link>
          <ChevronRight size={10} />
          <Link href="/collections" className="hover:text-black">{product.category || 'Collection'}</Link>
          <ChevronRight size={10} />
          <span className="text-black font-bold">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-12 pb-24">
        
        {/* LEFT: Image Architecture (Quad-View) */}
        <div className="lg:col-span-7">
          {/* Desktop Quad Grid */}
          <div className="hidden lg:grid grid-cols-2" style={{ gap: '2px' }}>
            {images.map((img: string, idx: number) => (
              <div key={idx} className="relative overflow-hidden bg-[#f5f5f6]" style={{ aspectRatio: '3/4', border: '1px solid #eaeaec' }}>
                <Image 
                  src={img} 
                  alt={`${product.name} ${idx + 1}`} 
                  fill 
                  className="object-cover" 
                  priority={idx < 2}
                  sizes="400px"
                />
              </div>
            ))}
          </div>

          {/* Mobile Snap Slider */}
          <div className="lg:hidden relative">
            <div 
              ref={scrollRef}
              onScroll={(e) => {
                const target = e.target as HTMLDivElement;
                const slide = Math.round(target.scrollLeft / target.clientWidth) + 1;
                setCurrentSlide(slide);
              }}
              className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar aspect-[3/4]"
            >
              {images.map((img: string, idx: number) => (
                <div key={idx} className="min-w-full snap-center relative">
                  <Image src={img} alt={product.name} fill className="object-cover" priority={idx === 0} />
                </div>
              ))}
            </div>
            <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
              {currentSlide} / {images.length}
            </div>
            <div className="absolute top-4 right-4 flex flex-col gap-3">
              <button className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-neutral-400 hover:text-rose-500 transition-colors">
                <Heart size={20} />
              </button>
              <button className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-neutral-400 hover:text-black transition-colors">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: High-Density Marketplace Details */}
        <div className="lg:col-span-5 px-6 md:px-0 lg:sticky lg:top-28 lg:self-start" style={{maxHeight: 'calc(100vh - 128px)', overflowY: 'auto'}}>
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <p className="text-lg font-extrabold text-[#282C3F] uppercase tracking-widest leading-tight">UNRWLY</p>
              <h1 className="text-xl md:text-2xl text-[#94969f] tracking-tight leading-tight uppercase font-medium">{product.name}</h1>
            </div>

            {/* Social Proof Strip */}
            <div className="flex items-center gap-4 py-2 px-3 border border-neutral-100 rounded-md bg-neutral-50 w-fit">
              <div className="flex items-center gap-1 font-bold text-sm">
                4.2 <Star size={14} className="fill-emerald-500 text-emerald-500" />
              </div>
              <div className="h-4 w-[1px] bg-neutral-200" />
              <button onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs font-bold text-neutral-500 hover:text-emerald-600">
                124 Ratings
              </button>
            </div>

            <hr className="border-neutral-100" />

            {/* Pricing Engine */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-neutral-900 tracking-tighter">{activePriceDisplay}</span>
                <span className="text-lg text-neutral-400 line-through font-medium">MRP ${strikethroughPrice}</span>
                <span className="text-lg font-black uppercase" style={{color: '#ff905a'}}>({discountPercent}% OFF)</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{color: '#14958f'}}>inclusive of all taxes</p>
            </div>

            {/* Selection Grid */}
            <div className="space-y-6 pt-4">
              {availableSizes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black uppercase tracking-widest">Select Size</span>
                    <button className="text-[12px] font-bold uppercase tracking-widest hover:underline" style={{ color: '#ff3f6c' }}>Size Chart &gt;</button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {availableSizes.map(size => {
                      const isActive = selectedSize.toUpperCase() === size.toUpperCase();
                      const isOutOfStock = size.toLowerCase() === 'xs' || size.toLowerCase() === 'xxl'; // Logic placeholder
                      return (
                        <button 
                          key={size}
                          disabled={isOutOfStock}
                          onClick={() => setSelectedSize(isActive ? '' : size)}
                          className={`relative w-14 h-14 flex items-center justify-center text-sm font-bold border transition-all duration-200 rounded-sm ${isOutOfStock ? 'opacity-20 cursor-not-allowed overflow-hidden' : ''}`}
                          style={{
                            borderColor: isActive ? '#ff3f6c' : isOutOfStock ? '#eaeaec' : '#d4d5d9',
                            color: isActive ? '#ff3f6c' : '#282C3F',
                            background: isActive ? '#fff0f4' : undefined,
                          }}
                        >
                          {size}
                          {isOutOfStock && <div className="absolute inset-0 border-t border-neutral-400 -rotate-45" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {availableColors.length > 0 && (
                <div className="space-y-4">
                  <span className="text-sm font-black uppercase tracking-widest block">Available Shades</span>
                  <div className="flex flex-wrap gap-4">
                    {availableColors.map(color => {
                      const isActive = selectedColor.toLowerCase() === color.toLowerCase();
                      const hex = COLOR_MAP[color] || '#888';
                      return (
                        <button 
                          key={color}
                          onClick={() => setSelectedColor(isActive ? '' : color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all p-0.5 ${isActive ? 'border-neutral-900 scale-110' : 'border-transparent hover:scale-110'}`}
                        >
                          <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: hex }} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Utility: Pincode Check */}
            <div className="space-y-4 pt-4">
              <span className="text-sm font-black uppercase tracking-widest block">Delivery Check</span>
              <div className="flex items-center border rounded-sm overflow-hidden group focus-within:border-[#282C3F] transition-colors" style={{ borderColor: '#eaeaec' }}>
                <div className="flex items-center gap-2 pl-3 text-[#94969f]">
                  <MapPin size={16} />
                </div>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="Enter Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="flex-grow bg-transparent text-sm font-bold border-none focus:ring-0 placeholder:text-[#d4d5d9] outline-none h-11 px-3"
                />
                <button 
                  onClick={handlePincodeCheck}
                  className="h-11 px-6 text-[12px] font-extrabold uppercase tracking-widest transition-colors border-l"
                  style={{ color: '#ff3f6c', borderColor: '#eaeaec' }}
                >
                  Check
                </button>
              </div>
              {pincodeStatus === 'valid' && <p className="text-[10px] font-bold text-emerald-600 uppercase">Express delivery by tomorrow</p>}
              {pincodeStatus === 'invalid' && <p className="text-[10px] font-bold text-rose-500 uppercase">Please enter a valid pincode</p>}
            </div>

            {/* Desktop Action Stack */}
            <div className="hidden md:grid grid-cols-2 gap-3 mt-8">
              <button
                onClick={handleAddToCart}
                className="py-4 font-black uppercase tracking-[0.15em] text-sm flex items-center justify-center gap-3 active:scale-95 transition-all"
                style={{ backgroundColor: '#ff3f6c', color: '#fff' }}
              >
                <ShoppingBag size={16} /> Add to Bag
              </button>
              <button className="py-4 font-black uppercase tracking-[0.15em] text-sm flex items-center justify-center gap-3 transition-all active:scale-95" style={{ border: '1px solid #d4d5d9', color: '#282C3F' }}>
                <Heart size={16} /> Wishlist
              </button>
            </div>

            {/* Trust Bullet Points */}
            <div className="py-6 mt-4 space-y-3" style={{ borderTop: '1px solid #eaeaec' }}>
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-[#282C3F] shrink-0" />
                <span className="text-[12px] text-[#282C3F] font-semibold">100% Original Products</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw size={18} className="text-[#282C3F] shrink-0" />
                <span className="text-[12px] text-[#282C3F] font-semibold">Easy 14-day Returns & Exchange</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-[#282C3F] shrink-0" />
                <span className="text-[12px] text-[#282C3F] font-semibold">Pay on Delivery Available</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck size={18} className="text-[#282C3F] shrink-0" />
                <span className="text-[12px] text-[#282C3F] font-semibold">Free Delivery on orders above $50</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white flex p-3 gap-3" style={{ borderTop: '1px solid #eaeaec', boxShadow: '0 -4px 12px rgba(0,0,0,0.06)' }}>
        <button className="flex-1 flex items-center justify-center gap-2 py-4 text-sm font-black uppercase tracking-widest" style={{ border: '1px solid #d4d5d9', color: '#282C3F' }}>
          <Heart size={18} /> Wishlist
        </button>
        <button
          onClick={handleAddToCart}
          className="flex-[1.5] flex items-center justify-center gap-2 py-4 text-sm font-black uppercase tracking-widest active:scale-95 transition-transform"
          style={{ backgroundColor: '#ff3f6c', color: '#fff' }}
        >
          <ShoppingBag size={18} /> Add to Bag
        </button>
      </div>

      <CrossSellCarousel products={recommendations} />
      
      <div id="reviews" className="bg-white py-16 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <ProductReviews />
        </div>
      </div>

      <VTOModal isOpen={isVTOOpen} onClose={() => setIsVTOOpen(false)} productImage={images[0]} productName={product.name} />
    </div>
  );
}

interface ProductClientProps {
  product: any;
  recommendations?: any[];
}
