import React from "react"
import { ShieldAlert, Terminal, Play, Package, Store } from "lucide-react"
import Link from "next/link"

export default function AdminDashboardPage() {
  return (
    <div className="font-mono text-white space-y-12 animate-fade-in w-full max-w-5xl">
      
      {/* Hero Greeting */}
      <div className="space-y-4 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 text-[#00FF00]">
          <Terminal size={20} />
          <h1 className="text-sm font-black tracking-[0.4em] uppercase">System Online</h1>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-neutral-500 max-w-xl leading-loose">
          Welcome to the Command Center. All diagnostic subsystems are nominal. External Handshakes connected tracking routing established. Proceed with objective oversight.
        </p>
      </div>

      {/* Metric Tiles Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Quick Action: View Shop */}
        <Link href="/" target="_blank" className="group p-6 bg-black border border-[#1A1A1A] hover:bg-[#050505] transition-colors relative block cursor-pointer">
          <div className="mb-4 text-neutral-600 group-hover:text-white transition-colors">
            <Store size={24} />
          </div>
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white mb-2">View Shop Front</h2>
          <p className="text-[9px] text-neutral-500 uppercase tracking-widest">Observe live frontend client interface.</p>
        </Link>
        
        {/* Quick Action: Sync Printify */}
        <Link href="/admin/products" className="group p-6 bg-black border border-[#1A1A1A] hover:bg-[#050505] transition-colors relative block cursor-pointer">
          <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="mb-4 text-neutral-600 group-hover:text-yellow-500 transition-colors">
            <Play size={24} />
          </div>
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white mb-2">Sync Printify</h2>
          <p className="text-[9px] text-neutral-500 uppercase tracking-widest">Manual API override integration protocol.</p>
        </Link>

        {/* Quick Action: Check Orders */}
        <Link href="/admin/orders" className="group p-6 bg-black border border-[#1A1A1A] hover:bg-[#050505] transition-colors relative block cursor-pointer">
          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="mb-4 text-neutral-600 group-hover:text-blue-500 transition-colors">
            <Package size={24} />
          </div>
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white mb-2">Check Orders</h2>
          <p className="text-[9px] text-neutral-500 uppercase tracking-widest">Verify fulfillment and shipping signals.</p>
        </Link>

      </div>

      {/* Security Check Panel */}
      <div className="mt-12 p-6 border border-white/5 bg-[#050505] flex items-center gap-4">
        <ShieldAlert size={20} className="text-yellow-500 shrink-0" />
        <div className="text-[9px] uppercase tracking-[0.2em] text-neutral-400">
          <strong className="text-white block mb-1">SECURITY CLEARANCE: ROOT</strong>
          You are authenticated directly against the localized database framework. Standard users are firewalled.
        </div>
      </div>

    </div>
  )
}
