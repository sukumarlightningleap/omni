"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateMarketingSettings } from "@/app/actions/marketing";
import { Loader2, Zap, BellRing } from "lucide-react";

interface FlashSaleFormProps {
  initialData: {
    flashSaleActive: boolean;
    flashSaleEndsAt: Date | null;
    flashSaleMessage: string;
    welcomeActive: boolean;
    welcomeTitle: string;
    welcomeSubtitle: string;
    welcomeDescription: string;
    welcomeDelay: number;
  } | null;
}

export default function FlashSaleForm({ initialData }: FlashSaleFormProps) {
  // Flash Sale States
  const [active, setActive] = useState(initialData?.flashSaleActive || false);
  const [message, setMessage] = useState(initialData?.flashSaleMessage || "LIMITED DROP ENDING SOON");
  
  // Welcome Protocol States
  const [welcomeActive, setWelcomeActive] = useState(initialData?.welcomeActive ?? true);
  const [welcomeTitle, setWelcomeTitle] = useState(initialData?.welcomeTitle || "10%");
  const [welcomeSubtitle, setWelcomeSubtitle] = useState(initialData?.welcomeSubtitle || "OFF YOUR FIRST ORDER");
  const [welcomeDescription, setWelcomeDescription] = useState(initialData?.welcomeDescription || "JOIN THE CLUB FOR EXCLUSIVE ACCESS.");
  const [welcomeDelay, setWelcomeDelay] = useState(initialData?.welcomeDelay || 5000);

  // Format dates for html input type="datetime-local" (YYYY-MM-DDThh:mm)
  const formatForInput = (date: Date | null) => {
    if (!date) return "";
    const pad = (n: number) => n.toString().padStart(2, '0');
    const d = new Date(date);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [endsAt, setEndsAt] = useState(formatForInput(initialData?.flashSaleEndsAt || null));
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    try {
      const endsAtDate = endsAt ? new Date(endsAt) : new Date();
      await updateMarketingSettings({
        flashSaleActive: active,
        flashSaleMessage: message,
        flashSaleEndsAt: endsAtDate,
        welcomeActive,
        welcomeTitle,
        welcomeSubtitle,
        welcomeDescription,
        welcomeDelay: Number(welcomeDelay),
      });

      setFeedback({ message: "Marketing Protocol synchronized successfully.", type: "success" });
      router.refresh(); 
    } catch (error) {
      setFeedback({ message: "Sync failed. Please check the engine state.", type: "error" });
    } finally {
      setIsLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12 text-slate-900">
      
      {/* SECTION 1: FLASH SALE */}
      <div className="space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="text-indigo-600" size={20} />
          <h2 className="text-xs font-black tracking-[0.2em] uppercase text-slate-900">Flash Sale Protocol</h2>
        </div>

        <div className="flex items-center justify-between border border-slate-200 p-6 bg-slate-50 rounded-2xl">
          <div className="space-y-1">
            <label className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-900">
              Enable Flash Sale
            </label>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Activates the global countdown ticker
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActive(!active)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 border-2 ${
              active ? "bg-indigo-600 border-indigo-600" : "bg-slate-200 border-slate-300"
            }`}
          >
            <span
              className={`absolute top-[2px] left-[2px] bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ${
                active ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 block">
              Announcement Message
            </label>
            <input
              type="text"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all rounded-2xl"
              placeholder="e.g. SUMMER VAULT UNLOCKED"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 block">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              required={active}
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all rounded-2xl"
            />
          </div>
        </div>

        {/* Flash Preview */}
        <div className="bg-[#FFF5F2] border border-[#FCE8E2] rounded-xl p-4 overflow-hidden relative">
          <div className="flex items-center gap-4 animate-pulse">
            <Zap size={12} className="text-[#D97757] shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D97757] whitespace-nowrap">
              {message || "PREVIEW CONTENT"} — 00D : 00H : 00M : 00S
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: WELCOME PROTOCOL */}
      <div className="space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <BellRing className="text-indigo-600" size={20} />
          <h2 className="text-xs font-black tracking-[0.2em] uppercase text-slate-900">Welcome Protocol (Newsletter)</h2>
        </div>

        <div className="flex items-center justify-between border border-slate-200 p-6 bg-slate-50 rounded-2xl">
          <div className="space-y-1">
            <label className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-900">
              Active Status
            </label>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Toggle the visibility of the welcome modal
            </p>
          </div>
          <button
            type="button"
            onClick={() => setWelcomeActive(!welcomeActive)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 border-2 ${
              welcomeActive ? "bg-indigo-600 border-indigo-600" : "bg-slate-200 border-slate-300"
            }`}
          >
            <span
              className={`absolute top-[2px] left-[2px] bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ${
                welcomeActive ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 block">Main Title</label>
            <input
              type="text"
              required
              value={welcomeTitle}
              onChange={(e) => setWelcomeTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all rounded-2xl"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 block">Subtitle</label>
            <input
              type="text"
              required
              value={welcomeSubtitle}
              onChange={(e) => setWelcomeSubtitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all rounded-2xl"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 block">Description</label>
            <input
              type="text"
              required
              value={welcomeDescription}
              onChange={(e) => setWelcomeDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all rounded-2xl"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 block">Display Delay (ms)</label>
            <input
              type="number"
              required
              value={welcomeDelay}
              onChange={(e) => setWelcomeDelay(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all rounded-2xl"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 sticky bottom-8">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center gap-2 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all rounded-2xl shadow-xl shadow-indigo-600/20 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={14} />
              Synchronizing Engine...
            </>
          ) : (
            "Save All Protocol Settings"
          )}
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 text-[10px] font-bold tracking-widest uppercase border text-center rounded-xl animate-in fade-in slide-in-from-bottom-2 ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {feedback.message}
        </div>
      )}
    </form>
  );
}
