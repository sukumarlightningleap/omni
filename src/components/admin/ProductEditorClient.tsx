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
  const [isSaving, setIsSaving] = useState(false)

  const margin = price - product.cost
  const marginPercent = price > 0 ? (margin / price) * 100 : 0

  const handleSave = async () => {
    setIsSaving(true)
    await updateProductGatekeeper(product.id, price, collectionId)
    setIsSaving(false)
  }

  return (
    <div className="space-y-8 font-sans text-neutral-900 max-w-6xl pb-24">
      
      {/* Structural Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <Link href="/admin/products" className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-indigo-600 transition-colors mb-2">
            <ArrowLeft size={14} /> Back to Products
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Edit Product</h2>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 text-white font-bold text-xs px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COMPONENT: Visual & Meta */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-neutral-200/60 rounded-3xl overflow-hidden relative group shadow-sm">
            <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
              {product.printifyId && (
                <div className="bg-white/90 backdrop-blur border border-neutral-200/60 text-[10px] font-bold text-neutral-500 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                  <LinkIcon size={12} className="text-neutral-400" />
                  <span className="uppercase tracking-wider">{product.printifyId}</span>
                </div>
              )}
            </div>
            <div className="aspect-[16/10] w-full relative bg-neutral-50">
              {product.imageUrl ? (
                <Image src={product.imageUrl} alt={product.name} fill className="object-contain p-8" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                  <Box size={60} />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-neutral-200/60 rounded-3xl p-8 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
              Product Description
            </h3>
            <div className="text-sm text-neutral-600 leading-relaxed max-w-none prose prose-indigo" dangerouslySetInnerHTML={{ __html: product.description || "No description provided." }} />
          </div>
        </div>

        {/* RIGHT COMPONENT: Logic Controls */}
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200/60 rounded-3xl p-8 space-y-8 shadow-sm transition-all hover:shadow-md">
            
            {/* Title Section */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Marketing Name</label>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900 leading-snug">{product.name}</h1>
            </div>

            <div className="h-px bg-neutral-100" />

            {/* Pricing Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                  Pricing Configuration
                </label>
                <div className="p-1 px-2 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold">USD</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-neutral-400">Base Cost</span>
                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs font-bold text-rose-500 cursor-not-allowed">
                    ${product.cost.toFixed(2)}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-neutral-900">Retail Price</span>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">$</span>
                    <input 
                      type="number" 
                      value={price}
                      onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Profit Analysis */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex justify-between items-center text-xs">
                <span className="font-semibold text-emerald-800">Projected Profit</span>
                <span className={`font-bold ${margin > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  +${margin.toFixed(2)} ({marginPercent.toFixed(1)}%)
                </span>
              </div>
            </div>

            <div className="h-px bg-neutral-100" />

            {/* Collection Assignment */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Categorization</label>
              <select 
                value={collectionId}
                onChange={e => setCollectionId(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-600 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all appearance-none"
              >
                <option value="none">Unassigned</option>
                {collections.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="h-px bg-neutral-100" />
            
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-2 px-1">Assignment status</p>
              <div className={`p-3 rounded-lg flex items-center justify-between text-[10px] font-black tracking-widest ${product.collectionId ? "bg-white text-emerald-600 shadow-sm" : "bg-white text-rose-500 shadow-sm"}`}>
                {product.collectionId ? "PUBLISHED TO STOREFRONT" : "DRAFT (UNASSIGNED)"}
                <div className={`w-1.5 h-1.5 rounded-full ${product.collectionId ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
