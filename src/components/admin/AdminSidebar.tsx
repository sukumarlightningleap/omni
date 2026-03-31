"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Package,
  Tags,
  Users,
  Megaphone,
  BarChart,
  DollarSign,
  LogOut,
  ShieldCheck,
  TrendingUp,
  Image as ImageIcon,
  FolderTree
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { getFinancialSummary } from '@/app/actions/admin/analytics';
import { Activity } from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Home', href: '/admin' },
  { icon: Package, label: 'Orders', href: '/admin/orders' },
  { icon: Tags, label: 'Products', href: '/admin/products' },
  { icon: FolderTree, label: 'Collections', href: '/admin/products/collections' },
  { icon: Users, label: 'Customers', href: '/admin/customers' },
  { icon: ImageIcon, label: 'Content', href: '/admin/content' },
  { icon: DollarSign, label: 'Finance', href: '/admin/finance' },
  { icon: BarChart, label: 'Analytics', href: '/admin/analytics' },
  { icon: Megaphone, label: 'Marketing', href: '/admin/marketing' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [tickerTotal, setTickerTotal] = useState<number | null>(null);

  useEffect(() => {
    getFinancialSummary().then(res => setTickerTotal(res.liveTickerTotal)).catch(() => {});
  }, []);

  return (
    <aside className="w-64 border-r border-white/5 bg-black flex flex-col h-screen fixed left-0 top-0 z-[60]">
      {/* Brand Header */}
      <div className="p-8 border-b border-white/5 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white flex items-center justify-center rounded-none">
            <ShieldCheck size={18} className="text-black" />
          </div>
          <div>
            <h1 className="text-[10px] font-black tracking-[0.3em] uppercase leading-none">Omnidrop</h1>
            <p className="text-[8px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Admin Terminal</p>
          </div>
        </div>

        {/* Live Status */}
        <div className="bg-[#050505] border border-[#1A1A1A] p-3 flex flex-col gap-1.5 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
          <span className="text-[8px] text-[#00FF00] font-black tracking-widest uppercase flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-[#00FF00] rounded-full animate-pulse" />
            Terminal Status
          </span>
          <span className="text-[9px] text-neutral-400 font-bold tracking-widest uppercase truncate">
            {session?.user?.name || session?.user?.email?.split('@')[0] || "SYSADMIN"} // ENCRYPTED
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          // Special exception for home to avoid triggering active state on everything
          const isActuallyActive = item.href === '/admin' ? pathname === '/admin' : isActive;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex items-center gap-3 px-4 py-3.5 text-[10px] font-bold tracking-[0.2em] uppercase transition-all group overflow-hidden ${
                isActuallyActive ? 'text-white' : 'text-neutral-500 hover:text-neutral-200'
              }`}
            >
              {isActuallyActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/5 border-r-2 border-white z-0"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon size={16} className={`relative z-10 ${isActuallyActive ? 'text-white' : 'group-hover:text-white transition-colors'}`} />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-white/5 pt-2 pb-4 space-y-1">
        {/* Live Financial Ticker */}
        <div className="px-4 py-3 mx-2 mb-2 bg-[#050505] border border-[#1A1A1A]">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase truncate">
            <Activity size={12} className="text-[#00FF00] animate-pulse shrink-0" />
            <span className="text-[#00FF00]">LIVE LTV:</span>
            {tickerTotal !== null ? (
              <span className="text-white">${tickerTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            ) : (
              <span className="text-neutral-600">SYNC...</span>
            )}
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-[9px] font-bold tracking-widest uppercase text-neutral-500 hover:text-white transition-colors"
        >
          <TrendingUp size={14} /> View Storefront
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 w-full px-4 py-3 text-[9px] font-bold tracking-widest uppercase text-red-500 hover:bg-red-500/5 transition-all"
        >
          <LogOut size={14} /> Terminate Session
        </button>
      </div>
    </aside>
  );
}
