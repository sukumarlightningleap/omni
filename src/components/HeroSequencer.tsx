"use client";

import React, { useState, useEffect } from 'react';

interface HeroSequencerProps {
  urls: string[];
}

const DEFAULT_VIDEOS = [
  "https://res.cloudinary.com/dydv8v9p6/video/upload/v1712614561/hero-1_qjhsqv.mp4",
  "https://res.cloudinary.com/dydv8v9p6/video/upload/v1712614561/hero-2_pjysqv.mp4",
  "https://res.cloudinary.com/dydv8v9p6/video/upload/v1712614561/hero-3_ojysqv.mp4",
  "https://res.cloudinary.com/dydv8v9p6/video/upload/v1712614561/hero-4_njysqv.mp4"
];

export default function HeroSequencer({ urls }: HeroSequencerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Filter out empty strings and fallback to defaults
  const activeUrls = (urls && urls.filter(u => u.trim() !== "").length > 0) 
    ? urls.filter(u => u.trim() !== "") 
    : DEFAULT_VIDEOS;

  const handleEnded = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % activeUrls.length);
      setIsTransitioning(false);
    }, 500); // Small delay for smooth transition if needed
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-gray-950">
      <video
        key={currentIndex}
        src={activeUrls[currentIndex]}
        autoPlay
        muted
        playsInline
        onEnded={handleEnded}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isTransitioning ? 'opacity-0' : 'opacity-80'}`}
      />
    </div>
  );
}
