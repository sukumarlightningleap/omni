"use client"

import React, { useState } from "react"
import { Trash2, Plus, Loader2, FolderTree } from "lucide-react"
import { createCollection, deleteCollection } from "@/app/actions/admin/products"

type CollectionData = {
  id: string;
  name: string;
  description: string | null;
  handle: string;
  productCount: number;
}

export default function CollectionsClient({ initialCollections }: { initialCollections: CollectionData[] }) {
  const [collections, setCollections] = useState(initialCollections)
  const [isCreating, setIsCreating] = useState(false)
  const [newColName, setNewColName] = useState("")
  const [newColDesc, setNewColDesc] = useState("")
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newColName.trim()) return

    setIsCreating(true)
    await createCollection(newColName, newColDesc)
    // In a real app we'd rely on Server Actions revalidating or we'd just reload/refresh router here
    // But since server actions revalidatePath, it should automatically update the props on navigation.
    window.location.reload()
  }

  const handleDelete = async (id: string) => {
    setLoadingIds(prev => new Set(prev).add(id))
    await deleteCollection(id)
    window.location.reload()
  }

  return (
    <div className="space-y-6 font-mono text-white max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#1A1A1A] pb-4">
        <h2 className="text-sm font-black tracking-[0.2em] uppercase flex items-center gap-3">
          <FolderTree size={16} className="text-[#00FF00]" />
          Collection Manager
        </h2>
      </div>

      {/* Creation Modal / Inline Form */}
      <div className="bg-[#050505] border border-[#1A1A1A] p-6 space-y-4">
        <h3 className="text-[10px] uppercase tracking-widest text-[#00FF00] font-bold">Instantiate Collection</h3>
        <form onSubmit={handleCreate} className="flex flex-col gap-4 max-w-lg">
          <input 
            type="text" 
            placeholder="COLLECTION NAME (e.g. SUMMER ARCHIVE)" 
            value={newColName}
            onChange={e => setNewColName(e.target.value)}
            disabled={isCreating}
            className="bg-black border border-[#1A1A1A] text-[10px] uppercase tracking-widest text-white px-4 py-3 focus:outline-none focus:border-[#00FF00] transition-colors"
          />
          <textarea 
            placeholder="OPTIONAL DESCRIPTION FOR SEO / MARKETING..." 
            value={newColDesc}
            onChange={e => setNewColDesc(e.target.value)}
            disabled={isCreating}
            rows={2}
            className="bg-black border border-[#1A1A1A] text-[10px] uppercase tracking-widest text-white px-4 py-3 focus:outline-none focus:border-[#00FF00] transition-colors resize-none custom-scrollbar"
          />
          <button 
            type="submit"
            disabled={isCreating || !newColName.trim()}
            className="bg-[#00FF00] text-black font-black text-[10px] tracking-widest uppercase px-6 py-3 flex items-center justify-center gap-2 hover:bg-[#00CC00] transition-colors disabled:opacity-50"
          >
            {isCreating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Initialize
          </button>
        </form>
      </div>

      {/* Active Collections Data Table */}
      <div className="bg-black border border-[#1A1A1A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-[#1A1A1A] bg-[#0A0A0A]">
                <th className="p-4 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Collection Title</th>
                <th className="p-4 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Inventory</th>
                <th className="p-4 text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Description</th>
                <th className="p-4 text-[9px] text-right uppercase tracking-[0.2em] text-neutral-500 font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((col) => {
                const isDeleting = loadingIds.has(col.id);

                return (
                  <tr key={col.id} className="border-b border-[#1A1A1A] hover:bg-[#050505] transition-colors">
                    <td className="p-4">
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">{col.name}</span>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-1 bg-white/10 text-[#00FF00] border border-[#00FF00]/20 text-[10px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(0,255,0,0.1)]">
                        {col.productCount} Assets
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] text-neutral-400 capitalize truncate max-w-[200px] block">
                        {col.description || "—"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        disabled={isDeleting}
                        onClick={() => handleDelete(col.id)}
                        className="text-neutral-500 hover:text-[#FF4444] transition-colors p-2"
                      >
                        {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </td>
                  </tr>
                )
              })}
              {collections.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-[10px] uppercase tracking-widest text-neutral-600 bg-[#050505]">
                    NO COLLECTIONS REGISTERED
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
