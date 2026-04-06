"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface Collection {
  id: string;
  name: string;
  handle: string;
  imageUrl?: string | null;
}

export default function CategoryBudgetCarousel({ collections }: { collections: Collection[] }) {
  const [page, setPage] = useState(0);
  const itemsPerPage = 5;

  // Use all collections from DB, chunked into 5s
  const chunks: Collection[][] = [];
  for (let i = 0; i < collections.length; i += itemsPerPage) {
    const chunk = collections.slice(i, i + itemsPerPage);
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
  }

  // Handle case where total collections < 5 or empty
  const totalPages = chunks.length;

  useEffect(() => {
    if (totalPages <= 1) return;
    
    const timer = setInterval(() => {
      setPage((prev) => (prev + 1) % totalPages);
    }, 7000); // 7 Seconds Interval

    return () => clearInterval(timer);
  }, [totalPages]);

  return (
    <div className="w-full relative py-4">
      <div className="max-w-7xl mx-auto px-4 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-0 border-t border-l border-neutral-100"
          >
            {chunks[page]?.map((col, idx) => (
              <Link
                key={`${col.id}-${page}-${idx}`}
                href={`/collections/${col.handle}`}
                className="group flex flex-col items-center hover:-translate-y-1 transition-transform duration-300"
              >
                {/* Image Container: 4:5 Aspect Ratio, Rounded from top */}
                <div className="relative w-full aspect-[4/5] rounded-t-2xl overflow-hidden bg-neutral-100 mb-0">
                  <Image
                    src={col.imageUrl || `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80&sig=${idx}`}
                    alt={col.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                {/* Info Block: Light Blue Flow Gradient */}
                <div className="w-full bg-gradient-to-b from-[#E0F2FE] to-white px-3 py-6 text-center border-x border-b border-neutral-100 shadow-sm">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[12px] font-bold text-black uppercase tracking-tighter">UNDER</span>
                    <span className="text-2xl font-black text-black leading-none mb-2">₹599</span>
                    <span className="text-[12px] text-neutral-500 lowercase font-medium">
                      {col.name}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Page Indicators */}
      <div className="flex justify-center gap-2 mt-8">
        {chunks.map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`h-1 transition-all duration-500 rounded-full ${page === i ? 'w-8 bg-[#282C3F]' : 'w-2 bg-neutral-200'}`}
          />
        ))}
      </div>
    </div>
  );
}
