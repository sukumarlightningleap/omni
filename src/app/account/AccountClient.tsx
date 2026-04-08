"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Package, Heart, LogOut, Settings, Loader2, ShoppingBag, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import ProductCard from '@/components/ProductCard';
import { useWishlistStore } from '@/store/useWishlistStore';

interface AccountClientProps {
  orders: any[];
}

const AccountClient = ({ orders }: AccountClientProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'settings'>('orders');
  
  const wishlistItems = useWishlistStore((state) => state.items);
  const isLoading = status === 'loading';
  const user = session?.user;

  // STRICT ADMIN REDIRECT
  useEffect(() => {
    if (status === 'authenticated' && user?.role === 'ADMIN') {
      router.push('/admin');
    }
  }, [user, status, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F6F7] flex items-center justify-center">
        <Loader2 className="animate-spin text-neutral-300" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F6F6F7] flex flex-col items-center justify-center p-6 space-y-8">
        <div className="space-y-4 text-center">
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-black">
            Access Denied
          </h2>
          <p className="text-neutral-400 text-[10px] tracking-[0.3em] uppercase font-black">
            Session Expired or Identity Not Verified
          </p>
        </div>
        <Link 
          href="/auth"
          className="px-12 py-4 bg-black text-white text-[10px] uppercase tracking-[0.4em] font-black hover:bg-neutral-800 transition-all rounded-2xl shadow-lg"
        >
          Verify Identity
        </Link>
      </div>
    );
  }

  const userFirstName = user.name?.split(' ')[0] || 'Member';
  const userLastName = user.name?.split(' ').slice(1).join(' ') || '';

  const tabs = [
    { id: 'orders', title: 'Order History', icon: <Package size={16} /> },
    { id: 'wishlist', title: 'Wishlist', icon: <Heart size={16} /> },
    { id: 'settings', title: 'Identity Settings', icon: <User size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F6F6F7] pt-40 pb-20 px-6 md:px-12 text-black font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-6"
            >
              <div className="w-20 h-20 bg-white border border-neutral-200 rounded-[30px] flex items-center justify-center text-black shadow-sm">
                <User size={32} />
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-black">
                  {userFirstName} {userLastName}
                </h1>
                <p className="text-neutral-400 text-[10px] tracking-[0.4em] uppercase font-bold">
                  Member Profile • {user.email}
                </p>
              </div>
            </motion.div>
          </div>

          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] bg-white border border-neutral-200 px-8 py-4 rounded-2xl hover:bg-neutral-50 transition-all shadow-sm group text-black"
          >
            <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
            Terminate Session
          </button>
        </div>

        {/* Custom Tabs */}
        <div className="flex gap-10 border-b border-neutral-200 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 text-[11px] uppercase tracking-[0.3em] font-black flex items-center gap-2 transition-all border-b-2 ${
                activeTab === tab.id 
                  ? "text-black border-black" 
                  : "text-neutral-400 border-transparent hover:text-black"
              }`}
            >
              {tab.icon}
              {tab.title}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {orders.length > 0 ? (
                  <div className="bg-white border border-neutral-200 rounded-[40px] p-8 md:p-10 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 border-b border-neutral-100">
                          <tr>
                            <th className="pb-6 font-black italic text-black">Order Identity</th>
                            <th className="pb-6 font-black italic">Timestamp</th>
                            <th className="pb-6 font-black italic">Logistics Status</th>
                            <th className="pb-6 font-black italic text-right">Clearance</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {orders.map((order) => (
                            <tr key={order.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors last:border-0 font-bold uppercase italic tracking-widest text-[11px]">
                              <td className="py-8 font-black text-black">
                                <div className="space-y-1">
                                  <p>{order.orderNumber || 'UNR-XXXX'}</p>
                                  <p className="text-[8px] text-neutral-400 not-italic uppercase font-bold tracking-widest">
                                    {order.items?.length || 0} Units Assigned
                                  </p>
                                </div>
                              </td>
                              <td className="py-8 text-neutral-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                              <td className="py-8">
                                <div className="flex flex-col gap-2">
                                  <span className="text-black">${order.totalAmount.toFixed(2)}</span>
                                  {order.trackingUrl && (
                                    <a 
                                      href={order.trackingUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                                    >
                                      <span className="text-[8px] font-black underline underline-offset-4">Track Shipment</span>
                                      <ExternalLink size={10} />
                                    </a>
                                  )}
                                </div>
                              </td>
                              <td className="py-8 text-right">
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[9px] font-black tracking-widest ${
                                  order.status === 'PAID' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                  order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                  order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                  'bg-neutral-50 text-neutral-400 border-neutral-100'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-neutral-200 rounded-[40px] py-32 flex flex-col items-center justify-center space-y-6 shadow-sm border-dashed">
                    <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200">
                      <ShoppingBag size={40} />
                    </div>
                    <div className="text-center space-y-2">
                       <p className="text-black font-black uppercase italic tracking-[0.2em] text-lg">Your collection is currently empty.</p>
                       <p className="text-neutral-400 text-[10px] uppercase tracking-widest font-bold">Initiate your first acquisition today.</p>
                    </div>
                    <Link href="/collections" className="mt-4 px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-neutral-800 transition-all shadow-lg active:scale-95">
                       Acquire Products
                    </Link>
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
                {wishlistItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {wishlistItems.map((product: any, idx) => (
                      <ProductCard key={product.id} product={{ ...product, _id: product.id }} index={idx} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-neutral-200 rounded-[40px] py-32 flex flex-col items-center justify-center space-y-6 shadow-sm border-dashed">
                    <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200">
                      <Heart size={40} />
                    </div>
                    <div className="text-center space-y-2">
                       <p className="text-black font-black uppercase italic tracking-[0.2em] text-lg">Wishlist is currently offline.</p>
                       <p className="text-neutral-400 text-[10px] uppercase tracking-widest font-bold">Bookmark your favorite pieces to see them here.</p>
                    </div>
                    <Link href="/collections" className="mt-4 px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-neutral-800 transition-all shadow-lg active:scale-95">
                       Browse Catalog
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
                className="max-w-2xl bg-white border border-neutral-200 rounded-[40px] p-10 shadow-sm"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <h3 className="text-xl font-black italic uppercase text-black border-b border-neutral-100 pb-4 tracking-tighter">Identity Details</h3>
                    <div className="space-y-6">
                      <Detail label="Verified Name" value={user.name || 'Anonymous'} />
                      <Detail label="Access Email" value={user.email || ''} />
                      <Detail label="Identity Clearance" value={user.role || 'GUEST'} />
                    </div>
                  </div>
                  <div className="space-y-8">
                    <h3 className="text-xl font-black italic uppercase text-black border-b border-neutral-100 pb-4 tracking-tighter">Primary Node</h3>
                    <p className="text-neutral-400 text-[10px] uppercase tracking-widest font-bold italic pt-2">No physical coordinates stored.</p>
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
          className="mt-20 p-12 bg-white border border-neutral-200 rounded-[40px] text-center space-y-6 shadow-sm"
        >
          <p className="text-[10px] text-neutral-400 uppercase tracking-[0.5em] font-black">
            Logistical Resolution Center
          </p>
          <a href="/faq" className="inline-block text-sm font-black border-b-2 border-black pb-1 hover:text-neutral-500 hover:border-neutral-200 transition-all uppercase tracking-[0.2em] italic">
            Access Support Handshake
          </a>
        </motion.div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-2">
    <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">{label}</p>
    <p className="text-sm text-black font-black uppercase italic tracking-widest">{value || 'Not provided'}</p>
  </div>
);

export default AccountClient;
