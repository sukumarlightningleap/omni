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
    <div className="min-h-screen bg-black pt-32 pb-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-syne font-bold text-white mb-16 tracking-tighter">
          CONTACT US
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          {/* Left Side: Support Info */}
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-syne font-semibold text-white mb-6 uppercase tracking-widest">
                Support
              </h2>
              <p className="text-gray-400 font-inter text-lg leading-relaxed max-w-md">
                We're here to help with orders, product inquiries, or just to chat. 
                Our team typically responds within 24 hours.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-white/5 p-3 rounded-full border border-white/10 text-white">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="text-white font-syne font-medium mb-1">Email</h3>
                  <a href="mailto:support@unrwly.com" className="text-gray-400 hover:text-white transition-colors">
                    support@unrwly.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 bg-white/5 p-3 rounded-full border border-white/10 text-white">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-white font-syne font-medium mb-1">Response Time</h3>
                  <p className="text-gray-400">Monday - Friday: 9am - 6pm EST</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 bg-white/5 p-3 rounded-full border border-white/10 text-white">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 className="text-white font-syne font-medium mb-1">FAQs</h3>
                  <Link href="/faq" className="text-gray-400 hover:text-white underline underline-offset-4 transition-colors">
                    Browse our common questions
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-[#0A0A0A] border border-white/10 p-8 md:p-12 rounded-2xl">
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
                  <div className="bg-white/10 p-4 rounded-full mb-6">
                    <CheckCircle2 color="white" size={48} />
                  </div>
                  <h2 className="text-3xl font-syne font-bold text-white mb-4">Message Sent!</h2>
                  <p className="text-gray-400 mb-8 max-w-[200px]">
                    We've received your request and will get back to you soon.
                  </p>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="px-8 py-3 bg-white text-black font-syne font-bold hover:bg-gray-200 transition-colors uppercase tracking-widest text-sm"
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
                        className="w-full bg-white/5 border border-white/10 px-4 py-4 text-white font-inter placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors"
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
                        className="w-full bg-white/5 border border-white/10 px-4 py-4 text-white font-inter placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="orderNumber" className="text-xs font-syne font-bold text-gray-500 uppercase tracking-widest ml-1">
                      Order Number <span className="text-white/20 font-inter font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="orderNumber"
                      id="orderNumber"
                      placeholder="#12345"
                      className="w-full bg-white/5 border border-white/10 px-4 py-4 text-white font-inter placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors"
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
                      className="w-full bg-white/5 border border-white/10 px-4 py-4 text-white font-inter placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-16 bg-white text-black font-syne font-black text-sm uppercase tracking-[0.2em] transition-all hover:bg-gray-200 disabled:bg-gray-600 disabled:cursor-not-allowed group relative overflow-hidden flex items-center justify-center gap-2"
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
    </div>
  );
}
