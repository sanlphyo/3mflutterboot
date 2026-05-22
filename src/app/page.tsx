'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Shield, Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading: authLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError(null);
    setLoading(true);
    
    try {
      const result = await login(email, password);
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Invalid credentials.');
      }
    } catch (err) {
      setError('Authentication failed. Please verify your internet connection or database configuration.');
    } finally {
      setLoading(false);
    }
  };

  // While checking auth, show a simple background to prevent flashes
  if (authLoading || user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-12 h-12 rounded-full border border-cyan-500/20 animate-ping opacity-60"></div>
          <div className="w-8 h-8 rounded-full border-2 border-t-2 border-cyan-500 border-t-transparent border-r-transparent border-b-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 relative overflow-hidden tech-grid">
      {/* Background Radial Glow Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md z-10">
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.15)] mb-4 relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/20 to-cyan-500/20 rounded-2xl opacity-100"></div>
            <Sparkles className="w-6 h-6 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-zinc-200 to-violet-400 animate-text-shine">
            3M FlutterBoot
          </h1>
          <p className="mt-2 text-sm text-zinc-400 tracking-wide">
            Private Mentorship Portal Gateway
          </p>
        </div>

        {/* Login Box */}
        <div className="border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] glow-cyan relative overflow-hidden">
          {/* Subtle gradient highlights at top card edge */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert Box */}
            {error && (
              <div className="flex items-start gap-3 p-3.5 bg-rose-950/20 border border-rose-900/40 rounded-xl text-rose-400 text-xs">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-400/80 mt-0.5" />
                <div className="flex-1 font-medium">{error}</div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-cyan-500/60 rounded-xl pl-11 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Access Key / Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-cyan-500/60 rounded-xl pl-11 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold tracking-wide text-zinc-950 bg-gradient-to-r from-cyan-400 to-violet-400 hover:from-cyan-300 hover:to-violet-300 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed cursor-pointer transition-all duration-500 shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin"></div>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-center text-xs text-zinc-600 tracking-wide flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-zinc-700" />
          <span>Restricted to authorized mentors and students only.</span>
        </p>
      </div>
    </div>
  );
}
