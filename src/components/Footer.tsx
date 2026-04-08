"use client";

import Link from "next/link";
import { Twitter, Instagram, Facebook, Youtube, Send, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const Footer = () => {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Unrwly';
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    // TEMPORARY dummy data
    const dummyCollections = [
      { id: '1', handle: 'apparel', title: 'Apparel' },
      { id: '2', handle: 'accessories', title: 'Accessories' },
      { id: '3', handle: 'drinkware', title: 'Drinkware' }
    ];
    setCollections(dummyCollections);
  }, []);

  return (
    <footer className="bg-white border-t border-gray-100 pt-24 pb-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-32">
          
          {/* Column 1: Brand */}
          <div className="space-y-8">
            <Link href="/" className="inline-block">
              <span className="text-4xl font-black tracking-tighter text-[#1A1A1A] uppercase italic">
                {storeName}
              </span>
            </Link>
            <p className="text-[#334155] font-sans text-sm leading-relaxed max-w-[320px]">
              Premium quality essentials for the unruly generation. Designed with purpose, crafted with care. {storeName} is your destination for modern, production-on-demand living.
            </p>
            <div className="flex items-center gap-6">
              <Link href="https://twitter.com" className="text-slate-400 hover:text-[#1A1A1A] transition-colors">
                <Twitter size={20} />
              </Link>
              <Link href="https://instagram.com" className="text-slate-400 hover:text-[#1A1A1A] transition-colors">
                <Instagram size={20} />
              </Link>
              <Link href="https://youtube.com" className="text-slate-400 hover:text-[#1A1A1A] transition-colors">
                <Youtube size={20} />
              </Link>
            </div>
          </div>

          {/* Column 2: Support */}
          <div className="space-y-8">
            <h3 className="text-[10px] font-black text-[#0F172A] uppercase tracking-[0.4em]">Service Hub</h3>
            <ul className="space-y-5">
              <li><Link href="/faq" className="text-slate-500 hover:text-[#1A1A1A] transition-colors font-sans text-xs font-bold uppercase tracking-widest">Help Center</Link></li>
              <li><Link href="/account" className="text-slate-500 hover:text-[#1A1A1A] transition-colors font-sans text-xs font-bold uppercase tracking-widest">Logistics Tracking</Link></li>
              <li><Link href="/contact" className="text-slate-500 hover:text-[#1A1A1A] transition-colors font-sans text-xs font-bold uppercase tracking-widest">Connect with Us</Link></li>
              <li><Link href="/policies/refund-policy" className="text-slate-500 hover:text-[#1A1A1A] transition-colors font-sans text-xs font-bold uppercase tracking-widest">Returns & Manifests</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-24 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-gray-400 font-sans text-[10px] uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} {storeName}. ALL RIGHTS RESERVED.
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <Link href="/policies/privacy-policy" className="text-gray-400 hover:text-black transition-colors font-sans text-[10px] uppercase tracking-widest">Privacy Policy</Link>
            <Link href="/policies/terms-of-service" className="text-gray-400 hover:text-black transition-colors font-sans text-[10px] uppercase tracking-widest">Terms of Service</Link>
            <Link href="/policies/shipping-policy" className="text-gray-400 hover:text-black transition-colors font-sans text-[10px] uppercase tracking-widest">Shipping Policy</Link>
            <Link href="/policies/refund-policy" className="text-gray-400 hover:text-black transition-colors font-sans text-[10px] uppercase tracking-widest">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
