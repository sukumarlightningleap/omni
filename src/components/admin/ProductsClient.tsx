"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronDown, CheckSquare, Square, Image as ImageIcon, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProductGatekeeper, bulkPublishToCollection, syncPrintifyManual } from "@/app/actions/admin/products";

type ProductData = {
  id: string;
  name: string;
  price: number;
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
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkCollectionSync, setBulkCollectionSync] = useState("none");
  const router = useRouter();

  // "Live" Refresh: Auto-updates the list every 10 seconds without a full page reload
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

  const handleUpdate = async (id: string, price: number, collectionId: string) => {
    setLoadingIds(prev => new Set(prev).add(id));
    await updateProductGatekeeper(id, price, collectionId);
    setLoadingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
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
      alert("Printify Sync Complete! Products have been moved into the Holding Pen.");
      window.location.reload(); // Refresh to show new data
    } else {
      alert("Sync Failed: " + (result.message || "Check server logs."));
    }
  };

  return (
    <div className="space-y-8 font-sans text-neutral-900">
      {/* Header Actions */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Holding Pen</h2>
          <p className="text-sm text-neutral-500 mt-1">Manage and publish products from Printify to your storefront.</p>
        </div>
        <div className="flex gap-3">
          <button 
            disabled={bulkLoading}
            onClick={handleManualSync}
            className="text-xs font-semibold px-5 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-all flex items-center gap-2 shadow-sm"
          >
            {bulkLoading && <Loader2 size={14} className="animate-spin text-indigo-600" />}
            Sync Printify
          </button>
          <button className="text-xs bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
            Add Product
          </button>
        </div>
      </div>

      {/* Filter & Bulk Bar */}
      <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-neutral-200/60 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-neutral-900 pl-11 pr-4 py-2 focus:outline-none placeholder:text-neutral-400"
          />
        </div>
        
        {/* Bulk Action Controls */}
        {selectedIds.size > 0 && (
          <div className="flex gap-3 items-center border-l border-neutral-100 pl-4 animate-in fade-in slide-in-from-right-4">
            <span className="text-xs font-medium text-neutral-500">{selectedIds.size} selected</span>
            <select
              value={bulkCollectionSync}
              onChange={(e) => setBulkCollectionSync(e.target.value)}
              className="bg-neutral-50 border border-neutral-100 text-xs font-semibold rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="none">Choose Collection</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button 
              onClick={handleBulkPublish}
              disabled={bulkLoading}
              className="px-5 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700 transition-all"
            >
              Publish Selected
            </button>
          </div>
        )}
      </div>

      {/* High-Density Data Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-neutral-100">
                <th className="p-4 w-12 text-center cursor-pointer" onClick={toggleAll}>
                  {selectedIds.size === filteredProducts.length && filteredProducts.length > 0 ? (
                    <CheckSquare size={18} className="text-indigo-600 mx-auto" />
                  ) : (
                    <Square size={18} className="text-neutral-300 hover:text-neutral-400 mx-auto transition-colors" />
                  )}
                </th>
                <th className="p-4 w-16"></th>
                <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Product</th>
                <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Retail Price</th>
                <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Collection Assignment</th>
                <th className="p-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right italic">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.map((product) => {
                const isSelected = selectedIds.has(product.id);
                const isUpdating = loadingIds.has(product.id);

                return (
                  <tr 
                    key={product.id} 
                    className={`group transition-all duration-200 ${isSelected ? 'bg-indigo-50/30' : 'hover:bg-neutral-50/80'}`}
                  >
                    <td className="p-4 text-center cursor-pointer" onClick={(e) => toggleOne(product.id, e)}>
                      {isSelected ? (
                        <CheckSquare size={18} className="text-indigo-600 mx-auto" />
                      ) : (
                        <Square size={18} className="text-neutral-200 group-hover:text-neutral-300 mx-auto transition-colors" />
                      )}
                    </td>
                    <td className="p-4">
                      <Link href={`/admin/products/${product.id}`} className="block w-fit">
                        <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200/60 relative overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300">
                          {product.imageUrl ? (
                            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                          ) : (
                            <ImageIcon size={18} className="text-neutral-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="p-4">
                      <Link href={`/admin/products/${product.id}`} className="block group/title">
                        <span className="text-sm font-bold text-neutral-900 group-hover/title:text-indigo-600 transition-colors uppercase tracking-tight">{product.name}</span>
                        <span className="block text-[10px] text-neutral-400 font-medium mt-0.5">ID: {product.id.substring(0, 8)}</span>
                      </Link>
                    </td>
                    <td className="p-4">
                      <div className="relative w-28 group/input">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">$</span>
                        <input 
                          type="number"
                          defaultValue={product.price}
                          onBlur={(e) => handleUpdate(product.id, parseFloat(e.target.value), product.collectionId || "none")}
                          className="w-full bg-white border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-900 pl-6 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        defaultValue={product.collectionId || "none"}
                        onChange={(e) => handleUpdate(product.id, product.price, e.target.value)}
                        className="bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-600 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-48"
                      >
                        <option value="none">Unassigned</option>
                        {collections.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black tracking-widest ${product.collectionId ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`}>
                        {product.collectionId ? "LIVE" : "PENDING"}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center border border-neutral-100">
                        <Search size={24} className="text-neutral-300" />
                      </div>
                      <p className="text-sm font-semibold text-neutral-400">No products found in holding pen.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
