"use client";

import { useState } from "react";
import { Star, StarHalf, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_REVIEWS = [
  { id: 1, user: "MARCUS K.", date: "MAR 12, 2026", rating: 5, title: "ELITE QUALITY", body: "The weight of the fabric is incredible. Definitely lives up to the tech-wear hype. Would recommend sizing up for that oversized aesthetic.", verified: true },
  { id: 2, user: "SARAH P.", date: "FEB 28, 2026", rating: 4, title: "STUNNING DESIGN", body: "The silhouette is unique. Got so many compliments already. Only minor gripe is the sleeve length, but nothing major.", verified: true },
  { id: 3, user: "DAVID L.", date: "JAN 15, 2026", rating: 5, title: "PERFECT FIT", body: "Finally a brand that understands modern proportions. The materials feel premium and the VTO was surprisingly accurate.", verified: true },
];

const ProductReviews = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <section id="reviews" className="bg-black py-24 px-6 md:px-12 lg:px-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-24">
          
          {/* Left Column: Summary */}
          <div className="lg:w-1/3 space-y-12">
            <div>
              <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 font-bold mb-4 block">The Proof</span>
              <h2 className="text-4xl md:text-6xl font-syne font-black text-white italic tracking-tighter uppercase leading-none">
                Customer Reviews
              </h2>
            </div>

            <div className="space-y-8">
              <div className="flex items-end gap-4">
                <span className="text-7xl font-syne font-black text-white leading-none">4.8</span>
                <div className="pb-2">
                  <div className="flex text-white mb-1">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={18} fill="currentColor" />)}
                  </div>
                  <span className="text-[10px] font-inter uppercase tracking-widest text-neutral-500">Based on 124 reviews</span>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3">
                {[
                  { star: 5, percent: 85 },
                  { star: 4, percent: 10 },
                  { star: 3, percent: 3 },
                  { star: 2, percent: 1 },
                  { star: 1, percent: 1 },
                ].map((item) => (
                  <div key={item.star} className="flex items-center gap-4 group">
                    <span className="text-[10px] font-syne font-bold text-white w-2">{item.star}</span>
                    <div className="flex-grow h-1.5 bg-white/5 relative overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.percent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute inset-0 bg-white" 
                      />
                    </div>
                    <span className="text-[10px] font-inter text-neutral-600 w-8 text-right">{item.percent}%</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setIsFormOpen(true)}
                className="w-full py-4 border border-white/10 text-[10px] font-syne font-black text-white uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-500"
              >
                Write a Review
              </button>
            </div>
          </div>

          {/* Right Column: List */}
          <div className="lg:w-2/3 space-y-16">
            <div className="divide-y divide-white/5">
              {MOCK_REVIEWS.map((review) => (
                <div key={review.id} className="py-12 first:pt-0 group">
                  <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                    <div className="space-y-1">
                      <div className="flex text-white gap-0.5 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            fill={i < review.rating ? "currentColor" : "none"} 
                            className={i < review.rating ? "text-white" : "text-white/20"} 
                          />
                        ))}
                      </div>
                      <h3 className="text-sm font-syne font-bold text-white uppercase tracking-widest">{review.title}</h3>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center md:justify-end gap-2 text-[10px] font-syne font-bold text-white uppercase tracking-widest mb-1">
                        {review.user}
                        {review.verified && (
                          <span className="flex items-center gap-1 text-[8px] text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                            <CheckCircle2 size={8} /> VERIFIED
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-inter text-neutral-600 uppercase tracking-widest">{review.date}</span>
                    </div>
                  </div>
                  <p className="text-neutral-400 font-inter text-sm leading-relaxed max-w-2xl">
                    {review.body}
                  </p>
                </div>
              ))}
            </div>
            
            <button className="text-[10px] font-syne font-black text-white uppercase tracking-[0.4em] hover:text-neutral-400 transition-colors border-b border-white/10 pb-1">
              View All 124 Reviews
            </button>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-neutral-950 border border-white/10 p-8 md:p-12"
            >
              <button 
                onClick={() => setIsFormOpen(false)}
                className="absolute top-8 right-8 text-neutral-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              {isSubmitted ? (
                <div className="text-center py-12 space-y-6">
                  <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-syne font-bold text-white uppercase tracking-widest">Review Received</h3>
                  <p className="text-xs text-neutral-500 font-inter uppercase tracking-widest leading-relaxed">
                    Thank you for sharing your experience. We're processing your review.
                  </p>
                  <button 
                    onClick={() => setIsFormOpen(false)}
                    className="px-8 py-3 bg-white text-black font-syne font-bold text-[10px] uppercase tracking-widest"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 font-bold block">Contribute</span>
                    <h2 className="text-3xl font-syne font-black text-white italic tracking-tighter uppercase leading-none">
                      Write a Review
                    </h2>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setIsSubmitted(true);
                    }} 
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <label className="text-[10px] font-syne font-bold text-neutral-500 uppercase tracking-widest block">Rating</label>
                      <div className="flex gap-2 text-white">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button 
                            key={num} 
                            type="button"
                            onClick={() => setUserRating(num)}
                            className="hover:scale-110 transition-transform"
                          >
                            <Star size={24} fill={num <= userRating ? "currentColor" : "none"} className={num <= userRating ? "text-white" : "text-white/20"} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-syne font-bold text-neutral-500 uppercase tracking-widest block">Name</label>
                        <input className="w-full bg-white/5 border border-white/10 p-4 text-xs text-white focus:outline-none focus:border-white/30 transition-colors uppercase tracking-widest" placeholder="YOUR NAME" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-syne font-bold text-neutral-500 uppercase tracking-widest block">Review Title</label>
                        <input className="w-full bg-white/5 border border-white/10 p-4 text-xs text-white focus:outline-none focus:border-white/30 transition-colors uppercase tracking-widest" placeholder="SUMMARY" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-syne font-bold text-neutral-500 uppercase tracking-widest block">Body</label>
                      <textarea rows={4} className="w-full bg-white/5 border border-white/10 p-4 text-xs text-white focus:outline-none focus:border-white/30 transition-colors uppercase tracking-widest resize-none" placeholder="YOUR THOUGHTS..." required />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-5 bg-white text-black font-syne font-black text-[10px] uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all duration-500 mt-4"
                    >
                      Submit Review
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProductReviews;
