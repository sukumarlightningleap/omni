"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, User, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const result = await signIn('credentials', {
          email, password, redirect: false
        });

        if (result?.error) {
          setError('Invalid Identity Credentials. Access Denied.');
          setIsLoading(false);
        } else {
          const res = await fetch('/api/auth/session');
          const session = await res.json();
          
          if (session?.user?.role === 'ADMIN') {
            router.push('/admin/products');
          } else {
            router.push('/account');
          }
          router.refresh();
        }
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });

        if (res.ok) {
          await signIn('credentials', { email, password, callbackUrl: '/account' });
        } else {
          const data = await res.json();
          setError(data.error || 'Identity initialization failed.');
          setIsLoading(false);
        }
      }
    } catch (err) {
      setError('A secure connection could not be established.');
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F7] flex items-center justify-center p-6 pt-40 md:pt-48 font-sans selection:bg-indigo-100">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full"
      >
        {/* Branding */}
        <motion.div variants={itemVariants} className="text-center mb-10 space-y-2">
          <h1 className="text-5xl font-black tracking-tighter uppercase italic text-black">Unrwly</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">
            {isLogin ? 'Command Center Access' : 'Identity Initialization'}
          </p>
        </motion.div>

        {/* The Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-white border border-neutral-200 rounded-[40px] p-10 md:p-12 shadow-2xl shadow-neutral-200/50"
        >
          {message && !error && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-8 p-4 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2"
            >
              <AlertCircle size={14} /> {message}
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-500 text-[10px] font-black uppercase tracking-widest text-center italic"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Full Identity Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                      className="w-full bg-white border border-neutral-200 rounded-2xl py-4 pl-12 pr-4 text-base font-bold text-black focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all placeholder:text-neutral-300"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Email Identity</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input 
                    type="email" 
                    placeholder="name@unrwly.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white border border-neutral-200 rounded-2xl py-4 pl-12 pr-4 text-base font-bold text-black focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all placeholder:text-neutral-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Security Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white border border-neutral-200 rounded-2xl py-4 pl-12 pr-4 text-base font-bold text-black focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all placeholder:text-neutral-300"
                  />
                </div>
              </div>
            </div>

            <button 
              disabled={isLoading}
              className="w-full bg-black text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200 active:scale-[0.98] uppercase tracking-widest text-[11px] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Handshaking...
                </>
              ) : (
                <>
                  {isLogin ? 'Access Dashboard' : 'Initialize Identity'} <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-neutral-100 flex flex-col items-center gap-4">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
            >
              {isLogin ? "Need a new identity? Initialize" : "Already verified? Access Center"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F6F6F7] flex items-center justify-center">
        <Loader2 className="animate-spin text-neutral-300" size={32} />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
