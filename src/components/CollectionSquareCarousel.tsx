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

export default function CollectionSquareCarousel({ collections }: { collections: Collection[] }) {
  const [page, setPage] = useState(0);
  const itemsPerPage = 6;

  // Use collections starting from index 6 (or wherever the previous grid left off)
  // But for now, we'll just take the whole array and chunk it
  const chunks: Collection[][] = [];
  for (let i = 0; i < collections.length; i += itemsPerPage) {
    const chunk = collections.slice(i, i + itemsPerPage);
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
  }

  const totalPages = chunks.length;

  useEffect(() => {
    if (totalPages <= 1) return;
    
    const timer = setInterval(() => {
      setPage((prev) => (prev + 1) % totalPages);
    }, 6000);

    return () => clearInterval(timer);
  }, [totalPages]);

  return (
    <div className="w-full relative py-8">
      <div className="max-w-7xl mx-auto px-4 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
          >
            {chunks[page]?.map((col, idx) => (
              <Link
                key={`${col.id}-${page}-${idx}`}
                href={`/collections/${col.handle}`}
                className="group relative aspect-square overflow-hidden bg-neutral-100 rounded-sm hover:shadow-xl transition-shadow duration-500"
              >
                <Image
                  src={col.imageUrl || `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80&sig=${idx+20}`}
                  alt={col.name}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                />
                
                {/* Overlay with Centered Name - NEW FONT Style */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/10 transition-colors group-hover:bg-black/30">
                  <span className="text-white text-center text-lg lg:text-xl font-serif italic tracking-wider drop-shadow-lg transform transition-transform group-hover:scale-110">
                    {col.name}
                  </span>
                  <div className="mt-2 h-0.5 w-0 bg-white group-hover:w-12 transition-all duration-500" />
                </div>
              </Link>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Page Indicators */}
      <div className="flex justify-center gap-2 mt-10">
        {chunks.map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`h-0.5 transition-all duration-700 ${page === i ? 'w-12 bg-[#7dd3fc]' : 'w-4 bg-neutral-200'}`}
          />
        ))}
      </div>
    </div>
  );
}
