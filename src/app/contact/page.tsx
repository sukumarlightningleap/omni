"use client";

import { useState, useTransition } from "react";
import { handleContactForm } from "@/app/actions/contact";
import Link from "next/link";
import { Mail, Clock, HelpCircle, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await handleContactForm(formData);
      if (result.success) {
        setIsSuccess(true);
      }
    });
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-syne font-bold text-slate-900 mb-16 tracking-tighter">
          CONTACT US
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          {/* Left Side: Support Info */}
          <div className="space-y-12 bg-brand-peach p-8 md:p-12 rounded-2xl border border-[#FCE8E2]">
            <div>
              <h2 className="text-2xl font-syne font-semibold text-brand-terracotta mb-6 uppercase tracking-widest">
                Support
              </h2>
              <p className="text-slate-600 font-inter text-lg leading-relaxed max-w-md">
                We're here to help with orders, product inquiries, or just to chat. 
                Our team typically responds within 24 hours.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-white p-3 rounded-full border border-brand-terracotta/20 text-brand-terracotta shadow-sm">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="text-slate-900 font-syne font-medium mb-1">Email</h3>
                  <a href="mailto:support@unrwly.com" className="text-slate-600 hover:text-slate-900 transition-colors">
                    support@unrwly.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 bg-white p-3 rounded-full border border-brand-terracotta/20 text-brand-terracotta shadow-sm">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-slate-900 font-syne font-medium mb-1">Response Time</h3>
                  <p className="text-slate-600">Monday - Friday: 9am - 6pm EST</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 bg-white p-3 rounded-full border border-brand-terracotta/20 text-brand-terracotta shadow-sm">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 className="text-slate-900 font-syne font-medium mb-1">FAQs</h3>
                  <Link href="/faq" className="text-slate-600 hover:text-slate-900 underline underline-offset-4 transition-colors">
                    Browse our common questions
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form */}
            <div className="relative bg-white border border-slate-200 p-8 md:p-12 rounded-2xl shadow-sm">
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
                  <div className="bg-indigo-50 p-4 rounded-full mb-6">
                    <CheckCircle2 color="#4f46e5" size={48} />
                  </div>
                  <h2 className="text-3xl font-syne font-bold text-slate-900 mb-4">Message Sent!</h2>
                  <p className="text-slate-600 mb-8 max-w-[200px]">
                    We've received your request and will get back to you soon.
                  </p>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="px-8 py-3 bg-slate-900 text-white font-syne font-bold hover:bg-slate-800 transition-colors uppercase tracking-widest text-sm"
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form action={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-xs font-syne font-bold text-gray-500 uppercase tracking-widest ml-1">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        placeholder="ALEX DOE"
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-4 text-slate-900 font-inter placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors rounded-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-xs font-syne font-bold text-gray-500 uppercase tracking-widest ml-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        placeholder="ALEX@EXAMPLE.COM"
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-4 text-slate-900 font-inter placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors rounded-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="orderNumber" className="text-xs font-syne font-bold text-gray-500 uppercase tracking-widest ml-1">
                      Order Number <span className="text-slate-400 font-inter font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="orderNumber"
                      id="orderNumber"
                      placeholder="#12345"
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-4 text-slate-900 font-inter placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors rounded-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-xs font-syne font-bold text-gray-500 uppercase tracking-widest ml-1">
                      Message
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      required
                      placeholder="HOW CAN WE HELP?"
                      rows={6}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-4 text-slate-900 font-inter placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none rounded-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-16 bg-slate-900 text-white font-syne font-black text-sm uppercase tracking-[0.2em] transition-all hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed group relative overflow-hidden flex items-center justify-center gap-2"
                  >
                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>SENDING...</span>
                      </div>
                    ) : (
                      <>
                        <span>SEND MESSAGE</span>
                        <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
}
