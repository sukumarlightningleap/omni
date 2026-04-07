"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';

interface Product {
  _id: string;
  variantId?: string;
  name: string;
  slug: string;
  image: string;
  secondaryImage?: string;
  price: string;
  rawPrice?: number;
  category?: string;
  sizes?: string[];
}

const ProductCard = ({ product }: { product: Product; index?: number }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);

  const mrp = product.rawPrice ? (product.rawPrice * 1.5).toFixed(0) : null;
  const discountPct = 33;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: `${product._id}-default`,
      productId: product._id,
      name: product.name,
      price: product.rawPrice || 0,
      image: product.image,
      quantity: 1,
      variantId: product.variantId || '',
    });
    setDrawerOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)]"
    >
      <Link href={`/products/${product.slug}`} className="block">
        {/* ── IMAGE CONTAINER ────────────────────────────── */}
        <div className="relative w-full overflow-hidden bg-[#f5f5f6] aspect-[3/4] border-b border-[#eaeaec]">
          <AnimatePresence mode="wait">
            <motion.div
              key={isHovered && product.secondaryImage ? 'secondary' : 'primary'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <Image
                src={isHovered && product.secondaryImage ? product.secondaryImage : (product.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600')}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width:640px) 50vw,(max-width:1024px) 25vw,20vw"
              />
            </motion.div>
          </AnimatePresence>

          {/* Luxe Wishlist Heart — Top Right */}
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-white/40 flex items-center justify-center z-10 transition-colors hover:bg-white"
          >
            <Heart
              size={16}
              className={isWishlisted ? 'fill-[#ff3f6c] text-[#ff3f6c]' : 'text-[#282c3f]'}
            />
          </motion.button>
        </div>

        {/* ── PRODUCT METADATA ─────────────────────────── */}
        <div className="px-3 pt-6 pb-6">
          <p className="text-[16px] md:text-[18px] font-medium text-neutral-500 tracking-tight leading-tight mb-2">
            {product.name}
          </p>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-[18px] font-black text-black tracking-tighter">
              {product.price}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
