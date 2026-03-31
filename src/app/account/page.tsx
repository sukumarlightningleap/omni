"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Package, Heart, LogOut, Settings, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/ProductCard';

const AccountPage = () => {
  const { user, logout, isLoading, wishlist } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<'orders' | 'wishlist' | 'settings'>('orders');
  const [wishlistProducts, setWishlistProducts] = React.useState<any[]>([]);
  const [isFetchingWishlist, setIsFetchingWishlist] = React.useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  // Handle Wishlist Data Fetching
  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (wishlist.length === 0) {
        setWishlistProducts([]);
        return;
      }

      setIsFetchingWishlist(true);
      // Mock delay
      setTimeout(() => {
        const dummyProducts = [
          {
            _id: 'prod_1',
            name: 'Signature Heavyweight Hoodie',
            slug: 'signature-heavyweight-hoodie',
            image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000',
            price: '65.00 USD'
          },
          {
            _id: 'prod_2',
            name: 'Matte Black Phone Case',
            slug: 'matte-black-phone-case',
            image: 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?q=80&w=1000',
            price: '25.00 USD'
          }
        ];
        const filtered = dummyProducts.filter((p: any) => wishlist.includes(p.slug));
        setWishlistProducts(filtered);
        setIsFetchingWishlist(false);
      }, 500);
    };

    if (user && activeTab === 'wishlist') {
      fetchWishlistItems();
    }
  }, [wishlist, user, activeTab]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );
  }

  const tabs = [
    { id: 'orders', title: 'Order History', icon: <Package size={16} /> },
    { id: 'wishlist', title: 'Wishlist', icon: <Heart size={16} /> },
    { id: 'settings', title: 'Profile Settings', icon: <Settings size={16} /> },
  ];

  // Mock orders since user object might not have them in dummy state
  const mockOrders = [
    {
      id: 'ord_1',
      orderNumber: 'ON-9921',
      processedAt: new Date().toISOString(),
      totalPrice: { amount: '90.00', currencyCode: 'USD' }
    }
  ];

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
                <User size={32} />
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase italic font-display">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-neutral-500 text-[10px] tracking-[0.3em] uppercase">
                  MEMBER SINCE {new Date().getFullYear()} • {user.email}
                </p>
              </div>
            </motion.div>
          </div>

          <button 
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] border border-neutral-800 px-6 py-3 hover:bg-white hover:text-black transition-all group"
          >
            <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>

        {/* Custom Tabs */}
        <div className="flex gap-8 border-b border-neutral-900 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 transition-all border-b-2 ${
                activeTab === tab.id 
                  ? "text-white border-white" 
                  : "text-neutral-500 border-transparent hover:text-neutral-300"
              }`}
            >
              {tab.icon}
              {tab.title}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {mockOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 border-b border-neutral-900">
                        <tr>
                          <th className="pb-4 font-medium italic">Order #</th>
                          <th className="pb-4 font-medium italic">Date</th>
                          <th className="pb-4 font-medium italic">Total</th>
                          <th className="pb-4 font-medium italic text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {mockOrders.map((node) => (
                          <tr key={node.id} className="border-b border-neutral-950 hover:bg-neutral-950/50 transition-colors">
                            <td className="py-6 font-mono tracking-tighter">{node.orderNumber}</td>
                            <td className="py-6 text-neutral-400">{new Date(node.processedAt).toLocaleDateString()}</td>
                            <td className="py-6 font-bold">{node.totalPrice.amount} {node.totalPrice.currencyCode}</td>
                            <td className="py-6 text-right">
                              <span className="text-[10px] uppercase tracking-widest px-2 py-1 bg-neutral-900 text-white border border-neutral-800">
                                PAID
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-20 text-center border border-dashed border-neutral-900">
                    <p className="text-neutral-600 uppercase tracking-widest text-xs italic">You haven't placed any orders yet.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'wishlist' && (
              <motion.div
                key="wishlist"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {isFetchingWishlist ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-neutral-700" size={24} />
                  </div>
                ) : wishlistProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {wishlistProducts.map((product, idx) => (
                      <ProductCard key={product._id} product={product} index={idx} />
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center border border-dashed border-neutral-900 space-y-4">
                    <p className="text-neutral-600 uppercase tracking-widest text-xs italic">Your wishlist is empty. Go break some hearts.</p>
                    <Link href="/collections" className="inline-block text-[10px] uppercase tracking-widest border-b border-white pb-1 font-bold">
                      View Collection
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold font-display italic uppercase border-b border-neutral-900 pb-4">Personal Details</h3>
                    <div className="space-y-4">
                      <Detail label="First Name" value={user.firstName || ''} />
                      <Detail label="Last Name" value={user.lastName || ''} />
                      <Detail label="Email Address" value={user.email} />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold font-display italic uppercase border-b border-neutral-900 pb-4">Primary Address</h3>
                    <p className="text-neutral-600 text-[10px] uppercase tracking-widest italic pt-2">No address on file.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Support Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 p-12 border border-neutral-900 text-center space-y-4"
        >
          <p className="text-[10px] text-neutral-500 uppercase tracking-[0.4em]">
            Need help with an order?
          </p>
          <a href="/faq" className="text-sm font-bold border-b border-white pb-1 hover:text-neutral-400 hover:border-neutral-400 transition-all uppercase tracking-widest">
            Contact Support
          </a>
        </motion.div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-bold">{label}</p>
    <p className="text-sm text-white font-mono tracking-tighter">{value || 'Not provided'}</p>
  </div>
);

export default AccountPage;
