import React from 'react';
import LookbookInteractive from '@/components/LookbookInteractive';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const LookbookPage = () => {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em]">Inspiration</span>
                <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                    Lookbook
                </h1>
            </div>
            <Link 
                href="/collections"
                className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors flex items-center gap-2 group"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Back to Shopping
            </Link>
        </div>

        {/* Main Interactive Scene */}
        <div className="mb-24 shadow-2xl">
            <LookbookInteractive />
        </div>

        {/* Secondary Grid (Static Mini-Looks) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative group overflow-hidden bg-gray-100 rounded-sm aspect-[4/3]">
                <Image 
                    src="https://images.unsplash.com/photo-1583847268964-b28dc2f51ac9?q=80&w=1974&auto=format&fit=crop"
                    alt="Kitchen Setup"
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-gradient-to-t from-black/60 to-transparent">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">The Modern Kitchen</h3>
                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-2">Available April 2026</p>
                </div>
            </div>
            <div className="relative group overflow-hidden bg-gray-100 rounded-sm aspect-[4/3]">
                <Image 
                    src="https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=80&w=2070&auto=format&fit=crop"
                    alt="Workspace"
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-gradient-to-t from-black/60 to-transparent">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Focused Workspace</h3>
                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-2">Available April 2026</p>
                </div>
            </div>
        </div>

        {/* Call to Action */}
        <div className="mt-24 text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                Love this look?
            </h2>
            <p className="text-gray-500 uppercase tracking-widest text-sm max-w-lg mx-auto">
                EVERY ITEM YOU SEE IS CURATED BY OUR TOP STYLISTS TO CREATE A COHESIVE MODERN AESTHETIC.
            </p>
            <div className="flex justify-center">
                <Link 
                    href="/collections"
                    className="bg-black text-white px-12 py-5 text-sm font-bold uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl rounded-sm"
                >
                    Shop All Rooms
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LookbookPage;
