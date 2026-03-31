"use client";

import { useState, useEffect, useTransition } from "react";
import { X, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeToNewsletter } from "@/app/actions/subscribe";

const NewsletterModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the modal
    const hasSeen = localStorage.getItem("unrwly_newsletter_seen");
    
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setIsVisible(true);
      }, 60000); // 60 seconds delay

      return () => clearTimeout(timer);
    }
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    localStorage.setItem("unrwly_newsletter_seen", "true");
  };

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await subscribeToNewsletter(formData);
      if (result.success) {
        setIsSuccess(true);
        // Persist seen state
        localStorage.setItem("unrwly_newsletter_seen", "true");
        // Close after a delay
        setTimeout(() => closeModal(), 3000);
      }
    });
  };

  if (!isVisible) return null;

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
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 overflow-hidden rounded-sm"
          >
            {/* Close Button */}
            <button 
              onClick={closeModal}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Side: Visual/Offer */}
              <div className="relative h-64 md:h-full bg-neutral-900 flex flex-col items-center justify-center p-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                <motion.div 
                  initial={{ rotate: -10, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative z-10 text-center"
                >
                  <span className="text-[10px] font-syne font-black tracking-[0.5em] text-white/40 uppercase mb-4 block">
                    Exclusive Access
                  </span>
                  <h2 className="text-6xl md:text-7xl font-syne font-black text-white italic tracking-tighter leading-none mb-2">
                    10%
                  </h2>
                  <p className="text-xl font-syne font-bold text-white uppercase tracking-widest italic">
                    Off Your First Order
                  </p>
                </motion.div>
                {/* Decorative Elements */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl" />
              </div>

              {/* Right Side: Form */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                {isSuccess ? (
                  <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
                    <div className="bg-white/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={24} className="text-white" />
                    </div>
                    <h3 className="text-xl font-syne font-bold text-white uppercase tracking-widest">
                      Welcome to the fold
                    </h3>
                    <p className="text-xs text-gray-500 font-inter uppercase tracking-widest leading-relaxed">
                      Your discount code is on its way to your inbox.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h3 className="text-xs font-syne font-black text-white uppercase tracking-[0.3em]">
                        Join the Rebellion
                      </h3>
                      <p className="text-xs text-gray-500 font-inter uppercase tracking-widest leading-relaxed">
                        GET EARLY ACCESS TO DROPS AND EXCLUSIVE REWARDS.
                      </p>
                    </div>

                    <form action={handleSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <input 
                          type="email" 
                          name="email"
                          placeholder="EMAIL ADDRESS"
                          required
                          className="w-full bg-white/5 border border-white/10 px-4 py-4 text-white font-inter text-xs placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors uppercase tracking-widest"
                        />
                      </div>
                      <button 
                        disabled={isPending}
                        className="w-full h-14 bg-white text-black font-syne font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-neutral-200 flex items-center justify-center gap-2 group"
                      >
                        {isPending ? (
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            SIGN UP NOW
                            <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>

                    <p className="text-[9px] text-zinc-600 font-inter uppercase tracking-widest text-center leading-relaxed">
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
