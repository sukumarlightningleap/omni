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
    <aside className="w-64 border-r border-neutral-200/60 bg-white flex flex-col h-screen fixed left-0 top-0 z-[60] shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
      {/* Brand Header */}
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-indigo-600 flex items-center justify-center rounded-xl shadow-lg shadow-indigo-200/50">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-tight text-neutral-900 uppercase">Unrwly</h1>
            <p className="text-[9px] text-neutral-400 font-medium uppercase tracking-[0.1em]">Internal Dashboard</p>
          </div>
        </div>

        {/* System Health / Status */}
        <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Status</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-600 uppercase">Live</span>
            </div>
          </div>
          <p className="text-[10px] text-neutral-400 font-medium truncate">
            {session?.user?.name || session?.user?.email?.split('@')[0] || "ADMIN_SESSION"}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] px-4 mb-4">Management</div>
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const isActuallyActive = item.href === '/admin' ? pathname === '/admin' : isActive;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-semibold transition-all duration-200 relative ${
                isActuallyActive 
                  ? 'text-indigo-600 bg-indigo-50/50' 
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              {isActuallyActive && (
                <motion.div
                  layoutId="activePill"
                  className="absolute left-0 w-1 h-5 bg-indigo-600 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon size={18} className={`${isActuallyActive ? 'text-indigo-600' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-neutral-100 bg-neutral-50/30">
        {/* Revenue Ticker */}
        <div className="bg-white rounded-xl border border-neutral-100 p-3 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={12} className="text-indigo-500" />
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Total Sales</span>
          </div>
          <div className="text-sm font-bold text-neutral-900">
            {tickerTotal !== null ? (
              `$${tickerTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
            ) : (
              <span className="text-neutral-300 animate-pulse">---</span>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-semibold text-neutral-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-all"
          >
            <TrendingUp size={14} /> View Store
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 w-full px-4 py-2 text-[10px] font-semibold text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </div>
    </aside>
  );
}
