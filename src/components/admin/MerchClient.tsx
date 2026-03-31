"use client";

import React, { useState } from "react";
import Image from "next/image";
import { updateMerchSettings, addLookbookImage, deleteLookbookImage } from "@/app/actions/merch";
import { Video, Megaphone, Image as ImageIcon, Trash2, Plus, Loader2 } from "lucide-react";

type Config = {
  heroVideoUrl: string;
  promoAnnouncement: string | null;
};

type LookbookImg = {
  id: string;
  url: string;
  alt: string | null;
};

export default function MerchClient({ 
  initialConfig, 
  initialImages 
}: { 
  initialConfig: Config | null, 
  initialImages: LookbookImg[] 
}) {
  const [heroVideoUrl, setHeroVideoUrl] = useState(initialConfig?.heroVideoUrl || "");
  const [promoAnnouncement, setPromoAnnouncement] = useState(initialConfig?.promoAnnouncement || "");
  const [images, setImages] = useState(initialImages);
  const [newImageUrl, setNewImageUrl] = useState("");
  
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      await updateMerchSettings({ heroVideoUrl, promoAnnouncement });
      alert("GLOBAL ASSETS SYNCED.");
    } catch {
      alert("FAILED TO SYNC CONFIGURATION.");
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl) return;
    setIsAddingImage(true);
    try {
      await addLookbookImage(newImageUrl, "Lookbook item");
      // Optimistic append, relies on a full refresh internally but shows instantly
      setImages([{ id: Date.now().toString(), url: newImageUrl, alt: "Lookbook item" }, ...images]);
      setNewImageUrl("");
    } catch {
      alert("FAILED TO UPLOAD LOOKBOOK ASSET.");
    } finally {
      setIsAddingImage(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteLookbookImage(id);
      setImages(images.filter(img => img.id !== id));
    } catch {
      alert("FAILED TO DESTROY LOOKBOOK ASSET.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 font-mono">
      {/* Configuration Panel */}
      <section className="space-y-6">
        <h2 className="text-[10px] font-black tracking-[0.2em] uppercase border-b border-white/20 pb-4 text-white">Global Render Assets</h2>
        
        <form onSubmit={handleSaveConfig} className="space-y-6 bg-white/5 p-6 border border-white/10">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Hero Media Node (Video URL)</label>
            <div className="relative">
              <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={14} />
              <input
                type="text"
                value={heroVideoUrl}
                onChange={(e) => setHeroVideoUrl(e.target.value)}
                placeholder="/hero-banner.mp4"
                className="w-full bg-black border border-white/20 text-xs text-white px-10 py-3 focus:outline-none focus:border-white transition-colors uppercase tracking-widest placeholder:text-neutral-600 rounded-none"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Global Promo Broadcast</label>
            <div className="relative">
              <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={14} />
              <input
                type="text"
                value={promoAnnouncement}
                onChange={(e) => setPromoAnnouncement(e.target.value)}
                placeholder="FREE SHIPPING ON ARCHIVE PIECES"
                className="w-full bg-black border border-white/20 text-xs text-white px-10 py-3 focus:outline-none focus:border-white transition-colors uppercase tracking-widest placeholder:text-neutral-600 rounded-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingConfig}
            className="w-full bg-white text-black py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSavingConfig ? <Loader2 className="animate-spin" size={14} /> : "Update Configuration"}
          </button>
        </form>
      </section>

      {/* Lookbook Uploader Panel */}
      <section className="space-y-6">
        <h2 className="text-[10px] font-black tracking-[0.2em] uppercase border-b border-white/20 pb-4 text-white">Lookbook Image Data</h2>
        
        <form onSubmit={handleAddImage} className="flex gap-4">
          <div className="relative flex-1">
            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={14} />
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="HTTPS://IMAGE.URL"
              className="w-full bg-black border border-white/20 text-xs text-white px-10 py-4 focus:outline-none focus:border-white transition-colors uppercase tracking-widest placeholder:text-neutral-600 rounded-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isAddingImage || !newImageUrl}
            className="bg-white text-black px-6 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isAddingImage ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />} Ingest
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative group aspect-[0.8] bg-white/5 border border-white/10 overflow-hidden">
              <Image 
                src={img.url} 
                alt={img.alt || "Lookbook Image"} 
                fill 
                className="object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 scale-100 group-hover:scale-105" 
              />
              <button
                onClick={() => handleDeleteImage(img.id)}
                disabled={deletingId === img.id}
                className="absolute top-2 right-2 bg-black/80 backdrop-blur p-2 text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:border-red-500 disabled:opacity-50"
              >
                {deletingId === img.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
              </button>
            </div>
          ))}
          {images.length === 0 && (
            <div className="col-span-full py-20 text-center border border-dashed border-white/20 text-neutral-500 text-[10px] font-bold uppercase tracking-[0.2em]">
              NO ASSETS FOUND IN LOOKBOOK.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
