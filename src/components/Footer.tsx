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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24">
          
          {/* Column 1: Brand */}
          <div className="space-y-8">
            <Link href="/" className="inline-block">
              <span className="text-3xl font-bold tracking-tighter text-black uppercase">
                {storeName}
              </span>
            </Link>
            <p className="text-gray-500 font-sans text-sm leading-relaxed max-w-[280px]">
              Premium quality essentials for your daily life. Designed with purpose, crafted with care. {storeName} is your destination for modern living.
            </p>
            <div className="flex items-center gap-4">
              <Link href="https://twitter.com" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Twitter size={18} />
              </Link>
              <Link href="https://instagram.com" className="text-gray-400 hover:text-pink-600 transition-colors">
                <Instagram size={18} />
              </Link>
              <Link href="https://facebook.com" className="text-gray-400 hover:text-blue-800 transition-colors">
                <Facebook size={18} />
              </Link>
              <Link href="https://youtube.com" className="text-gray-400 hover:text-red-600 transition-colors">
                <Youtube size={18} />
              </Link>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div className="space-y-8">
            <h3 className="text-xs font-bold text-black uppercase tracking-[0.2em]">Shop</h3>
            <ul className="space-y-4">
              <li><Link href="/collections" className="text-gray-500 hover:text-black transition-colors font-sans text-sm uppercase tracking-widest">All Products</Link></li>
              {collections
                .map((col) => (
                  <li key={col.id}>
                    <Link href={`/collections/${col.handle}`} className="text-gray-500 hover:text-black transition-colors font-sans text-sm uppercase tracking-widest">
                      {col.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="space-y-8">
            <h3 className="text-xs font-bold text-black uppercase tracking-[0.2em]">Support</h3>
            <ul className="space-y-4">
              <li><Link href="/faq" className="text-gray-500 hover:text-black transition-colors font-sans text-sm uppercase tracking-widest">FAQ</Link></li>
              <li><Link href="/account" className="text-gray-500 hover:text-black transition-colors font-sans text-sm uppercase tracking-widest">Track Order</Link></li>
              <li><Link href="/contact" className="text-gray-500 hover:text-black transition-colors font-sans text-sm uppercase tracking-widest">Contact Us</Link></li>
              <li><Link href="/policies/refund-policy" className="text-gray-500 hover:text-black transition-colors font-sans text-sm uppercase tracking-widest">Returns & Exchanges</Link></li>
            </ul>
          </div>

          {/* Column 4: Community */}
          <div className="space-y-8">
            <h3 className="text-xs font-bold text-black uppercase tracking-[0.2em]">Community</h3>
            <ul className="space-y-4">
              <li><Link href="/journal" className="text-gray-500 hover:text-black transition-colors font-sans text-sm uppercase tracking-widest">Journal</Link></li>
              <li><Link href="/lookbook" className="text-gray-500 hover:text-black transition-colors font-sans text-sm uppercase tracking-widest">Lookbook</Link></li>
              <li><Link href="/rewards" className="text-gray-500 hover:text-black transition-colors font-sans text-sm uppercase tracking-widest">Rewards</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-8">
            <h3 className="text-xs font-bold text-black uppercase tracking-[0.2em]">Stay Updated</h3>
            <div className="space-y-4">
              <p className="text-gray-500 font-sans text-sm leading-relaxed">
                Subscribe to get 10% off your first order and stay in the loop.
              </p>
              <form className="relative group">
                <input 
                  type="email" 
                  placeholder="EMAIL ADDRESS" 
                  className="w-full bg-gray-50 border border-gray-100 px-4 py-4 text-black font-sans text-xs placeholder:text-gray-400 focus:outline-none focus:border-blue-200 transition-colors uppercase tracking-widest rounded-sm"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-black transition-colors">
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
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
