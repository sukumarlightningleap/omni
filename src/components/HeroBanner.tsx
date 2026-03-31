"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

interface HeroBannerProps {
  videoSrc?: string;
  title: string;
  subtitle: string;
}

const HeroBanner: React.FC<HeroBannerProps> = ({
  // videoSrc = "/hero-demo.mp4",
  videoSrc = "/hero-banner-tote.mp4",
  // videoSrc = "/hero-banner-cap.mp4",
  // videoSrc = "/hero-banner-mug.mp4",
  title,
  subtitle
}) => {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Cinematic Video Background Overlay */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover brightness-[0.4]"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      </div>

      {/* Animated Typography Overlay */}
      <div className="relative z-10 text-center px-4 max-w-5xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="text-neutral-400 uppercase tracking-[0.4em] text-xs md:text-sm mb-6 font-medium"
        >
          {subtitle}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-tight italic font-display"
        >
          {title.split(" ").map((word, i) => (
            <motion.span
              key={i}
              initial={{ filter: "blur(10px)" }}
              animate={{ filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 1 + (i * 0.2) }}
              className="inline-block mr-4"
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="mt-12"
        >
          <Link
            href="/collections"
            className="inline-block px-10 py-4 bg-white text-black text-sm uppercase tracking-widest font-bold hover:bg-neutral-200 transition-colors"
          >
            Explore Collection
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-widest text-neutral-500">Scroll</span>
        <div className="w-[1px] h-12 bg-neutral-800 relative">
          <motion.div
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-0 w-full h-1/4 bg-white"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroBanner;
