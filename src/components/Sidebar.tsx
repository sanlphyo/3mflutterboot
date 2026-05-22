'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, CalendarDays, FolderOpen, LogOut, Shield, Users } from 'lucide-react';
import { useAuth } from './AuthProvider';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    router.push('/');
  };

  const navItems = [
    {
      name: 'Syllabus',
      href: '/dashboard',
      icon: BookOpen,
      color: 'group-hover:text-cyan-400',
      activeColor: 'text-cyan-400 border-cyan-500/35 bg-cyan-950/20'
    },
    {
      name: 'Resources',
      href: '/resources',
      icon: FolderOpen,
      color: 'group-hover:text-violet-400',
      activeColor: 'text-violet-400 border-violet-500/35 bg-violet-950/20'
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: CalendarDays,
      color: 'group-hover:text-emerald-400',
      activeColor: 'text-emerald-400 border-emerald-500/35 bg-emerald-950/20'
    },
    ...(user?.role === 'mentor' ? [{
      name: 'User Manager',
      href: '/users',
      icon: Users,
      color: 'group-hover:text-amber-400',
      activeColor: 'text-amber-400 border-amber-500/35 bg-amber-950/20'
    }] : [])
  ];

  if (!user) return null;

  return (
    <aside className="fixed inset-y-0 left-0 w-64 border-r border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md flex flex-col z-30 justify-between">
      {/* Branding Header */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.15)] group">
            {/* Tech glowing squares in background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/20 to-cyan-500/20 opacity-100 group-hover:scale-110 transition-transform"></div>
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 text-sm">
              3M
            </span>
          </div>
          <div>
            <h1 className="font-bold text-base text-zinc-100 tracking-wide">
              3M FlutterBoot
            </h1>
            <span className="text-[10px] uppercase font-semibold text-cyan-400/80 tracking-widest">
              Mentorship Hub
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent my-6"></div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? item.activeColor
                    : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-900/40 hover:border-zinc-900'
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${item.color} ${isActive ? '' : 'text-zinc-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Information Box & Logout */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950/40">
        <div className="p-3 bg-zinc-900/50 border border-zinc-800/40 rounded-xl mb-3 flex items-center gap-3">
          {/* Avatar Sphere */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-zinc-800 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-zinc-300 uppercase">
              {user.username.charAt(0)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-zinc-200 truncate">
              {user.username}
            </p>
            <p className="text-[10px] text-zinc-500 truncate mb-1">
              {user.email}
            </p>
            {/* Role Tag Chip */}
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border ${
                user.role === 'mentor'
                  ? 'text-violet-400 bg-violet-950/30 border-violet-500/20'
                  : 'text-cyan-400 bg-cyan-950/30 border-cyan-500/20'
              }`}
            >
              <Shield className="w-2.5 h-2.5" />
              {user.role}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-zinc-800/80 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/15 hover:border-rose-900/30 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
