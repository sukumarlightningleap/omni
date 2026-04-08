"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Image as ImageIcon, Loader2, Plus, ArrowUpRight, DollarSign, Filter, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bulkPublishToCollection, syncPrintifyManual, updateProductGatekeeper, toggleProductStatus } from "@/app/actions/admin/products";

type ProductData = {
  id: string;
  name: string;
  price: number;
  cost: number | null;
  imageUrl: string;
  collectionId: string | null;
  status: "LIVE" | "DRAFT";
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
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const router = useRouter();

  // UI Reactive Safety Net: Brute-force refresh as a fallback for the webhook
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 10000);
    return () => clearInterval(interval);
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

  const handleStatusToggle = async (productId: string, currentStatus: "LIVE" | "DRAFT") => {
    const isLive = currentStatus === "LIVE";
    setSavingIds(prev => new Set(prev).add(productId));
    try {
      const result = await toggleProductStatus(productId, !isLive);
      if (result.success) {
        setSavedIds(prev => new Set(prev).add(productId));
        setTimeout(() => {
          setSavedIds(prev => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
        }, 2000);
        router.refresh();
      }
    } catch (error: any) {
      alert(error.message || "Toggle failed.");
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleInlineUpdate = async (productId: string, price: number, collectionId: string, status: "LIVE" | "DRAFT") => {
    setSavingIds(prev => new Set(prev).add(productId));
    try {
      const result = await updateProductGatekeeper(productId, price, collectionId, status);
      if (result.success) {
        setSavedIds(prev => new Set(prev).add(productId));
        setTimeout(() => {
          setSavedIds(prev => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
        }, 2000);
        router.refresh();
      }
    } catch (error: any) {
      alert(error.message || "Update failed.");
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-8 font-sans bg-[#F6F6F7] min-h-screen p-8">
      {/* PAGE HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
           <h1 className="text-2xl font-bold text-slate-900 border-r border-slate-200 pr-4">Products</h1>
           <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Cloud Sync Active</span>
           </div>
        </div>
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
                <th className="px-4 py-4">Collection</th>
                <th className="px-4 py-4 text-right">Retail</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-4 py-4 text-right">Potential Profit</th>
                <th className="px-4 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => {
                const isSelected = selectedIds.has(product.id);
                const isSaving = savingIds.has(product.id);
                const isSaved = savedIds.has(product.id);
                const potentialProfit = product.price - (product.cost || 0);
                const hasCollection = !!product.collectionId;

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
                    <td className="px-4 py-4">
                       <select
                         disabled={isSaving}
                         value={product.collectionId || "none"}
                         onChange={(e) => handleInlineUpdate(product.id, product.price, e.target.value, product.status)}
                         className="bg-transparent border-none text-sm font-medium text-slate-600 focus:ring-0 focus:outline-none cursor-pointer hover:bg-slate-100 rounded px-1 transition-colors capitalize"
                       >
                         <option value="none">Unassigned</option>
                         {collections.map(c => (
                           <option key={c.id} value={c.id}>{c.name}</option>
                         ))}
                       </select>
                    </td>
                    <td className="px-4 py-4 text-right">
                       <div className="flex items-center justify-end gap-1">
                          <span className="text-slate-400 text-xs">$</span>
                          <input
                            type="number"
                            step="0.01"
                            disabled={isSaving}
                            defaultValue={product.price}
                            onBlur={(e) => {
                               const newPrice = parseFloat(e.target.value);
                               if (newPrice !== product.price) {
                                 handleInlineUpdate(product.id, newPrice, product.collectionId || "none", product.status);
                               }
                            }}
                            className="bg-slate-50 border-none text-right text-sm font-bold text-slate-900 w-20 px-2 py-1 rounded focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all"
                          />
                       </div>
                    </td>
                    <td className="px-4 py-4">
                       <div className="flex items-center justify-center">
                          <button
                            disabled={isSaving}
                            onClick={() => handleStatusToggle(product.id, product.status)}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${product.status === "LIVE" ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            title={`Switch to ${product.status === "LIVE" ? "DRAFT" : "LIVE"}`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${product.status === "LIVE" ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                       </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                       <div className="flex flex-col items-end">
                          <span className={`text-sm font-bold ${potentialProfit > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                             ${potentialProfit.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">per unit</span>
                       </div>
                    </td>
                    <td className="px-4 py-4 w-10 text-center">
                       {isSaving ? (
                         <Loader2 size={14} className="text-indigo-500 animate-spin" />
                       ) : isSaved ? (
                         <CheckCircle2 size={14} className="text-emerald-500 animate-in zoom-in duration-300" />
                       ) : null}
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-20 text-center text-sm font-medium text-slate-400 italic">
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
