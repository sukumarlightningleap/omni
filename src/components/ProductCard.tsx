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

          {/* Glassmorphism Rating — Bottom Left */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] font-bold bg-white/60 backdrop-blur-md border border-white/20 text-[#282c3f] shadow-sm">
            4.2 ★ <span className="text-neutral-500 font-normal">| 1.2k</span>
          </div>

          {/* Quick Add / View Floating Bar */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: isHovered ? '0%' : '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg flex divide-x divide-neutral-100 border-t border-neutral-100 z-20"
          >
            <button 
              onClick={handleQuickAdd}
              className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest text-[#ff3f6c] hover:bg-[#ff3f6c] hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag size={14} /> Add to Bag
            </button>
          </motion.div>
        </div>

        {/* ── PRODUCT METADATA ─────────────────────────── */}
        <div className="px-3 pt-4 pb-5">
          <div className="space-y-0.5 mb-2">
            <h3 className="text-[14px] font-black text-[#282C3F] uppercase tracking-tighter italic">
              UNRWLY
            </h3>
            <p className="text-[12px] text-[#535766] truncate opacity-70 font-medium">
              {product.name}
            </p>
          </div>

          <div className="flex items-baseline gap-2 mt-3 flex-wrap">
            <span className="text-[14px] font-black text-[#282C3F]">{product.price}</span>
            {mrp && (
              <>
                <span className="text-[11px] text-[#94969f] line-through">₹{mrp}</span>
                <span className="text-[11px] font-bold text-[#ff3f6c]">
                   ({discountPct}% OFF)
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
