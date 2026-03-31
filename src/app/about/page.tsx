import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Heart, Zap, Globe } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white pt-32 pb-24 overflow-hidden selection:bg-white selection:text-black">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-32">
        <AnimatedSection className="max-w-4xl" direction="up">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 font-bold">The Manifesto</span>
            <div className="h-[1px] w-12 bg-neutral-800" />
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] italic mb-12 font-display">
            Existence is <br />
            <span className="text-neutral-500">Omnidrop.</span>
          </h1>
          <p className="text-2xl md:text-3xl font-light text-neutral-400 leading-tight tracking-tight max-w-2xl italic">
            Founded on the pillars of self-love, bold artistic rebellion, and a fierce feminist aesthetic. We don&apos;t just create apparel; we curate armor for the unapologetic.
          </p>
        </AnimatedSection>
      </section>

      {/* Narrative Section - 2 Columns */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-48">
        <AnimatedSection className="space-y-12" direction="left">
          <div>
            <h2 className="text-[12px] uppercase tracking-[0.3em] font-bold text-neutral-500 mb-8 italic font-display">The Story</h2>
            <p className="text-lg text-neutral-300 leading-relaxed font-light">
              Omnidrop emerged from the shadows of conformity. We saw a world that demanded silence and we chose to scream in aesthetics. Our journey began with a single vision: to merge high-fashion silhouettes with the raw, unfiltered energy of street art.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 pt-8">
            <div className="space-y-4">
              <Heart size={20} className="text-neutral-500" />
              <h3 className="text-xs uppercase tracking-widest font-bold font-display">Self-Love</h3>
              <p className="text-[10px] text-neutral-600 leading-relaxed uppercase tracking-widest">Everything starts from within. We design to empower the soul.</p>
            </div>
            <div className="space-y-4">
              <Zap size={20} className="text-neutral-500" />
              <h3 className="text-xs uppercase tracking-widest font-bold font-display">Bold Art</h3>
              <p className="text-[10px] text-neutral-600 leading-relaxed uppercase tracking-widest">No boundaries. Every piece is a canvas for the omnidrop mind.</p>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection direction="scale" className="relative aspect-[4/5] bg-neutral-900 overflow-hidden border border-neutral-800 text-center">
          <Image 
            src="/omnidrop_lifestyle_1.png" 
            alt="Omnidrop Lifestyle" 
            fill 
            className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-12">
            <p className="text-xs uppercase tracking-[0.5em] font-bold text-white/50">Berlin, Studio No. 04</p>
          </div>
        </AnimatedSection>
      </section>

      {/* Values Section */}
      <section className="bg-neutral-950/50 py-32 border-y border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-24">
          <div className="text-center space-y-6">
            <Sparkles size={32} className="mx-auto text-neutral-500" />
            <h4 className="text-sm uppercase tracking-[0.4em] font-bold font-display">Premium Craft</h4>
            <p className="text-[10px] text-neutral-600 leading-relaxed uppercase tracking-[0.2em]">Hand-crafted textures and elite materials only.</p>
          </div>
          <div className="text-center space-y-6">
            <Globe size={32} className="mx-auto text-neutral-500" />
            <h4 className="text-sm uppercase tracking-[0.4em] font-bold font-display">Global Impact</h4>
            <p className="text-[10px] text-neutral-600 leading-relaxed uppercase tracking-[0.2em]">Sustainable practices for a chaotic world.</p>
          </div>
          <div className="text-center space-y-6">
            <div className="text-4xl font-bold tracking-tighter italic text-neutral-500 mx-auto">03.</div>
            <h4 className="text-sm uppercase tracking-[0.4em] font-bold font-display">Radical Inclusion</h4>
            <p className="text-[10px] text-neutral-600 leading-relaxed uppercase tracking-[0.2em]">A safe haven for every silhouette.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-48 text-center">
        <AnimatedSection direction="fade" viewport>
          <div className="space-y-12">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter italic font-display uppercase">Join the Archive.</h2>
            <div className="flex justify-center">
              <Link 
                href="/collections"
                className="px-12 py-6 bg-white text-black text-[10px] font-bold uppercase tracking-[0.5em] hover:bg-neutral-200 transition-all"
              >
                Explore Collections
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>
    </main>
  );
}
