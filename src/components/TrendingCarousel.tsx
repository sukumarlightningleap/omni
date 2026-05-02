"use client";

import React, { useRef } from 'react';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TrendingCarouselProps {
  products: any[];
  user?: any;
}

const TrendingCarousel = ({ products, user }: TrendingCarouselProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-1">
      {products.map((product, idx) => (
        <ProductCard key={product._id || idx} product={product} index={idx} user={user} />
      ))}
    </div>
  );
};

export default TrendingCarousel;
