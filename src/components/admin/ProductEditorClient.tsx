"use client"

import React, { useState } from "react"
import { ArrowLeft, Save, Loader2, Link as LinkIcon, DollarSign, Box } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { updateProductGatekeeper } from "@/app/actions/admin/products"
import { StatusBadge } from "@/components/admin/StatusBadge"

type ProductData = {
  id: string
  name: string
  description: string | null
  price: number
  cost: number
  imageUrl: string
  status: string
  collectionId: string | null
  printifyId: string | null
}

type CollectionData = {
  id: string
  name: string
}

export default function ProductEditorClient({
  product,
  collections
}: {
  product: ProductData
  collections: CollectionData[]
}) {
  const [price, setPrice] = useState(product.price)
  const [collectionId, setCollectionId] = useState(product.collectionId || "none")
  const [status, setStatus] = useState<"DRAFT" | "ACTIVE" | "ARCHIVED">(product.status as any)
  const [isSaving, setIsSaving] = useState(false)

  const margin = price - product.cost
  const marginPercent = price > 0 ? (margin / price) * 100 : 0

  const handleSave = async () => {
    setIsSaving(true)
    await updateProductGatekeeper(product.id, price, collectionId, status)
    setIsSaving(false)
  }

  return (
    <div className="space-y-6 font-mono text-white max-w-5xl pb-24">
      
      {/* Structural Header */}
      <div className="flex justify-between items-center border-b border-[#1A1A1A] pb-4">
        <Link href="/admin/products" className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 hover:text-white uppercase tracking-widest transition-colors">
          <ArrowLeft size={14} /> Return to Holding Pen
        </Link>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#00FF00] text-black font-black text-[10px] uppercase tracking-widest px-8 py-3 flex items-center gap-2 hover:bg-[#00CC00] transition-colors shadow-lg disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Asset Matrix
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COMPONENT: Visual & Meta (Locked to Printify) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-[#1A1A1A] bg-black overflow-hidden relative group">
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              <StatusBadge status={status} />
              {product.printifyId && (
                <span className="bg-black/80 backdrop-blur border border-white/10 text-[8px] uppercase tracking-[0.2em] px-2 py-1 flex items-center gap-1.5 w-fit">
                  <LinkIcon size={10} /> {product.printifyId}
                </span>
              )}
            </div>
            <div className="aspect-[4/3] w-full relative bg-[#050505]">
              {product.imageUrl && product.imageUrl.includes('http') ? (
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-neutral-700">
                  <Box size={40} />
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#050505] border border-[#1A1A1A] p-6 space-y-4">
            <h3 className="text-[10px] text-[#00FF00] uppercase tracking-widest font-bold">Encrypted Description Payload</h3>
            <div className="text-[12px] text-neutral-400 leading-relaxed font-sans prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: product.description || "NO METADATA DETECTED." }} />
          </div>
        </div>

        {/* RIGHT COMPONENT: Editable Logic Controls */}
        <div className="space-y-6">
          <div className="bg-[#050505] border border-[#1A1A1A] p-6 space-y-6 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            
            {/* Title Lock */}
            <div className="space-y-2">
              <label className="text-[8px] uppercase tracking-widest text-neutral-500 font-bold block">Asset Designation</label>
              <h1 className="text-xl font-black uppercase tracking-tighter leading-none">{product.name}</h1>
            </div>

            <hr className="border-[#1A1A1A]" />

            {/* Pricing Engine */}
            <div className="space-y-4">
              <label className="text-[8px] uppercase tracking-widest text-[#00FF00] font-bold flex items-center gap-2">
                <DollarSign size={10} /> Retail Configuration
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[8px] uppercase tracking-widest text-neutral-500 block">Base Cost</span>
                  <div className="bg-black border border-[#1A1A1A] px-3 py-2 text-[10px] text-[#FF4444] font-bold cursor-not-allowed">
                    ${product.cost.toFixed(2)}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[8px] uppercase tracking-widest text-white block">Retail Price</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-[10px] font-bold">$</span>
                    <input 
                      type="number" 
                      value={price}
                      onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-black border border-white/20 text-[10px] text-white font-bold pl-7 pr-3 py-2 focus:outline-none focus:border-[#00FF00] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Real-time Profit Output */}
              <div className="pt-2 flex justify-between items-center text-[10px] tracking-widest font-bold uppercase">
                <span className="text-neutral-500">Projected Margin:</span>
                <span className={margin > 0 ? "text-[#00FF00]" : "text-[#FF4444]"}>
                  ${margin.toFixed(2)} ({marginPercent.toFixed(1)}%)
                </span>
              </div>
            </div>

            <hr className="border-[#1A1A1A]" />

            {/* Routing / Collection Assignment */}
            <div className="space-y-2">
              <label className="text-[8px] uppercase tracking-widest text-neutral-500 font-bold block">Collection Routing</label>
              <select 
                value={collectionId}
                onChange={e => setCollectionId(e.target.value)}
                className="w-full bg-black border border-white/20 text-[10px] text-white uppercase tracking-widest p-3 focus:outline-none focus:border-[#00FF00] transition-colors"
              >
                <option value="none">Unassigned (Floating)</option>
                {collections.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <hr className="border-[#1A1A1A]" />

            {/* Status Switcher */}
            <div className="space-y-2">
              <label className="text-[8px] uppercase tracking-widest text-neutral-500 font-bold block">Visibility Protocol</label>
              <div className="grid grid-cols-3 gap-2">
                {(["DRAFT", "ACTIVE", "ARCHIVED"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`text-[9px] font-bold tracking-widest uppercase py-3 border transition-colors ${
                      status === s 
                        ? (s === "ACTIVE" ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "bg-neutral-800 text-white border-neutral-600") 
                        : "bg-black text-neutral-600 border-[#1A1A1A] hover:bg-[#050505]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
