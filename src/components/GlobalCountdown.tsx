"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Zap } from 'lucide-react';

interface GlobalCountdownProps {
  endsAt: Date | null;
  message: string;
  isActive: boolean;
}

const GlobalCountdown = ({ endsAt, message, isActive }: GlobalCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    if (!isActive || !endsAt) return;

    const timer = setInterval(() => {
      const target = new Date(endsAt).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft(null);
        clearInterval(timer);
      } else {
        setTimeLeft({
          d: Math.floor(difference / (1000 * 60 * 60 * 24)),
          h: Math.floor((difference / (1000 * 60 * 60)) % 24),
          m: Math.floor((difference / 1000 / 60) % 60),
          s: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endsAt, isActive]);

  if (!isActive || !timeLeft) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ delay: 1, duration: 0.8, ease: "circOut" }}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[40] rotate-[-2deg] origin-right"
      >
        <div className="bg-[#D97757] text-white py-10 px-4 flex flex-col items-center gap-8 shadow-2xl rounded-l-[2rem] border-l border-white/20 backdrop-blur-sm">
          {/* Brand/Message Icon */}
          <div className="flex flex-col items-center gap-4">
            <Zap size={16} className="animate-pulse fill-white" />
            <div className="[writing-mode:vertical-lr] text-[11px] font-serif italic font-bold tracking-tighter lowercase rotate-180 mb-2">
              {message}
              <span>{String(timeLeft.h).padStart(2, '0')}</span>
              <span className="text-white/50 text-[8px] font-sans">H</span>
            </div>
            <span className="text-white/30">:</span>
            <div className="flex items-center gap-1">
              <span>{String(timeLeft.m).padStart(2, '0')}</span>
              <span className="text-white/50 text-[8px] font-sans">M</span>
            </div>
            <span className="text-white/30">:</span>
            <div className="flex items-center gap-1 text-yellow-300">
              <span>{String(timeLeft.s).padStart(2, '0')}</span>
              <span className="text-white/50 text-[8px] font-sans">S</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalCountdown;
