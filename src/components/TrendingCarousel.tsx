"use client";

import React, { useRef } from 'react';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TrendingCarouselProps {
  products: any[];
}

const TrendingCarousel = ({ products }: TrendingCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/carousel">
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pt-4 pb-12 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product, idx) => (
          <div key={product.id || idx} className="min-w-[280px] md:min-w-[320px] lg:min-w-[340px] snap-start">
            <ProductCard product={product} index={idx} />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 p-4 bg-white shadow-xl rounded-full border border-gray-100 opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-gray-50 active:scale-90 hidden md:block"
      >
        <ChevronLeft size={24} className="text-gray-900" />
      </button>
      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 p-4 bg-white shadow-xl rounded-full border border-gray-100 opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-gray-50 active:scale-90 hidden md:block"
      >
        <ChevronRight size={24} className="text-gray-900" />
      </button>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default TrendingCarousel;
