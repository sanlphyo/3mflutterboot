'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/components/AuthProvider';
import { databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/lib/appwrite';
import { ID } from 'appwrite';
import { UserPlus, Trash2, Shield, Mail, Lock, User, AlertTriangle, RefreshCw, Key, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface UserRecord {
  $id: string;
  username: string;
  email: string;
  role: 'mentor' | 'mentee';
}

export default function UserManagementPage() {
  const { user } = useAuth();
  
  // States for user management
  const [usersList, setUsersList] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // States for account creation form
  const [newUsername, setNewUsername] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newRole, setNewRole] = useState<'mentor' | 'mentee'>('mentee');
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!DATABASE_ID || !USERS_COLLECTION_ID) {
        throw new Error('Appwrite IDs are not configured. Please supply environment variables.');
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID
      );

      const mapped: UserRecord[] = (response.documents || []).map((doc: any) => ({
        $id: doc.$id,
        username: doc.username || 'Unnamed Account',
        email: doc.email || '',
        role: doc.role === 'mentor' ? 'mentor' : 'mentee',
      }));

      setUsersList(mapped);
    } catch (err: any) {
      console.error('Failed to fetch user list:', err);
      setError(err.message || 'Failed to pull dynamic accounts roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'mentor') {
      fetchUsers();
    }
  }, [user]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    if (!newUsername || !newEmail || !newPassword) {
      setCreateError('Please complete all form fields.');
      return;
    }

    setCreateLoading(true);

    try {
      if (!DATABASE_ID || !USERS_COLLECTION_ID) {
        throw new Error('Appwrite Database configuration is missing.');
      }

      // Check if email already exists in list
      const emailExists = usersList.some(u => u.email.toLowerCase() === newEmail.toLowerCase());
      if (emailExists) {
        throw new Error('An account with this email address already exists in the roster.');
      }

      // Create user document in database
      const newDoc = await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        ID.unique(),
        {
          username: newUsername,
          email: newEmail,
          password: newPassword, // stored securely inside the private db collection
          role: newRole
        }
      );

      setCreateSuccess(`Account for "${newUsername}" successfully established!`);
      
      // Reset input fields
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('mentee');

      // Refresh list
      fetchUsers();
    } catch (err: any) {
      console.error('Failed to create account:', err);
      setCreateError(err.message || 'An unexpected error occurred during account creation.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteUser = async (targetId: string, targetName: string) => {
    if (targetId === user?.id) {
      alert("Security alert: You cannot delete your own logged-in account!");
      return;
    }

    if (!confirm(`Are you absolutely sure you want to permanently delete the account for "${targetName}"? They will lose all portal access immediately.`)) {
      return;
    }

    try {
      await databases.deleteDocument(DATABASE_ID, USERS_COLLECTION_ID, targetId);
      
      // Refresh list
      fetchUsers();
    } catch (err: any) {
      console.error('Failed to delete account document:', err);
      alert(`Deletion failed: ${err.message || 'Connection error.'}`);
    }
  };

  // Secure Role Gate check: If authenticated but NOT a mentor, display Access Denied Screen
  if (user && user.role !== 'mentor') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-100 p-8 relative overflow-hidden tech-grid">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-rose-500/5 blur-3xl pointer-events-none"></div>
          
          <div className="border border-rose-900/30 bg-zinc-900/40 backdrop-blur-xl rounded-2xl p-8 max-w-md text-center shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-rose-950/30 border border-rose-900/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
              <ShieldAlert className="w-8 h-8 text-rose-500" />
            </div>
            
            <h1 className="text-xl font-bold tracking-wide text-zinc-200">
              Access Restriction Gate
            </h1>
            <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
              Sorry! The **User Management Terminal** is strictly reserved for Authorized Bootcamp Mentors. Mentee accounts are barred from editing access keys.
            </p>
            
            <div className="mt-8 pt-6 border-t border-zinc-900">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 hover:border-zinc-600 rounded-xl text-xs font-semibold tracking-wide text-zinc-200 transition-colors shadow-md cursor-pointer"
              >
                Return to Syllabus Hub
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Core Portal Feed */}
        <main className="flex-1 pl-64 relative min-h-screen">
          {/* Background Glows */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none z-0"></div>
          <div className="absolute bottom-20 left-64 w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none z-0"></div>

          <div className="max-w-5xl mx-auto px-8 py-10 relative z-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-zinc-900 pb-8">
              <div>
                <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
                  Mentor Terminal
                </span>
                <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight mt-1">
                  User Account Manager
                </h1>
                <p className="text-sm text-zinc-400 mt-2">
                  Create, configure, or revoke access credentials for bootcamp mentors and student mentees.
                </p>
              </div>

              {/* Sync list button */}
              <button 
                onClick={fetchUsers}
                disabled={loading}
                className="self-start md:self-auto flex items-center gap-2 px-3.5 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/80 rounded-xl text-xs font-semibold tracking-wide text-zinc-300 hover:text-zinc-100 cursor-pointer disabled:opacity-50 transition-all duration-300"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync Roster</span>
              </button>
            </div>

            {/* Split Screen Grid (Add Form vs Users List) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT COLUMN: Add User Form (5/12 width) */}
              <div className="lg:col-span-5">
                <div className="border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-xl rounded-2xl p-6 glow-violet relative">
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent"></div>
                  
                  <h2 className="text-base font-bold text-zinc-200 tracking-wide mb-6 flex items-center gap-2">
                    <UserPlus className="w-4.5 h-4.5 text-violet-400" />
                    <span>Create Student Account</span>
                  </h2>

                  <form onSubmit={handleCreateUser} className="space-y-4">
                    {/* Inline Form Messages */}
                    {createSuccess && (
                      <div className="flex items-start gap-2.5 p-3.5 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-emerald-400 text-xs font-medium">
                        <CheckCircle className="w-4.5 h-4.5 shrink-0 text-emerald-500/80 mt-0.5" />
                        <div>{createSuccess}</div>
                      </div>
                    )}
                    {createError && (
                      <div className="flex items-start gap-2.5 p-3.5 bg-rose-950/20 border border-rose-900/40 rounded-xl text-rose-400 text-xs font-medium">
                        <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-rose-500/80 mt-0.5" />
                        <div>{createError}</div>
                      </div>
                    )}

                    {/* Username Input */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Student/User Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="text"
                          placeholder="San Lwin Phyo"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-violet-500/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500/20 transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="email"
                          placeholder="student@flutterboot.com"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-violet-500/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500/20 transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="text"
                          placeholder="secret-password-123"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-violet-500/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500/20 transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    {/* Role Selection Dropdown */}
                    <div className="space-y-1.5 font-sans">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Assigned Role
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value as 'mentor' | 'mentee')}
                          className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-violet-500/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-violet-500/20 transition-all duration-300 cursor-pointer appearance-none"
                        >
                          <option value="mentee" className="bg-zinc-950 text-zinc-200">Mentee (Student)</option>
                          <option value="mentor" className="bg-zinc-950 text-zinc-200">Mentor (Administrator)</option>
                        </select>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={createLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold tracking-wide text-zinc-950 bg-gradient-to-r from-cyan-400 to-violet-400 hover:from-cyan-300 hover:to-violet-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-500 shadow-[0_0_15px_rgba(6,182,212,0.15)] mt-6"
                    >
                      {createLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin"></div>
                          <span>Creating Profile...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Provision Account</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* RIGHT COLUMN: Active Roster List (7/12 width) */}
              <div className="lg:col-span-7">
                <div className="border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-xl rounded-2xl p-6 glow-cyan relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent"></div>
                  
                  <h2 className="text-base font-bold text-zinc-200 tracking-wide mb-6 flex items-center gap-2">
                    <Shield className="w-4.5 h-4.5 text-cyan-400" />
                    <span>Active User Roster ({usersList.length})</span>
                  </h2>

                  {loading ? (
                    /* Roster Loading skeletons */
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 border border-zinc-900 bg-zinc-900/10 rounded-xl animate-pulse">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800/80"></div>
                            <div className="space-y-1.5">
                              <div className="w-24 h-3 bg-zinc-800/80 rounded"></div>
                              <div className="w-36 h-2 bg-zinc-800/80 rounded"></div>
                            </div>
                          </div>
                          <div className="w-16 h-5 bg-zinc-800/80 rounded-md"></div>
                        </div>
                      ))}
                    </div>
                  ) : error ? (
                    <div className="flex items-center gap-2 p-4 bg-amber-950/20 border border-amber-900/40 rounded-xl text-amber-400 text-xs font-semibold">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>{error}</span>
                    </div>
                  ) : usersList.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-10">No users found inside the collection.</p>
                  ) : (
                    /* Roster List Table */
                    <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                      {usersList.map((usr) => {
                        const isSelf = usr.$id === user?.id;

                        return (
                          <div
                            key={usr.$id}
                            className={`group flex items-center justify-between p-3.5 border rounded-xl transition-all duration-300 ${
                              isSelf
                                ? 'bg-violet-950/15 border-violet-900/40 hover:bg-violet-950/25'
                                : 'bg-zinc-950/30 border-zinc-900 hover:border-zinc-800/60 hover:bg-zinc-950/60'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Icon Initials Avatar */}
                              <div className={`w-8.5 h-8.5 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold ${
                                usr.role === 'mentor'
                                  ? 'bg-violet-950/40 border-violet-500/20 text-violet-400'
                                  : 'bg-cyan-950/40 border-cyan-500/20 text-cyan-400'
                              }`}>
                                {usr.username.charAt(0).toUpperCase()}
                              </div>
                              
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-zinc-200 truncate">
                                    {usr.username}
                                  </span>
                                  {isSelf && (
                                    <span className="text-[8px] font-bold px-1 rounded bg-violet-600/30 text-violet-300 border border-violet-500/20 tracking-wide uppercase">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-zinc-500 truncate block mt-0.5">
                                  {usr.email}
                                </span>
                              </div>
                            </div>

                            {/* Actions Right Side */}
                            <div className="flex items-center gap-3 shrink-0">
                              {/* Role Badge Tag */}
                              <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                                usr.role === 'mentor'
                                  ? 'text-violet-400 bg-violet-950/40 border-violet-500/20'
                                  : 'text-cyan-400 bg-cyan-950/40 border-cyan-500/20'
                              }`}>
                                {usr.role}
                              </span>

                              {/* Revoke account button */}
                              <button
                                onClick={() => handleDeleteUser(usr.$id, usr.username)}
                                disabled={isSelf}
                                className={`p-1.5 rounded-lg border flex items-center justify-center transition-all duration-300 ${
                                  isSelf
                                    ? 'opacity-20 cursor-not-allowed border-zinc-800 text-zinc-700'
                                    : 'border-zinc-800 hover:border-rose-900/35 bg-zinc-950/40 hover:bg-rose-950/15 text-zinc-500 hover:text-rose-400 cursor-pointer'
                                }`}
                                title={isSelf ? "Self-deletion disabled" : "Revoke account access"}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
