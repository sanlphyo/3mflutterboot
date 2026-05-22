'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-100 overflow-hidden relative">
        {/* Glow Effects in Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-violet-500/5 blur-3xl"></div>
        
        <div className="relative flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            {/* Outer glowing pulsing ring */}
            <div className="absolute w-24 h-24 rounded-full border border-cyan-500/20 animate-ping opacity-60"></div>
            {/* Middle technical rotating ring */}
            <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-cyan-500 border-b-transparent border-l-transparent animate-spin duration-1000"></div>
            {/* Center pulsing brand orb */}
            <div className="absolute w-6 h-6 bg-violet-600 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.8)] animate-pulse"></div>
          </div>
          
          <div className="mt-8 flex flex-col items-center gap-1">
            <span className="text-sm font-semibold tracking-[0.2em] text-cyan-400 uppercase">
              3M FlutterBoot
            </span>
            <span className="text-xs text-zinc-500 tracking-widest animate-pulse">
              Syncing Session...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};
export default ProtectedRoute;
