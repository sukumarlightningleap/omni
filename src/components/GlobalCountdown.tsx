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
        initial={{ x: '120%', opacity: 0 }}
        animate={{ 
          x: 0, 
          opacity: 1,
          y: [0, -6, 0] // Gentle hover loop
        }}
        exit={{ x: '120%', opacity: 0 }}
        transition={{ 
          x: { delay: 1, duration: 0.8, ease: "circOut" },
          y: { 
            repeat: Infinity, 
            duration: 4, 
            ease: "easeInOut" 
          }
        }}
        className="fixed right-6 top-1/2 -translate-y-1/2 z-[40] rotate-[-1deg]"
      >
        <div className="bg-[#3730A3] text-white w-72 md:w-80 p-6 shadow-2xl rounded-2xl border-l-4 border-white backdrop-blur-md flex flex-col gap-4 relative overflow-hidden group">
          {/* Subtle background glow */}
          <div className="absolute -right-10 -top-10 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
          
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap size={14} className="animate-pulse fill-white" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Flash Protocol</span>
              </div>
              <h2 className="text-xl font-serif italic font-black tracking-tighter lowercase leading-tight">
                {message}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t border-white/10 pt-4">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-mono font-bold leading-none">{String(timeLeft.d).padStart(2, '0')}</span>
                <span className="text-[10px] font-serif italic text-white/60">d</span>
              </div>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-mono font-bold leading-none">{String(timeLeft.h).padStart(2, '0')}</span>
                <span className="text-[10px] font-serif italic text-white/60">h</span>
              </div>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-mono font-bold leading-none">{String(timeLeft.m).padStart(2, '0')}</span>
                <span className="text-[10px] font-serif italic text-white/60">m</span>
              </div>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1 text-yellow-300">
                <span className="text-lg font-mono font-bold leading-none">{String(timeLeft.s).padStart(2, '0')}</span>
                <span className="text-[10px] font-serif italic text-white/60 text-white/40">s</span>
              </div>
            </div>
          </div>
          
          {/* Ticket Edge Detail */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-8 bg-white/10 rounded-full blur-sm" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalCountdown;
