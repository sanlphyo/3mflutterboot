'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { databases, DATABASE_ID, RESOURCES_COLLECTION_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { ExternalLink, Database, AlertCircle, RefreshCw, FolderClosed, FolderOpen, Search, Sparkles } from 'lucide-react';

interface ResourceDocument {
  $id: string;
  title: string;
  description: string;
  drive_url: string;
  week_number: number;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<ResourceDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!DATABASE_ID || !RESOURCES_COLLECTION_ID) {
        throw new Error(
          'Appwrite IDs are not configured. Please supply NEXT_PUBLIC_APPWRITE_DATABASE_ID and NEXT_PUBLIC_APPWRITE_COLLECTION_ID in .env.local.'
        );
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        RESOURCES_COLLECTION_ID,
        [
          Query.orderAsc('week_number'),
          Query.limit(100)
        ]
      );

      // Map dynamic fields safely
      const documents: ResourceDocument[] = (response.documents || []).map((doc: any) => ({
        $id: doc.$id,
        title: doc.title || 'Untitled Material',
        description: doc.description || 'No description provided.',
        drive_url: doc.drive_url || '#',
        week_number: typeof doc.week_number === 'number' ? doc.week_number : 1,
      }));

      // Sort locally as a double safety measure
      documents.sort((a, b) => a.week_number - b.week_number);

      setResources(documents);
    } catch (err: any) {
      console.error('Appwrite Resource Fetch Error:', err);
      setError(err.message || 'Failed to establish connection with the Appwrite databases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Filter based on search query
  const filteredResources = resources.filter(res => 
    res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `week ${res.week_number}`.includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Core Portal Feed */}
        <main className="flex-1 pl-64 relative min-h-screen">
          {/* Background Glows */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none z-0"></div>
          <div className="absolute bottom-20 left-64 w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none z-0"></div>

          <div className="max-w-5xl mx-auto px-8 py-10 relative z-10">
            
            {/* Upper Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-zinc-900 pb-8">
              <div>
                <span className="text-xs font-bold tracking-widest text-violet-400 uppercase">
                  Cloud Vault
                </span>
                <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight mt-1">
                  Learning Resources
                </h1>
                <p className="text-sm text-zinc-400 mt-2">
                  Access slide decks, code templates, assignments, and Google Drive assets synced directly from Appwrite.
                </p>
              </div>

              {/* Refresh button */}
              <button 
                onClick={fetchResources}
                disabled={loading}
                className="self-start md:self-auto flex items-center gap-2 px-3.5 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/80 rounded-xl text-xs font-semibold tracking-wide text-zinc-300 hover:text-zinc-100 cursor-pointer disabled:opacity-50 transition-all duration-300"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync Vault</span>
              </button>
            </div>

            {/* Filter Search Bar */}
            {!error && resources.length > 0 && (
              <div className="relative mb-8 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter by week, title, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/30 border border-zinc-800/80 focus:border-cyan-500/50 rounded-xl pl-11 pr-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none transition-all duration-300"
                />
              </div>
            )}

            {/* Main Content Area */}
            {loading ? (
              /* Loading Skeletons */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border border-zinc-900 bg-zinc-900/10 rounded-2xl p-6 space-y-4 animate-pulse">
                    <div className="flex justify-between items-center">
                      <div className="w-16 h-3.5 bg-zinc-800/80 rounded"></div>
                      <div className="w-6 h-6 rounded-full bg-zinc-800/80"></div>
                    </div>
                    <div className="w-1/2 h-5 bg-zinc-800/80 rounded"></div>
                    <div className="space-y-2 pt-2">
                      <div className="w-full h-3 bg-zinc-900/80 rounded"></div>
                      <div className="w-5/6 h-3 bg-zinc-900/80 rounded"></div>
                    </div>
                    <div className="pt-4 flex justify-end">
                      <div className="w-32 h-9 bg-zinc-800/80 rounded-xl"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              /* Technical Error Display Panel */
              <div className="border border-amber-900/40 bg-amber-950/10 backdrop-blur-md rounded-2xl p-8 max-w-2xl mx-auto shadow-xl">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-900/30 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-amber-400 tracking-wide">
                      Appwrite Config Sync Needed
                    </h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      The dynamic vaults cannot be fully synced because of the following database status:
                    </p>
                    <code className="block mt-3 p-3 bg-zinc-950/80 border border-zinc-900 rounded-lg text-[10px] text-amber-300 font-mono overflow-x-auto">
                      {error}
                    </code>
                    <p className="text-xs text-zinc-500 mt-4 leading-relaxed">
                      💡 **Quick Fix:** Ensure that you have specified valid keys inside your `.env.local` file and that user permissions for read queries are enabled in the Appwrite database collection.
                    </p>
                  </div>
                </div>
              </div>
            ) : filteredResources.length === 0 ? (
              /* Empty Database Collection View */
              <div className="border border-zinc-800/80 bg-zinc-900/10 backdrop-blur-md rounded-2xl p-12 text-center max-w-xl mx-auto shadow-lg">
                <FolderClosed className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-base font-bold text-zinc-300">No Learning Resources Found</h3>
                <p className="text-xs text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
                  {searchQuery 
                    ? `No materials matched your search filter "${searchQuery}".`
                    : 'The Appwrite database contains no resource documents at the moment. Please upload documents in your Appwrite dashboard collection.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-4 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 rounded-xl text-xs font-semibold text-zinc-300 cursor-pointer transition-all duration-300"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            ) : (
              /* Resource Cards Render Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredResources.map((item) => {
                  // Style colors based on phase divisions
                  let cardTheme = 'border-cyan-500/20 text-cyan-400 glow-cyan hover:border-cyan-500/40';
                  let weekBadge = 'bg-cyan-950/40 border-cyan-500/25 text-cyan-400';
                  
                  if (item.week_number > 4 && item.week_number <= 8) {
                    cardTheme = 'border-violet-500/20 text-violet-400 glow-violet hover:border-violet-500/40';
                    weekBadge = 'bg-violet-950/40 border-violet-500/25 text-violet-400';
                  } else if (item.week_number > 8) {
                    cardTheme = 'border-emerald-500/20 text-emerald-400 glow-emerald hover:border-emerald-500/40';
                    weekBadge = 'bg-emerald-950/40 border-emerald-500/25 text-emerald-400';
                  }

                  return (
                    <div
                      key={item.$id}
                      className={`group relative p-6 bg-zinc-900/30 border rounded-2xl hover:bg-zinc-900/50 transition-all duration-300 flex flex-col justify-between ${cardTheme}`}
                    >
                      <div>
                        {/* Card Upper */}
                        <div className="flex justify-between items-center mb-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${weekBadge}`}>
                            Week {item.week_number}
                          </span>
                          <FolderOpen className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                        </div>

                        {/* Title & description */}
                        <h3 className="text-base font-bold text-zinc-100 tracking-wide">
                          {item.title}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Download Link Action */}
                      <div className="mt-6 pt-4 border-t border-zinc-900/40 flex justify-end">
                        <a
                          href={item.drive_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-950/80 hover:bg-zinc-950 hover:text-zinc-100 rounded-xl text-xs font-semibold tracking-wide text-zinc-300 transition-all duration-300 shadow-md group/btn cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
                          <span>Access Drive Folder</span>
                          <ExternalLink className="w-3 h-3 text-zinc-500 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
