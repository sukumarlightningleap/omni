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

interface DiscoveryItem {
  id: string;
  customImageUrl?: string | null;
  customDescription?: string | null;
  collection: Collection;
}

export default function CollectionSquareCarousel({ items }: { items: DiscoveryItem[] }) {
  const [page, setPage] = useState(0);
  const itemsPerPage = 6;

  // Chunk the items
  const chunks: DiscoveryItem[][] = [];
  for (let i = 0; i < items.length; i += itemsPerPage) {
    const chunk = items.slice(i, i + itemsPerPage);
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
            {chunks[page]?.map((item, idx) => (
              <Link
                key={`${item.id}-${page}-${idx}`}
                href={`/collections/${item.collection.handle}`}
                className="group relative aspect-square overflow-hidden bg-neutral-100 rounded-sm hover:shadow-xl transition-shadow duration-500"
              >
                <Image
                  src={item.customImageUrl || item.collection.imageUrl || `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80&sig=${idx+20}`}
                  alt={item.collection.name}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                />
                
                {/* Overlay with Centered Name - NEW FONT Style */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/10 transition-colors group-hover:bg-black/30">
                  <span className="text-white text-center text-lg lg:text-xl font-serif italic tracking-wider drop-shadow-lg transform transition-transform group-hover:scale-110">
                    {item.collection.name}
                  </span>
                  {item.customDescription && (
                    <span className="text-[10px] text-white/80 font-bold uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.customDescription}
                    </span>
                  )}
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
