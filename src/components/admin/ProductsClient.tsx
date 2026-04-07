"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Image as ImageIcon, Loader2, Plus, ArrowUpRight, DollarSign, Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bulkPublishToCollection, syncPrintifyManual } from "@/app/actions/admin/products";

type ProductData = {
  id: string;
  name: string;
  price: number;
  cost: number | null;
  imageUrl: string;
  collectionId: string | null;
};

type CollectionData = {
  id: string;
  name: string;
};

export default function ProductsClient({ 
  initialProducts, 
  collections 
}: { 
  initialProducts: ProductData[];
  collections: CollectionData[];
}) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkCollectionSync, setBulkCollectionSync] = useState("none");
  const router = useRouter();

  // UI Stabilization: We rely on manual sync and webhooks to keep data fresh 
  // without the "blinking" effect of auto-refresh intervals.
  useEffect(() => {
    // router.refresh() interval removed for stability.
  }, [router]);

  const filteredProducts = initialProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const toggleOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkPublish = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    await bulkPublishToCollection(Array.from(selectedIds), bulkCollectionSync);
    setSelectedIds(new Set());
    setBulkLoading(false);
  };

  const handleManualSync = async () => {
    setBulkLoading(true);
    const result = await syncPrintifyManual();
    setBulkLoading(false);
    if (result.success) {
      router.refresh();
      if (result.message) alert(result.message);
    } else {
      alert("Sync Failed: " + (result.message || "Check server logs."));
    }
  };

  return (
    <div className="space-y-8 font-sans bg-[#F6F6F7] min-h-screen">
      {/* PAGE HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
        <div className="flex gap-3">
          <button 
            disabled={bulkLoading}
            onClick={handleManualSync}
            className="px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
          >
            {bulkLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpRight size={16} />}
            Sync Printify
          </button>
          <button className="px-4 py-2 bg-slate-900 border border-slate-900 rounded-md text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2">
             <Plus size={16} /> Add product
          </button>
        </div>
      </div>

      {/* RESOURCE LIST CARD */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Filter & Bulk Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
           <div className="relative group flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-900 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
           </div>
           
           <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
              <Filter size={16} />
              Sort
           </button>
        </div>

        {/* Bulk Actions Overlay */}
        {selectedIds.size > 0 && (
          <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
             <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-indigo-900">{selectedIds.size} products selected</span>
                <select
                  value={bulkCollectionSync}
                  onChange={(e) => setBulkCollectionSync(e.target.value)}
                  className="bg-white border border-indigo-200 text-xs font-bold text-indigo-900 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="none">Choose Collection</option>
                  {collections.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
             </div>
             <button 
                onClick={handleBulkPublish}
                disabled={bulkLoading}
                className="px-4 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-md hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200"
             >
                Set Collection
             </button>
          </div>
        )}

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4 w-12 text-center">
                   <div 
                    className={`w-4 h-4 border rounded cursor-pointer mx-auto flex items-center justify-center transition-all ${selectedIds.size === filteredProducts.length && filteredProducts.length > 0 ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}
                    onClick={toggleAll}
                  >
                    {selectedIds.size === filteredProducts.length && filteredProducts.length > 0 && <div className="w-1.5 h-px bg-white rotate-45" />}
                  </div>
                </th>
                <th className="px-4 py-4 w-16"></th>
                <th className="px-4 py-4">Product</th>
                <th className="px-4 py-4 text-right">Status</th>
                <th className="px-4 py-4 text-right">Retail</th>
                <th className="px-4 py-4 text-right">Potential Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => {
                const isSelected = selectedIds.has(product.id);
                const potentialProfit = product.price - (product.cost || 0);
                const isLive = !!product.collectionId;

                return (
                  <tr 
                    key={product.id} 
                    className={`group hover:bg-slate-50 transition-colors ${isSelected ? 'bg-indigo-50/30' : ''}`}
                  >
                    <td className="px-6 py-4 text-center" onClick={(e) => toggleOne(product.id, e)}>
                       <div className={`w-4 h-4 border rounded cursor-pointer mx-auto flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                          {isSelected && <div className="w-1.5 h-px bg-white rotate-45" />}
                       </div>
                    </td>
                    <td className="px-4 py-4">
                       <Link href={`/admin/products/${product.id}`} className="block">
                          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 relative overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-sm">
                             {product.imageUrl ? (
                               <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                             ) : (
                               <ImageIcon size={16} className="text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                             )}
                          </div>
                       </Link>
                    </td>
                    <td className="px-4 py-4">
                       <Link href={`/admin/products/${product.id}`} className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors capitalize">{product.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium font-mono uppercase tracking-widest">{product.id.substring(0, 8)}</span>
                       </Link>
                    </td>
                    <td className="px-4 py-4 text-right">
                       {isLive ? (
                          <span className="bg-[#E3F1DF] text-[#008060] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#B7DDB0] uppercase tracking-wider">
                            Active
                          </span>
                       ) : (
                          <span className="bg-[#F1F2F3] text-[#5C5F62] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#D3D6D8] uppercase tracking-wider">
                            Draft
                          </span>
                       )}
                    </td>
                    <td className="px-4 py-4 text-right">
                       <span className="text-sm font-bold text-slate-900">${product.price.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                       <div className="flex flex-col items-end">
                          <span className={`text-sm font-bold ${potentialProfit > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                             ${potentialProfit.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">per unit</span>
                       </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-sm font-medium text-slate-400 italic">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center text-xs text-slate-500 font-medium">
           <span>{filteredProducts.length} products total</span>
        </div>
      </div>
    </div>
  );
}
