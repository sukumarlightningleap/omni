"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroSequencerProps {
  urls: string[];
  poster?: string | null;
}

const DEFAULT_VIDEOS = [
  "https://res.cloudinary.com/dydv8v9p6/video/upload/v1712614561/hero-1_qjhsqv.mp4",
  "https://res.cloudinary.com/dydv8v9p6/video/upload/v1712614561/hero-2_pjysqv.mp4",
  "https://res.cloudinary.com/dydv8v9p6/video/upload/v1712614561/hero-3_ojysqv.mp4",
  "https://res.cloudinary.com/dydv8v9p6/video/upload/v1712614561/hero-4_njysqv.mp4"
];

const slideVariants = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '-100%' }
};

export default function HeroSequencer({ urls, poster }: HeroSequencerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter out empty strings and fallback to defaults
  const activeUrls = (urls && urls.filter(u => u.trim() !== "").length > 0) 
    ? urls.filter(u => u.trim() !== "") 
    : DEFAULT_VIDEOS;

  const handleEnded = () => {
    setCurrentIndex((prev) => (prev + 1) % activeUrls.length);
  };

  return (
    <div className="relative w-full h-full bg-gray-950 overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          <video
            src={activeUrls[currentIndex]}
            poster={poster || undefined}
            autoPlay
            muted
            playsInline
            onEnded={handleEnded}
            className="w-full h-full object-cover opacity-80"
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Brand Overlay - Constant */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/90 via-[#FFF5F2]/10 to-transparent pointer-events-none" />
    </div>
  );
}
