"use client";

import React, { useState } from "react";
import { Search, ChevronDown, CheckSquare, Square, Image as ImageIcon, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import Image from "next/image";
import Link from "next/link";
import { updateProductGatekeeper, bulkPublishToCollection, syncPrintifyManual } from "@/app/actions/admin/products";

type ProductData = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  status: string;
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

  const handleUpdate = async (id: string, price: number, collectionId: string, status: "DRAFT" | "ACTIVE" | "ARCHIVED") => {
    setLoadingIds(prev => new Set(prev).add(id));
    await updateProductGatekeeper(id, price, collectionId, status);
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
    await syncPrintifyManual();
    setBulkLoading(false);
  };

  return (
    <div className="space-y-6 font-mono text-white">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-black tracking-[0.2em] uppercase">Holding Pen</h2>
        <div className="flex gap-4">
          <button 
            disabled={bulkLoading}
            onClick={handleManualSync}
            className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 border border-white/20 hover:bg-white/5 transition-colors flex items-center gap-2"
          >
            {bulkLoading && <Loader2 size={12} className="animate-spin" />}
            Sync Printify
          </button>
          <button className="text-[10px] bg-white text-black font-black uppercase tracking-widest px-6 py-2 hover:bg-neutral-200 transition-colors">
            Add Product
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 bg-black border border-[#1A1A1A] p-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={14} />
          <input
            type="text"
            placeholder="FILTER GATEKEEPER..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-[10px] uppercase tracking-widest text-white pl-10 pr-4 py-2 focus:outline-none placeholder:text-neutral-600"
          />
        </div>
        
        {/* Bulk Action Controls */}
        {selectedIds.size > 0 && (
          <div className="flex gap-2 ml-4 items-center border-l border-[#1A1A1A] pl-4">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest">{selectedIds.size} Selected</span>
            <select
              value={bulkCollectionSync}
              onChange={(e) => setBulkCollectionSync(e.target.value)}
              className="bg-black border border-[#1A1A1A] text-[10px] uppercase tracking-widest text-neutral-400 px-4 py-2 focus:outline-none"
            >
              <option value="none">No Collection</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button 
              onClick={handleBulkPublish}
              disabled={bulkLoading}
              className="px-4 py-2 bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-neutral-200"
            >
              Publish to Active
            </button>
          </div>
        )}
      </div>

      {/* High-Density Data Table */}
      <div className="bg-black border border-[#1A1A1A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[#1A1A1A] bg-[#0A0A0A]">
                <th className="p-3 w-12 text-center cursor-pointer" onClick={toggleAll}>
                  {selectedIds.size === filteredProducts.length && filteredProducts.length > 0 ? (
                    <CheckSquare size={14} className="text-white mx-auto" />
                  ) : (
                    <Square size={14} className="text-neutral-600 hover:text-white mx-auto transition-colors" />
                  )}
                </th>
                <th className="p-3 w-16 text-center"></th>
                <th className="p-3 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Product Title</th>
                <th className="p-3 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Price</th>
                <th className="p-3 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Collection</th>
                <th className="p-3 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Status</th>
                <th className="p-3 text-[9px] text-right uppercase tracking-[0.2em] text-neutral-500 font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const isSelected = selectedIds.has(product.id);
                const isUpdating = loadingIds.has(product.id);

                return (
                  <tr 
                    key={product.id} 
                    className={`border-b border-[#1A1A1A] transition-colors group ${isSelected ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'}`}
                  >
                    <td className="p-3 text-center cursor-pointer" onClick={(e) => toggleOne(product.id, e)}>
                      {isSelected ? (
                        <CheckSquare size={14} className="text-white mx-auto" />
                      ) : (
                        <Square size={14} className="text-neutral-600 group-hover:text-white mx-auto transition-colors" />
                      )}
                    </td>
                    <td className="p-3 text-center cursor-pointer hover:opacity-80 transition-opacity">
                      <Link href={`/admin/products/${product.id}`} className="block w-fit mx-auto">
                        <div className="w-10 h-10 border border-[#1A1A1A] bg-white/5 flex items-center justify-center shrink-0 relative overflow-hidden">
                          {product.imageUrl && product.imageUrl.includes('http') ? (
                            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                          ) : (
                            <ImageIcon size={14} className="text-neutral-500" />
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="p-3 group-hover:text-[#00FF00] transition-colors cursor-pointer">
                      <Link href={`/admin/products/${product.id}`} className="block w-full">
                        <span className="text-[10px] font-bold text-inherit uppercase tracking-widest">{product.name}</span>
                      </Link>
                    </td>
                    <td className="p-3">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-500 text-[10px]">$</span>
                        <input 
                          type="number"
                          defaultValue={product.price}
                          onBlur={(e) => handleUpdate(product.id, parseFloat(e.target.value), product.collectionId || "none", product.status as any)}
                          className="bg-black border border-[#1A1A1A] text-[10px] uppercase tracking-widest text-white pl-5 pr-2 py-1 w-20 focus:outline-none focus:border-white transition-colors"
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <select
                        defaultValue={product.collectionId || "none"}
                        onChange={(e) => handleUpdate(product.id, product.price, e.target.value, product.status as any)}
                        className="bg-black border border-[#1A1A1A] text-[10px] uppercase tracking-widest text-neutral-400 px-3 py-1 focus:outline-none w-32"
                      >
                        <option value="none">Unassigned</option>
                        {collections.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        disabled={isUpdating}
                        onClick={() => handleUpdate(
                          product.id, 
                          product.price, 
                          product.collectionId || "none", 
                          product.status === "ACTIVE" ? "DRAFT" : "ACTIVE"
                        )}
                        className="text-[9px] uppercase tracking-widest font-bold border border-[#1A1A1A] px-3 py-1 hover:bg-white hover:text-black transition-colors"
                      >
                        {isUpdating ? <Loader2 size={10} className="animate-spin" /> : (
                          product.status === "ACTIVE" ? "REVOKE" : "PUBLISH"
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[10px] uppercase tracking-widest text-neutral-600 bg-[#050505]">
                    NO PRODUCTS IN HOLDING PEN
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
