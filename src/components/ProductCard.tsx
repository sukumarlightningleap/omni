"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
// 1. IMPORT YOUR NEW ZUSTAND STORE
import { useCartStore } from '@/store/useCartStore';

interface Product {
  _id: string;
  variantId: string;
  name: string;
  slug: string;
  image: string;
  secondaryImage?: string;
  price: string;
  rawPrice?: number; // Added to handle the math for your cart totals
  category: string;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  // 2. CONNECT TO THE ZUSTAND STATE MACHINE
  const addItem = useCartStore((state) => state.addItem);

  const { wishlist, toggleWishlist } = useAuth();
  const isWishlisted = wishlist.includes(product.slug);

  // 3. THE NEW ADD TO CART FUNCTION
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop the link from redirecting you
    e.stopPropagation(); // Stop the click event from bubbling up

    addItem({
      id: `${product._id}-${product.variantId}`,
      productId: product._id,
      name: product.name,
      price: product.rawPrice || 0, // Uses the unformatted number from Printify
      image: product.image,
      quantity: 1,
      variantId: product.variantId,
    });

    // Temporary visual feedback until we build the sliding drawer
    alert(`${product.name} added to cart! 🛒`);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group"
    >
      <div className="relative mb-4">
        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-50 rounded-sm">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover object-center w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            {product.secondaryImage && (
              <Image
                src={product.secondaryImage}
                alt={`${product.name} alternate`}
                fill
                className="object-cover object-center w-full h-full opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            )}
          </div>
        </Link>

        {/* Wishlist Heart Icon */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.slug);
          }}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 opacity-0 group-hover:opacity-100 hover:bg-white transition-all duration-300 shadow-sm"
        >
          <Heart
            size={14}
            className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}
          />
        </button>

        {/* 4. THE UPDATED QUICK ADD BUTTON */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 left-3 right-3 py-3 bg-black text-white text-[10px] uppercase font-bold tracking-widest opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 z-10 rounded-sm shadow-lg"
        >
          Quick Add
        </button>
      </div>

      <Link href={`/products/${product.slug}`} className="block">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate pr-2">{product.name}</h3>
          <p className="text-xs font-bold text-gray-950">{product.price}</p>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">{product.category}</p>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
