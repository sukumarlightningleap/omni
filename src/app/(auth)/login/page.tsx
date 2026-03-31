"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (isLogin) {
      // SIGN IN LOGIC
      const result = await signIn('credentials', {
        email, password, redirect: false
      });

      if (result?.error) {
        setError('Invalid credentials.');
        setIsLoading(false);
      } else {
        // Redirect check happens via middleware, but we push manually for speed
        // If the email is your admin email, it goes to dashboard
        const adminEmail = "your-admin-email@gmail.com";
        router.push(email === adminEmail ? '/admin/products' : '/account');
        router.refresh();
      }
    } else {
      // SIGN UP LOGIC
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (res.ok) {
        // After signup, automatically sign them in
        await signIn('credentials', { email, password, callbackUrl: '/account' });
      } else {
        setError('Email already registered.');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 pt-20">
      <motion.div layout className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="text-4xl font-bold tracking-tighter uppercase text-white italic">Omnidrop</Link>
          <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-500">
            {isLogin ? 'Authentication Required' : 'Create New Identity'}
          </p>
        </div>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 text-[10px] uppercase text-center font-bold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                <input
                  type="text" placeholder="FULL NAME" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full bg-neutral-900 border border-neutral-800 py-4 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-white transition-all rounded-none"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
            <input
              type="email" placeholder="EMAIL ADDRESS" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-neutral-900 border border-neutral-800 py-4 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-white transition-all rounded-none"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
            <input
              type="password" placeholder="PASSWORD" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full bg-neutral-900 border border-neutral-800 py-4 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-white transition-all rounded-none"
            />
          </div>

          <button disabled={isLoading} className="w-full h-14 flex items-center justify-center gap-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 disabled:opacity-50 transition-all">
            {isLoading ? 'Processing...' : (isLogin ? 'Access Account' : 'Initialize Identity')} <ArrowRight size={14} />
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] text-neutral-500 uppercase tracking-widest hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already registered? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
