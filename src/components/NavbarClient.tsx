"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Menu, ChevronDown, User, ArrowRight, ShieldCheck } from 'lucide-react';
import CartDrawer from './CartDrawer';
import SearchModal from './SearchModal';
import { useSession, signOut } from 'next-auth/react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { getVisibleCollections } from '@/app/actions/storefront';

const NavbarClient = ({ initialCollections = [] }: { initialCollections?: any[] }) => {
  const { data: session } = useSession();
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const setDrawerOpen = useCartStore((state) => state.setDrawerOpen);
  const clearCart = useCartStore((state) => state.clearCart);
  
  const wishlistItems = useWishlistStore((state) => state.items);
  const wishlistCount = wishlistItems.length;

  // States
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [collections, setCollections] = useState<any[]>(initialCollections);

  // Sync state when props change (revalidation)
  useEffect(() => {
    setCollections(initialCollections);
  }, [initialCollections]);

  const isAdmin = session?.user?.role === 'ADMIN';
  const router = useRouter();
  const searchParams = useSearchParams();

  // Stripe Success Detector
  useEffect(() => {
    if (searchParams.get('success')) {
      clearCart();
      router.replace('/', { scroll: false });
    }
  }, [searchParams, clearCart, router]);

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const topCollections = collections.slice(0, 5);
  const remainingCollections = collections.slice(5);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm"
        style={{ borderBottom: '1px solid #eaeaec' }}
      >
        <div className="px-4 md:px-8 h-20 flex items-center gap-2 md:gap-6">
          {/* LOGO */}
          <Link href="/" className="text-xl font-black tracking-tighter uppercase italic font-display shrink-0 text-black">
            Unrwly
          </Link>

          {/* COLLECTIONS & MORE */}
          <div className="hidden lg:flex items-center gap-6 shrink-0">
            {topCollections.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.handle}`}
                className="text-sm font-bold text-[#282C3F] uppercase tracking-wide whitespace-nowrap hover:border-b-2 hover:border-[#ff3f6c] pb-1 transition-all"
              >
                {col.name || col.title}
              </Link>
            ))}
            {remainingCollections.length > 0 && (
              <div className="relative">
                <button 
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={`text-sm font-bold text-[#282C3F] uppercase tracking-wide flex items-center gap-1 pb-1 transition-colors ${isMoreOpen ? 'text-[#ff3f6c]' : ''}`}
                >
                  More <ChevronDown size={14} className={`transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isMoreOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsMoreOpen(false)} 
                      />
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-[34px] left-0 w-56 bg-white border border-[#eaeaec] shadow-2xl p-5 space-y-4 z-50 text-left"
                      >
                        {remainingCollections.map((col) => (
                          <Link
                            key={col.id}
                            href={`/collections/${col.handle}`}
                            onClick={() => setIsMoreOpen(false)}
                            className="block text-xs font-bold text-[#282C3F] hover:text-[#ff3f6c] transition-colors uppercase tracking-wide"
                          >
                            {col.name || col.title}
                          </Link>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* INLINE SEARCH BAR */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value;
              if (input.trim()) router.push(`/collections?q=${encodeURIComponent(input.trim())}`);
            }}
            className="hidden md:flex flex-1 max-w-[300px] ml-12 items-center h-10 rounded-sm overflow-hidden bg-[#f5f5f6] border border-transparent focus-within:bg-white focus-within:border-[#eaeaec] transition-all"
          >
            <div className="pl-3 text-[#94969f]">
              <Search size={16} />
            </div>
            <input
              name="q"
              type="text"
              placeholder="Search for products..."
              className="flex-1 h-full px-3 text-xs bg-transparent focus:outline-none text-[#282C3F] placeholder:text-[#94969f]"
            />
          </form>

          {/* ICONS ROW */}
          <div className="flex items-center gap-2 md:gap-10 ml-auto shrink-0">
            {/* Profile */}
            <button
              onClick={() => session ? router.push(isAdmin ? '/admin/products' : '/account') : router.push('/auth')}
              className="hidden sm:flex flex-col items-center gap-1 group"
            >
              <User size={20} className="text-[#282C3F] group-hover:text-[#ff3f6c] transition-colors" />
              <span className="text-[11px] font-bold text-[#282C3F] uppercase tracking-wide">Profile</span>
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="hidden sm:flex flex-col items-center gap-1 group relative">
              <div className="relative">
                <svg 
                  className={`w-5 h-5 transition-colors ${wishlistCount > 0 ? 'text-[#ff3f6c] fill-[#ff3f6c]' : 'text-[#282C3F] group-hover:text-[#ff3f6c]'}`}
                  viewBox="0 0 24 24" 
                  fill={wishlistCount > 0 ? "currentColor" : "none"}
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ff3f6c] text-white rounded-full flex items-center justify-center text-[8px] font-black w-4 h-4">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-bold text-[#282C3F] uppercase tracking-wide">Wishlist</span>
            </Link>

            {/* Bag */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex flex-col items-center gap-1 group relative"
            >
              <div className="relative">
                <ShoppingBag size={20} className="text-[#282C3F] group-hover:text-[#ff3f6c] transition-colors" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ff3f6c] text-white rounded-full flex items-center justify-center text-[8px] font-black w-4 h-4">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-bold text-[#282C3F] uppercase tracking-wide">Bag</span>
            </button>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#282C3F]"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white z-[70] lg:hidden shadow-2xl p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="text-sm font-black tracking-tighter uppercase italic">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-neutral-400">
                  <ArrowRight size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                <span className="text-[10px] font-black tracking-[0.3em] text-neutral-300 uppercase">Collections</span>
                {collections.map((col) => (
                  <Link 
                    key={col.id} 
                    href={`/collections/${col.handle}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-black tracking-tighter text-black hover:text-neutral-500 transition-colors uppercase italic"
                  >
                    {col.title}
                  </Link>
                ))}
                {collections.length === 0 && (
                  <Link href="/collections/all" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-black tracking-tighter text-black uppercase italic">
                    New Arrivals
                  </Link>
                )}
              </div>

              <div className="mt-auto pt-10 border-t border-neutral-100 flex flex-col gap-4">
                <Link href="/lookbook" className="text-[10px] font-black tracking-[0.3em] text-neutral-400 uppercase">Lookbook</Link>
                {session ? (
                   <button onClick={() => signOut()} className="text-[10px] font-black tracking-[0.3em] text-red-500 uppercase text-left underline underline-offset-4">Logout</button>
                ) : (
                   <Link href="/auth" className="text-[10px] font-black tracking-[0.3em] text-black uppercase">Login</Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartDrawer />
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
};

export default NavbarClient;
