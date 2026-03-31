"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Menu, ChevronDown, User, ArrowRight, ShieldCheck } from 'lucide-react';
import CartDrawer from './CartDrawer';
import AuthModal from './AuthModal';
import SearchModal from './SearchModal';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';

const Navbar = () => {
  const { data: session, status } = useSession();
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const setDrawerOpen = useCartStore((state) => state.setDrawerOpen);
  const clearCart = useCartStore((state) => state.clearCart);

  // Auth States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);

  const isAdmin = session?.user?.role === 'ADMIN';
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Stripe Success/Cancel Detector
  useEffect(() => {
    if (searchParams.get('success')) {
      clearCart();
      router.replace('/', { scroll: false });
    }
  }, [searchParams, clearCart, router]);

  useEffect(() => {
    const dummyCollections = [
      { id: '1', handle: 'apparel', title: 'Apparel', image: { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000' } },
      { id: '2', handle: 'accessories', title: 'Accessories', image: { url: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1000' } },
      { id: '3', handle: 'drinkware', title: 'Drinkware', image: { url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=1000' } }
    ];
    setCollections(dummyCollections);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass h-20 px-6 md:px-12 flex items-center justify-between border-b border-white/5"
      >
        <div className="flex items-center gap-12">
          <Link href="/" className="text-2xl font-bold tracking-tighter uppercase italic font-display">
            Omnidrop
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[10px] font-bold tracking-[0.3em] uppercase">
             {/* Shop Link with Hover Logic */}
             <div onMouseEnter={() => setIsShopOpen(true)} onMouseLeave={() => setIsShopOpen(false)} className="relative py-8">
                <button className="flex items-center gap-2 hover:text-neutral-400 transition-colors">
                  Shop <ChevronDown size={10} className={`transition-transform ${isShopOpen ? 'rotate-180' : ''}`} />
                </button>
                {/* ... Shop Dropdown Content remains same as your original ... */}
             </div>

            <Link href="/lookbook" className="hover:text-neutral-400 transition-colors">Lookbook</Link>

            {/* ADMIN PROTECTION VISUAL */}
            {isAdmin && (
              <Link href="/admin/products" className="flex items-center gap-2 text-red-500 font-black hover:text-red-400 transition-colors">
                <ShieldCheck size={14} /> Admin
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => setIsSearchModalOpen(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Search size={18} />
          </button>

          {/* DYNAMIC USER BUTTON */}
          <button
            onClick={() => {
              if (session) {
                router.push(isAdmin ? '/admin/products' : '/account');
              } else {
                router.push('/login'); // Redirect to your custom login page
              }
            }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors relative group"
          >
            <User size={18} className={session ? 'text-white' : 'text-neutral-500'} />
            {session && (
              <span className={`absolute bottom-1 right-1 w-2 h-2 rounded-full border border-black ${isAdmin ? 'bg-red-500' : 'bg-green-500'}`} />
            )}
            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white text-black text-[8px] font-black uppercase tracking-widest px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
              {session ? `TERMINAL: ${session.user?.name?.split(' ')[0]}` : 'INITIALIZE'}
            </span>
          </button>

          <button onClick={() => setDrawerOpen(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 bg-white text-black rounded-full flex items-center justify-center text-[8px] font-black w-4 h-4">
                {itemCount}
              </span>
            )}
          </button>

          {session && (
            <button
              onClick={() => signOut()}
              className="hidden md:block text-[9px] font-bold text-neutral-500 hover:text-white transition-colors tracking-widest"
            >
              LOGOUT
            </button>
          )}
        </div>
      </motion.nav>

      <CartDrawer />
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
};

export default Navbar;
