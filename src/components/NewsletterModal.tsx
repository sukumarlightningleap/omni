"use client";

import { useState, useEffect, useTransition } from "react";
import { X, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeToNewsletter } from "@/app/actions/subscribe";

const NewsletterModal = ({ config }: { config: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Kill switch: if protocol is not active, don't even mount timer
    if (!config?.welcomeActive) return;

    const hasSeen = localStorage.getItem("unrwly_newsletter_seen");
    
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setIsVisible(true);
      }, 10000); // Hardcoded 10 seconds delay
      return () => clearTimeout(timer);
    }
  }, [config]);

  const closeModal = () => {
    setIsOpen(false);
    localStorage.setItem("unrwly_newsletter_seen", "true");
  };

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await subscribeToNewsletter(formData);
      if (result.success) {
        setIsSuccess(true);
        localStorage.setItem("unrwly_newsletter_seen", "true");
        setTimeout(() => closeModal(), 3000);
      }
    });
  };

  if (!isVisible || !config?.welcomeActive) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white border border-slate-200 overflow-hidden rounded-[2.5rem] shadow-2xl"
          >
            {/* Close Button */}
            <button 
              onClick={closeModal}
              className="absolute top-6 right-6 text-slate-300 hover:text-indigo-600 transition-colors z-10 p-2"
            >
              <X size={20} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Side: Visual/Offer - Soft Peach Theme */}
              <div className="relative h-64 md:h-auto bg-[#FFF5F2] flex flex-col items-center justify-center p-8 overflow-hidden min-h-[300px]">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
                <motion.div 
                  initial={{ rotate: -5, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative z-10 text-center"
                >
                  <span className="text-[10px] font-black tracking-[0.5em] text-indigo-600/60 uppercase mb-4 block">
                    Welcome Protocol
                  </span>
                  <h2 className="text-7xl md:text-8xl font-black text-indigo-600 italic tracking-tighter leading-none mb-2">
                    {config?.welcomeTitle || "10%"}
                  </h2>
                  <p className="text-xl font-bold text-indigo-600 uppercase tracking-widest italic">
                    {config?.welcomeSubtitle || "Off Your Order"}
                  </p>
                </motion.div>
                {/* Decorative Elements */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FFF5F2] border border-indigo-100 rounded-full blur-2xl" />
              </div>

              {/* Right Side: Form - Polaris Light */}
              <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
                {isSuccess ? (
                  <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
                    <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={32} className="text-green-500" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">
                      Access Granted
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                      Check your inbox for the protocol unlock code.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">
                        Join the Inner Circle
                      </h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                        {config?.welcomeDescription || "GET EARLY ACCESS TO DROPS AND EXCLUSIVE REWARDS."}
                      </p>
                    </div>

                    <form action={handleSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <input 
                          type="email" 
                          name="email"
                          placeholder="EMAIL ADDRESS"
                          required
                          className="w-full bg-slate-50 border border-slate-200 px-6 py-5 text-slate-900 font-bold text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all rounded-2xl uppercase tracking-widest"
                        />
                      </div>
                      <button 
                        disabled={isPending}
                        className="w-full h-16 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-indigo-700 rounded-2xl flex items-center justify-center gap-2 group shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                      >
                        {isPending ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            ACTIVATE OFFER
                            <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>

                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center leading-relaxed">
                      BY SIGNING UP, YOU AGREE TO OUR TERMS & PRIVACY POLICY.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewsletterModal;
