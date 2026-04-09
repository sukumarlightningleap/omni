"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateFlashSale } from "@/app/actions/marketing";
import { Loader2, Zap } from "lucide-react";

interface FlashSaleFormProps {
  initialData: {
    flashSaleActive: boolean;
    flashSaleEndsAt: Date | null;
    flashSaleMessage: string;
  } | null;
}

export default function FlashSaleForm({ initialData }: FlashSaleFormProps) {
  const [active, setActive] = useState(initialData?.flashSaleActive || false);
  const [message, setMessage] = useState(initialData?.flashSaleMessage || "LIMITED DROP ENDING SOON");
  
  // Format dates for html input type="datetime-local" (YYYY-MM-DDThh:mm)
  const formatForInput = (date: Date | null) => {
    if (!date) return "";
    const pad = (n: number) => n.toString().padStart(2, '0');
    // Using local time for the input field
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
      await updateFlashSale({
        active,
        message,
        endsAt: endsAtDate,
      });

      setFeedback({ message: "Flash Sale settings updated successfully.", type: "success" });
      router.refresh(); // Refresh to catch changes
    } catch (error) {
      setFeedback({ message: "Failed to update Flash Sale settings. Please try again.", type: "error" });
    } finally {
      setIsLoading(false);
      // Clear feedback after 3 seconds
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-slate-900 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
      {/* Toggle */}
      <div className="flex items-center justify-between border border-slate-200 p-6 bg-slate-50 rounded-2xl">
        <div className="space-y-1">
          <label className="text-xs font-black tracking-[0.2em] uppercase text-slate-900">
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
        {/* Message Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 block">
            Announcement Message
          </label>
          <div className="relative">
            <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600 pointer-events-none" size={14} />
            <input
              type="text"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. SUMMER VAULT UNLOCKED"
              className="w-full bg-slate-50 border border-slate-200 text-xs font-bold px-12 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all rounded-2xl placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Date Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 block">
            End Date & Time
          </label>
          <input
            type="datetime-local"
            required={active} // Only required if active
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs font-bold px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all rounded-2xl"
          />
        </div>
      </div>

      {/* Visual Preview */}
      <div className="space-y-3">
        <label className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 block">Visual Preview</label>
        <div className="bg-[#FFF5F2] border border-[#FCE8E2] rounded-xl p-4 overflow-hidden relative">
          <div className="flex items-center gap-4 animate-pulse">
            <Zap size={12} className="text-[#D97757] shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D97757] whitespace-nowrap">
              {message || "PREVIEW CONTENT"} — 00D : 00H : 00M : 00S
            </span>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center gap-2 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all rounded-2xl shadow-lg shadow-indigo-600/10 disabled:opacity-50 active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={14} />
              Saving Global State...
            </>
          ) : (
            "Update Engine Protocol"
          )}
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 text-[10px] font-bold tracking-widest uppercase border text-center rounded-xl ${
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
