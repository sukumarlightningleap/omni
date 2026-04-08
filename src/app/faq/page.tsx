import React from 'react';
import { Clock, Shield, Ruler, Mail } from 'lucide-react';
import FAQAccordion from '@/components/FAQAccordion';

const faqs = [
  {
    question: "What is the expected shipping timeframe?",
    answer: "Every Unrwly piece is hand-finished. Expect delivery between 7-14 business days for domestic orders. International logistics may vary, typically requiring 14-21 days for global arrival.",
    icon: <Clock size={24} />
  },
  {
    question: "How do I facilitate a return?",
    answer: "Our archive items are produced in limited quantities. We accept returns within 14 days of delivery, provided items are unworn and in original condition. Contact our support team to initiate the protocol.",
    icon: <Shield size={24} />
  },
  {
    question: "Is there a specific sizing guide?",
    answer: "Our pieces are designed for a bold, oversized aesthetic. We typically recommend ordering your standard size for the intended 'Unrwly' fit, or sizing down for a more structured silhouette.",
    icon: <Ruler size={24} />
  },
  {
    question: "How can I contact technical support?",
    answer: "Our support specialists are available Monday through Friday. Reach out via email at support@omnidrop.shop for order inquiries or brand assistance.",
    icon: <Mail size={24} />
  }
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 pt-32 pb-24 selection:bg-slate-900 selection:text-white font-sans">
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-24">
        <div className="flex flex-col gap-4 border-l border-slate-100 pl-8 py-12">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.5em]">Support Center</span>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] italic font-display uppercase">
            Operational <br /> 
            <span className="text-slate-400">Protocol.</span>
          </h1>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold">
            Everything you need to know about the Unrwly ecosystem.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-12">
        <FAQAccordion items={faqs} />
      </section>
    </main>
  );
}
