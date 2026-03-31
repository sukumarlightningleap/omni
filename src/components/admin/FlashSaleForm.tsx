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
    <form onSubmit={handleSubmit} className="space-y-6 text-black">
      {/* Toggle */}
      <div className="flex items-center justify-between border border-black/10 p-4 bg-white shadow-sm">
        <div className="space-y-1">
          <label className="text-xs font-black tracking-[0.2em] uppercase text-black">
            Enable Flash Sale
          </label>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
            Activates the global countdown ticker
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActive(!active)}
          className={`relative w-12 h-6 rounded-none transition-colors duration-200 border-2 ${
            active ? "bg-black border-black" : "bg-neutral-200 border-neutral-300"
          }`}
        >
          <span
            className={`absolute top-[2px] left-[2px] bg-white w-4 h-4 transition-transform duration-200 ${
              active ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Message Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-black tracking-[0.2em] uppercase text-black block">
            Announcement Message
          </label>
          <div className="relative">
            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={14} />
            <input
              type="text"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. SUMMER VAULT UNLOCKED"
              className="w-full bg-white border border-black/20 text-xs font-bold px-10 py-4 text-black focus:outline-none focus:border-black transition-colors rounded-none placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Date Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-black tracking-[0.2em] uppercase text-black block">
            End Date & Time
          </label>
          <input
            type="datetime-local"
            required={active} // Only required if active
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="w-full bg-white border border-black/20 text-xs font-bold px-4 py-4 text-black focus:outline-none focus:border-black transition-colors rounded-none"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white hover:bg-neutral-800 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-colors disabled:opacity-50"
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
          className={`p-4 text-[10px] font-bold tracking-widest uppercase border text-center ${
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
