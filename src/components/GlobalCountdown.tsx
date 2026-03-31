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
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-red-600 text-white overflow-hidden relative z-[70]"
      >
        <div className="max-w-[1440px] mx-auto px-6 py-2 flex items-center justify-between">
          {/* Left: Message */}
          <div className="flex items-center gap-3">
            <Zap size={12} className="animate-pulse fill-white" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase leading-none">
              {message}
            </span>
          </div>

          {/* Right: The Ticking Clock */}
          <div className="flex items-center gap-4 font-mono text-[11px] font-bold">
            <div className="flex items-center gap-1">
              <span>{String(timeLeft.d).padStart(2, '0')}</span>
              <span className="text-white/50 text-[8px] font-sans">D</span>
            </div>
            <span className="text-white/30">:</span>
            <div className="flex items-center gap-1">
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
