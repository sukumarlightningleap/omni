"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

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

const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.items.some((i) => i.id === product._id));
  
  const [isHovered, setIsHovered] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);

  const activeRawPrice = useMemo(() => {
    if (product.rawPrice) return product.rawPrice;
    if (!product.price) return 0;
    const parsed = parseFloat(product.price.replace(/[^0-9.-]+/g, ""));
    return isNaN(parsed) ? 0 : parsed;
  }, [product.rawPrice, product.price]);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: `${product._id}-default`,
      productId: product._id,
      name: product.name,
      price: activeRawPrice,
      image: product.image,
      quantity: 1,
      variantId: product.variantId || '',
    });
    setDrawerOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.211, 0, 0.076, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-[#F6F6F6] transition-all duration-700"
    >
      <Link href={`/products/${product.slug}`} className="block">
        {/* ── IMAGE CONTAINER ────────────────────────────── */}
        <div className="relative w-full overflow-hidden aspect-[3/4] bg-neutral-100">
          <AnimatePresence mode="wait">
            <motion.div
              key={isHovered && product.secondaryImage ? 'secondary' : 'primary'}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.211, 0, 0.076, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={isHovered && product.secondaryImage ? product.secondaryImage : (product.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600')}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
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
              toggleWishlist({
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                slug: product.slug,
                rawPrice: activeRawPrice,
              });
            }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center z-10 transition-all hover:bg-white/30 hover:scale-110"
          >
            <Heart
              size={18}
              className={`transition-all duration-300 ${isInWishlist ? 'fill-[#ff3f6c] text-[#ff3f6c] scale-110' : 'text-white'}`}
            />
          </motion.button>

          {/* Quick Add Overlay (Desktop) */}
          <div className="absolute inset-x-4 bottom-4 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 hidden md:block">
            <button
              onClick={handleQuickAdd}
              className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ShoppingBag size={14} />
              Add to Bag
            </button>
          </div>
        </div>

        {/* ── PRODUCT METADATA ─────────────────────────── */}
        <div className="pt-6 pb-4">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <h3 className="text-xs md:text-sm font-medium text-neutral-400 uppercase tracking-widest truncate max-w-[180px]">
                {product.name}
              </h3>
              <p className="text-sm md:text-base font-black text-black tracking-tighter">
                {product.price}
              </p>
            </div>
            
            {/* Mobile Only Quick Add Circle */}
            <button
              onClick={handleQuickAdd}
              className="md:hidden w-10 h-10 rounded-full bg-black flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
            >
              <ShoppingBag size={16} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
