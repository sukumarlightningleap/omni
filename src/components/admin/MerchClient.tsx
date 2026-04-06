"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { updateMerchSettings, addLookbookImage, deleteLookbookImage, updateCollectionImage, upsertDiscoveryItem, removeDiscoveryItem } from "@/app/actions/merch";
import { upload } from "@vercel/blob/client";
import { Video, Megaphone, Image as ImageIcon, Trash2, Plus, Loader2, Star, Zap, Edit3, Check, Search, LayoutGrid, Flame, Upload, X } from "lucide-react";

type Config = {
  heroVideoUrl: string;
  promoAnnouncement: string | null;
};

type LookbookImg = {
  id: string;
  url: string;
  alt: string | null;
};

type Collection = {
  id: string;
  name: string;
  imageUrl: string | null;
}

type DiscoveryItem = {
  id: string;
  section: string;
  collectionId: string;
  customImageUrl: string | null;
  customDescription: string | null;
  collection: Collection;
}

const SECTIONS = [
  { id: "BUDGET", label: "Budget Friendly Picks", icon: Zap, color: "#4f46e5", description: "Curate under ₹599 collections" },
  { id: "OMG", label: "OMG Deals", icon: Star, color: "#f59e0b", description: "Highlight premium discounted deals" },
  { id: "CATEGORY", label: "Shop By Category", icon: LayoutGrid, color: "#10b981", description: "Manage homepage category grid" }
];

export default function MerchClient({ 
  initialConfig, 
  initialImages,
  collections,
  initialDiscovery
}: { 
  initialConfig: Config | null, 
  initialImages: LookbookImg[],
  collections: Collection[],
  initialDiscovery: DiscoveryItem[]
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [heroVideoUrl, setHeroVideoUrl] = useState(initialConfig?.heroVideoUrl || "");
  const [promoAnnouncement, setPromoAnnouncement] = useState(initialConfig?.promoAnnouncement || "");
  
  const [images, setImages] = useState(initialImages);
  
  const [activeSection, setActiveSection] = useState(searchParams.get("section") || "BUDGET");
  const [discoveryItems, setDiscoveryItems] = useState<DiscoveryItem[]>(initialDiscovery);
  
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync state with discovery items when they change from server
  useEffect(() => {
    setDiscoveryItems(initialDiscovery);
  }, [initialDiscovery]);

  const updateSection = (section: string) => {
    setActiveSection(section);
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", section);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const refreshWithSection = () => {
    router.refresh();
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", activeSection);
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Discovery Management State
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingDiscovery, setIsAddingDiscovery] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editForm, setEditForm] = useState({ imageUrl: "", description: "" });
  const [lookbookMode, setLookbookMode] = useState<"upload" | "link">("upload");
  const [manualLookbookUrl, setManualLookbookUrl] = useState("");
  const [discoveryUploadMode, setDiscoveryUploadMode] = useState<"upload" | "link">("upload");

  const activeItems = discoveryItems.filter(item => item.section === activeSection);
  const filteredCollections = collections.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !activeItems.find(item => item.collectionId === c.id)
  ); // SHOWN ALL COLLECTIONS

  const formatImageUrl = (url: string) => {
    if (!url) return url;
    // Google Drive conversion (view -> uc)
    if (url.includes('drive.google.com')) {
      if (url.includes('/file/d/')) {
        const match = url.match(/\/file\/d\/([^\/&\?]+)/);
        if (match && match[1]) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
      } else if (url.includes('id=')) {
        const match = url.match(/id=([^\/&\?]+)/);
        if (match && match[1]) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
    }
    return url;
  };

  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  const handleLookbookUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAddingImage(true);

    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      
      await addLookbookImage(blob.url, "Lookbook item");
      window.location.reload();
    } catch (error: any) {
      console.group("Lookbook Upload Diagnostic");
      console.error("Error Object:", error);
      if (error instanceof Response) {
        try {
          const body = await error.json();
          console.error("Server Response Body:", body);
          alert(`UPLOAD FAILED [${body.code || 'UNKNOWN'}]: ${body.error || error.statusText}`);
        } catch {
          console.error("Raw status:", error.status, error.statusText);
        }
      } else {
        alert(error.message || "FAILED TO UPLOAD. Check console for diagnostics.");
      }
      console.groupEnd();
    } finally {
      setIsAddingImage(false);
    }
  };

  const handleAddLookbookManual = async () => {
    if (!manualLookbookUrl) return;
    setIsAddingImage(true);
    try {
      const formattedUrl = formatImageUrl(manualLookbookUrl);
      await addLookbookImage(formattedUrl, "Lookbook item");
      window.location.reload();
    } catch {
      alert("FAILED TO ADD LOOKBOOK LINK.");
    } finally {
      setIsAddingImage(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm("Delete this image?")) return;
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

  const handleAddDiscovery = async (collectionId: string) => {
    setIsAddingDiscovery(collectionId);
    try {
      await upsertDiscoveryItem({
        section: activeSection,
        collectionId,
        customDescription: activeSection === "BUDGET" ? "UNDER ₹599" : activeSection === "CATEGORY" ? "SHOP NOW" : "PREMIUM PIECES"
      });
      refreshWithSection();
      setIsMenuOpen(false); // AUTO-CLOSE MENU AFTER SELECTION
    } catch {
      alert("FAILED TO CURATE COLLECTION.");
    } finally {
      setIsAddingDiscovery(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      
      setEditForm((prev: any) => ({ ...prev, imageUrl: blob.url }));
    } catch (error: any) {
      console.group("Discovery Upload Diagnostic");
      console.error("Error Object:", error);
      if (error instanceof Response) {
        try {
          const body = await error.json();
          console.error("Server Response Body:", body);
          alert(`UPLOAD FAILED [${body.code || 'UNKNOWN'}]: ${body.error || error.statusText}`);
        } catch {
          console.error("Raw status:", error.status, error.statusText);
        }
      } else {
        alert(error.message || "UPLOAD FAILED. Check console.");
      }
      console.groupEnd();
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveDiscovery = async (id: string) => {
    if (!confirm("Remove this collection from the section?")) return;
    try {
      await removeDiscoveryItem(id);
      setDiscoveryItems(discoveryItems.filter(i => i.id !== id));
    } catch {
      alert("FAILED TO REMOVE FROM CURATION.");
    }
  };

  const handleSaveItemEdit = async (itemId: string, collectionId: string) => {
    try {
      const formattedUrl = formatImageUrl(editForm.imageUrl);
      await upsertDiscoveryItem({
        section: activeSection,
        collectionId,
        customImageUrl: formattedUrl,
        customDescription: editForm.description
      });
      setEditingItemId(null);
      refreshWithSection();
    } catch {
      alert("FAILED TO SAVE EDITS.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 text-slate-900 px-4 md:px-8">
      <div className="max-w-7xl mx-auto mt-8 space-y-12">
        {/* Header - Integrated */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight italic">Content Management</h1>
            <p className="text-sm text-slate-500 font-medium tracking-wide">Curate your storefront experience and visual narrative.</p>
          </div>
          <button 
            onClick={handleSaveConfig}
            disabled={isSavingConfig}
            className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-100"
          >
            {isSavingConfig ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />} 
            Save Global Assets
          </button>
        </div>
        {/* ── SECTION SELECTOR ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                updateSection(section.id);
                setIsMenuOpen(false);
              }}
              className={`relative overflow-hidden group p-8 rounded-3xl border-2 transition-all text-left ${
                activeSection === section.id 
                ? 'bg-white border-indigo-600 ring-8 ring-indigo-50 shadow-xl shadow-indigo-100/50' 
                : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className={`p-4 rounded-2xl ${activeSection === section.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <section.icon size={28} />
                </div>
                {activeSection === section.id && <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Active Scope</div>}
              </div>
              <div className="mt-8 space-y-2">
                <h3 className={`text-2xl font-black transition-colors leading-none ${activeSection === section.id ? 'text-slate-900' : 'text-slate-400'}`}>
                  {section.label}
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">{section.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ── CURATION DECK ─────────────────────────────────────── */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                {activeSection === "BUDGET" ? "Budget Friendly picks" : activeSection === "OMG" ? "OMG Deals" : "Shop By Category"}
                <span className="text-slate-300 font-light px-2 border-l border-slate-200">Current Distribution</span>
              </h2>
              <p className="text-sm text-slate-500 font-medium">Collections currently appearing in the {activeSection} carousel.</p>
            </div>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <Plus size={20} /> Select Collection from Menu
            </button>
          </div>

          {isMenuOpen && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-top-4">
              <div className="flex flex-col space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Search all collections catalog..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredCollections.map(coll => (
                    <button
                      key={coll.id}
                      onClick={() => handleAddDiscovery(coll.id)}
                      disabled={isAddingDiscovery === coll.id}
                      className="group p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-600 hover:ring-2 hover:ring-indigo-50 transition-all text-left"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors uppercase truncate">{coll.name}</span>
                        {isAddingDiscovery === coll.id ? <Loader2 size={14} className="animate-spin text-indigo-600" /> : <Plus size={14} className="text-slate-300 group-hover:text-indigo-600" />}
                      </div>
                    </button>
                  ))}
                  {searchTerm && filteredCollections.length === 0 && (
                    <p className="col-span-full py-4 text-center text-slate-400 font-medium italic">No collections found in catalog</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activeItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                <div className="p-6 flex gap-6">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl border border-slate-100 relative overflow-hidden bg-slate-50 flex-shrink-0">
                    <Image src={item.customImageUrl || item.collection.imageUrl || ""} alt={item.collection.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight uppercase italic">{item.collection.name}</h3>
                        <div className="inline-block bg-indigo-50 text-indigo-700 text-[10px] font-black px-2 py-1 rounded-md tracking-widest uppercase">
                          {item.customDescription || "Set description"}
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingItemId(item.id);
                            setEditForm({ 
                              imageUrl: item.customImageUrl || "", 
                              description: item.customDescription || "" 
                            });
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleRemoveDiscovery(item.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {editingItemId === item.id && (
                      <div className="space-y-8 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-3">
                            <div className="flex justify-between items-end">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Storefront Asset Media (1080x1350px Optimized)</label>
                              <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button 
                                  onClick={(e) => { e.preventDefault(); setDiscoveryUploadMode("upload"); }}
                                  className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all ${discoveryUploadMode === "upload" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
                                >
                                  Upload
                                </button>
                                <button 
                                  onClick={(e) => { e.preventDefault(); setDiscoveryUploadMode("link"); }}
                                  className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all ${discoveryUploadMode === "link" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
                                >
                                  Link
                                </button>
                              </div>
                            </div>

                            {discoveryUploadMode === "upload" ? (
                              <label className="cursor-pointer group flex items-center justify-center gap-4 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-12 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all duration-300">
                                {isUploading ? (
                                  <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Uploading Media...</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-2">
                                    <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                      <Upload className="text-slate-400 group-hover:text-indigo-600" size={24} />
                                    </div>
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-indigo-600">Select File from Device</span>
                                  </div>
                                )}
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*,video/*"
                                  onChange={handleFileUpload}
                                  disabled={isUploading}
                                />
                              </label>
                            ) : (
                              <div className="relative">
                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                  type="text"
                                  value={editForm.imageUrl}
                                  onChange={(e) => setEditForm({...editForm, imageUrl: e.target.value})}
                                  placeholder="HTTPS://IMAGE-URL.COM/ASSET.JPG"
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Card Legend Description (E.G. UNDER ₹599)</label>
                            <input 
                              type="text"
                              value={editForm.description}
                              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                              placeholder="E.G. UNDER ₹599"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                          <button 
                            onClick={() => handleSaveItemEdit(item.id, item.collectionId)}
                            className="flex-1 bg-indigo-600 text-white text-sm font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-3"
                          >
                            <Check size={20} /> Finalize and Ingest Curation
                          </button>
                          <button 
                            onClick={() => setEditingItemId(null)}
                            className="px-8 py-4 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2"
                          >
                            <X size={18} /> Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {activeItems.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white shadow-inner">
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                    <Search size={32} />
                  </div>
                  <p className="text-xl font-bold text-slate-600">No collections curated yet</p>
                  <p className="text-sm text-slate-400 font-medium">Use the "Select Collection from Menu" button to start curating.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-12 border-t border-slate-200">
          {/* Configuration Panel */}
          <section className="space-y-8">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase italic">Global Render Assets</h2>
              <p className="text-sm text-slate-500 font-medium">Control high-level storefront media and announcements.</p>
            </div>
            
            <form onSubmit={handleSaveConfig} className="space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Hero Media Node (MP4/WebM URL)</label>
                <div className="relative">
                  <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={heroVideoUrl}
                    onChange={(e) => setHeroVideoUrl(e.target.value)}
                    placeholder="/hero-banner.mp4"
                    className="w-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 rounded-xl px-12 py-4 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Global Promo Broadcast (Header Text)</label>
                <div className="relative">
                  <Megaphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={promoAnnouncement}
                    onChange={(e) => setPromoAnnouncement(e.target.value)}
                    placeholder="FREE SHIPPING OVER ₹2000"
                    className="w-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 rounded-xl px-12 py-4 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingConfig}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                {isSavingConfig ? <Loader2 className="animate-spin" size={16} /> : "Update Configuration"}
              </button>
            </form>
          </section>

          {/* Lookbook Panel */}
          <section className="space-y-8">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase italic">Lookbook Image Data</h2>
              <p className="text-sm text-slate-500 font-medium">Manage the static image grid for your lookbook page.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ingestion Protocol</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                      onClick={() => setLookbookMode("upload")}
                      className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all ${lookbookMode === "upload" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
                    >
                      Device Upload
                    </button>
                    <button 
                      onClick={() => setLookbookMode("link")}
                      className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all ${lookbookMode === "link" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
                    >
                      Manual Link
                    </button>
                  </div>
                </div>

                {lookbookMode === "upload" ? (
                  <label className="group relative flex flex-col items-center justify-center gap-4 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl py-12 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all duration-300 cursor-pointer">
                    {isAddingImage ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-indigo-600" size={40} />
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Ingesting Asset...</span>
                      </div>
                    ) : (
                      <>
                        <div className="p-5 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                          <Upload className="text-slate-400 group-hover:text-indigo-600" size={32} />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Upload Content From Device</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supports PNG, JPG, WEBP • Cloud Hosted</p>
                        </div>
                      </>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleLookbookUpload}
                      disabled={isAddingImage}
                    />
                  </label>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text"
                        value={manualLookbookUrl}
                        onChange={(e) => setManualLookbookUrl(e.target.value)}
                        placeholder="HTTPS://IMAGE-URL.COM/ASSET.JPG"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <button 
                      onClick={handleAddLookbookManual}
                      disabled={isAddingImage || !manualLookbookUrl}
                      className="w-full bg-indigo-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      {isAddingImage ? "Ingesting..." : "Add External Asset"}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="relative group aspect-square bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                    <Image src={img.url} alt={img.alt || "Lookbook"} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        disabled={deletingId === img.id}
                        className="bg-white/20 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-red-500 transition-colors"
                      >
                        {deletingId === img.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
