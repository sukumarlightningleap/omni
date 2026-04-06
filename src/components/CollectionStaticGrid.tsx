"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Collection {
  id: string;
  name: string;
  handle: string;
  imageUrl?: string | null;
}

export default function CollectionStaticGrid({ collections }: { collections: Collection[] }) {
  // We expect up to 18 collections (3 rows x 6 columns)
  const displayCollections = collections.slice(0, 18);

  return (
    <div className="w-full relative py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayCollections.map((col, idx) => (
            <Link
              key={`${col.id}-${idx}`}
              href={`/collections/${col.handle}`}
              className="group flex flex-col items-center p-3 transition-transform duration-300 hover:-translate-y-1"
              style={{ 
                background: 'linear-gradient(to bottom, rgba(255,223,0,0.2) 0%, rgba(255,165,0,0.3) 100%)',
                borderRadius: '0px'
              }}
            >
              {/* Square Interior Box for Photo */}
              <div className="relative w-full aspect-square overflow-hidden bg-neutral-100 shadow-inner">
                <Image
                  src={col.imageUrl || `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80&sig=${idx+100}`}
                  alt={col.name}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </div>

              {/* Typography Block: Light Red, Bold */}
              <div className="w-full pt-4 pb-2 text-center flex flex-col items-center gap-1">
                <span className="text-[14px] font-black text-[#ff3f6c] uppercase tracking-tighter line-clamp-1">
                  {col.name}
                </span>
                <span className="text-[10px] font-black text-[#ff3f6c] hover:underline decoration-2 underline-offset-4">
                  SHOP NOW
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
