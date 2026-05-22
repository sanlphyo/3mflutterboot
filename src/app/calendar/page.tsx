'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/components/AuthProvider';
import { databases, DATABASE_ID, SESSIONS_COLLECTION_ID, USERS_COLLECTION_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  BookOpen,
  CheckCircle2,
  Circle,
  XCircle,
  Pencil,
  Trash2,
  AlertCircle,
  RefreshCw,
  CalendarCheck,
  Loader2,
  Mail,
  Users,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type SessionStatus = 'scheduled' | 'completed' | 'cancelled';

interface Session {
  $id: string;
  date: string;           // "YYYY-MM-DD"
  title: string;
  description: string;
  week_number: number;
  status: SessionStatus;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const STATUS_CONFIG: Record<SessionStatus, {
  label: string;
  pill: string;
  dot: string;
  Icon: React.ComponentType<any>;
}> = {
  scheduled: {
    label: 'Scheduled',
    pill: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30',
    dot: 'bg-cyan-400',
    Icon: Circle,
  },
  completed: {
    label: 'Completed',
    pill: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
    dot: 'bg-emerald-400',
    Icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    pill: 'text-rose-400 bg-rose-950/40 border-rose-500/30',
    dot: 'bg-rose-400',
    Icon: XCircle,
  },
};

const EMPTY_FORM = {
  title: '',
  description: '',
  week_number: 1,
  status: 'scheduled' as SessionStatus,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, '0');
const toISODate = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function buildMonthGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; // shift to Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { user } = useAuth();
  const isMentor = user?.role === 'mentor';

  // ── Calendar navigation state ────────────────────────────────────────────
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // ── Sessions ─────────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // silent background refresh
  const [error, setError] = useState<string | null>(null);

  // ── Drawer ───────────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // ── Form ─────────────────────────────────────────────────────────────────
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // ── Email ─────────────────────────────────────────────────────────────────
  const [emailLoading, setEmailLoading] = useState(false);

  // ── Fetch sessions ───────────────────────────────────────────────────────

  const fetchSessions = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      if (!DATABASE_ID || !SESSIONS_COLLECTION_ID) {
        throw new Error(
          'Sessions collection is not configured. Add NEXT_PUBLIC_APPWRITE_SESSIONS_COLLECTION_ID to .env.local'
        );
      }
      const res = await databases.listDocuments(
        DATABASE_ID,
        SESSIONS_COLLECTION_ID,
        [Query.limit(300), Query.orderAsc('date')]
      );
      setSessions(
        (res.documents || []).map((d: any) => ({
          $id: d.$id,
          date: d.date || '',
          title: d.title || 'Untitled Session',
          description: d.description || '',
          week_number: typeof d.week_number === 'number' ? d.week_number : 1,
          status: (['scheduled', 'completed', 'cancelled'].includes(d.status)
            ? d.status : 'scheduled') as SessionStatus,
        }))
      );
    } catch (err: any) {
      console.error('Failed to load sessions:', err);
      if (!silent) setError(err.message || 'Failed to load sessions from database.');
    } finally {
      if (silent) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  // ── Auto-refresh for mentees ─────────────────────────────────────────────
  useEffect(() => {
    if (isMentor) return; // mentor updates are immediate via optimistic state

    // Poll every 60 seconds silently
    const intervalId = setInterval(() => fetchSessions(true), 60_000);

    // Also refetch when the tab regains focus (e.g. mentee switches back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchSessions(true);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMentor, fetchSessions]);

  // ── Month navigation ─────────────────────────────────────────────────────

  const goToPrev = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const goToNext = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };
  const goToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  // ── Computed ─────────────────────────────────────────────────────────────

  const cells = buildMonthGrid(viewYear, viewMonth);
  const todayISO = todayStr();

  const sessionsByDate = sessions.reduce<Record<string, Session[]>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  const upcomingSessions = sessions
    .filter(s => s.date >= todayISO && s.status !== 'cancelled')
    .slice(0, 6);

  const selectedDateSessions = selectedDate ? (sessionsByDate[selectedDate] ?? []) : [];

  // ── Email students (mailto) ──────────────────────────────────────────────

  const handleEmailStudents = async (session: Session) => {
    if (!isMentor) return;
    setEmailLoading(true);
    try {
      // Fetch all mentee emails from the users collection
      const res = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('role', ['mentee']), Query.limit(100)]
      );
      const emails: string[] = (res.documents || [])
        .map((d: any) => d.email as string)
        .filter(Boolean);

      if (emails.length === 0) {
        alert('No student accounts found in the database.');
        return;
      }

      // Compose mailto link with BCC for privacy
      const subject = encodeURIComponent(`📅 ${session.title} · ${session.date}`);
      const body = encodeURIComponent(
        `Hi everyone,\n\n` +
        `Just a reminder about our upcoming class session:\n\n` +
        `📅 Date: ${session.date}\n` +
        `📚 Week ${session.week_number} session\n` +
        `📖 Title: ${session.title}\n` +
        (session.description ? `\n📝 Notes:\n${session.description}\n` : '') +
        `\nSee you there!\n— Your Mentor`
      );
      const bcc = encodeURIComponent(emails.join(','));

      // Open the user's default mail client
      window.location.href = `mailto:?bcc=${bcc}&subject=${subject}&body=${body}`;
    } catch (err: any) {
      alert(`Could not fetch student emails: ${err.message}`);
    } finally {
      setEmailLoading(false);
    }
  };

  // ── Form helpers ─────────────────────────────────────────────────────────

  const openAddForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingSession(null);
    setFormMode('add');
  };

  const openEditForm = (s: Session) => {
    setForm({
      title: s.title,
      description: s.description,
      week_number: s.week_number,
      status: s.status,
    });
    setEditingSession(s);
    setFormMode('edit');
  };

  const closeForm = () => { setFormMode(null); setEditingSession(null); };

  // ── Save / delete ────────────────────────────────────────────────────────

  const handleSaveSession = async () => {
    if (!selectedDate || !isMentor) return;
    if (!form.title.trim()) { alert('Please enter a session title.'); return; }

    setSaving(true);
    try {
      const payload = {
        date: selectedDate,
        title: form.title.trim(),
        description: form.description.trim(),
        week_number: Number(form.week_number),
        status: form.status,
      };

      if (formMode === 'add') {
        const doc = await databases.createDocument(
          DATABASE_ID, SESSIONS_COLLECTION_ID, ID.unique(), payload
        );
        setSessions(prev =>
          [...prev, { $id: doc.$id, ...payload }].sort((a, b) => a.date.localeCompare(b.date))
        );
      } else if (formMode === 'edit' && editingSession) {
        await databases.updateDocument(
          DATABASE_ID, SESSIONS_COLLECTION_ID, editingSession.$id, payload
        );
        setSessions(prev =>
          prev.map(s => s.$id === editingSession.$id ? { ...s, ...payload } : s)
        );
      }
      closeForm();
    } catch (err: any) {
      alert(`Failed to save session: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!isMentor) return;
    if (!confirm('Delete this session? This cannot be undone.')) return;

    setDeleting(sessionId);
    try {
      await databases.deleteDocument(DATABASE_ID, SESSIONS_COLLECTION_ID, sessionId);
      setSessions(prev => prev.filter(s => s.$id !== sessionId));
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans overflow-x-hidden">
        <Sidebar />

        <main className="flex-1 pl-64 relative min-h-screen">
          {/* Ambient glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-emerald-500/4 blur-[140px] pointer-events-none z-0" />
          <div className="absolute bottom-20 left-64 w-[400px] h-[400px] rounded-full bg-cyan-500/4 blur-[120px] pointer-events-none z-0" />

          <div className="max-w-6xl mx-auto px-8 py-10 relative z-10">

            {/* ── Page Header ─────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-zinc-900 pb-8">
              <div>
                <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
                  Teaching Calendar
                </span>
                <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight mt-1">
                  Class Schedule
                </h1>
                <p className="text-sm text-zinc-400 mt-2">
                  {isMentor
                    ? 'Plan sessions and email students directly from any session card.'
                    : 'View all upcoming teaching sessions scheduled by your mentor.'}
                </p>
              </div>
              <button
                onClick={() => fetchSessions()}
                disabled={loading || refreshing}
                className="self-start md:self-auto flex items-center gap-2 px-3.5 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/80 rounded-xl text-xs font-semibold tracking-wide text-zinc-300 hover:text-zinc-100 cursor-pointer disabled:opacity-50 transition-all duration-300"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${(loading || refreshing) ? 'animate-spin' : ''}`} />
                {refreshing ? 'Updating…' : 'Sync'}
              </button>
            </div>

            {/* ── Error Panel ──────────────────────────────────────────── */}
            {error && (
              <div className="border border-amber-900/40 bg-amber-950/10 rounded-2xl p-5 mb-8 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-amber-400">Calendar Database Error</p>
                  <code className="block mt-2 p-2 bg-zinc-950/80 border border-zinc-900 rounded text-[10px] text-amber-300 font-mono break-all">
                    {error}
                  </code>
                  <p className="text-xs text-zinc-500 mt-3">
                    💡 Create a <strong className="text-zinc-400">sessions</strong> collection in Appwrite with: <strong className="text-zinc-400">date</strong> (String), <strong className="text-zinc-400">title</strong> (String), <strong className="text-zinc-400">description</strong> (String), <strong className="text-zinc-400">week_number</strong> (Integer), <strong className="text-zinc-400">status</strong> (String).
                  </p>
                </div>
              </div>
            )}

            {/* ── Upcoming Sessions Strip ───────────────────────────────── */}
            {!error && upcomingSessions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-3 flex items-center gap-1.5">
                  <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Upcoming Sessions
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {upcomingSessions.map(s => {
                    const cfg = STATUS_CONFIG[s.status];
                    return (
                      <button
                        key={s.$id}
                        onClick={() => {
                          const [y, m] = s.date.split('-').map(Number);
                          setViewYear(y); setViewMonth(m - 1);
                          setSelectedDate(s.date); setFormMode(null);
                        }}
                        className="shrink-0 w-44 p-3 bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 rounded-xl text-left transition-all duration-200 hover:bg-zinc-900/70 cursor-pointer group"
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">{s.date}</span>
                        </div>
                        <p className="text-xs font-semibold text-zinc-200 group-hover:text-white line-clamp-1">{s.title}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Week {s.week_number}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Calendar Grid ─────────────────────────────────────────── */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl overflow-hidden">

              {/* Month nav bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
                <button onClick={goToPrev} className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-4">
                  <h2 className="text-base font-bold text-zinc-100 tracking-wide">
                    {MONTH_NAMES[viewMonth]} {viewYear}
                  </h2>
                  <button onClick={goToToday} className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-zinc-800 hover:border-emerald-500/40 hover:text-emerald-400 text-zinc-500 rounded-lg transition-all cursor-pointer">
                    Today
                  </button>
                </div>
                <button onClick={goToNext} className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-zinc-800/40">
                {DAYS_OF_WEEK.map(d => (
                  <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-600">{d}</div>
                ))}
              </div>

              {/* Day cells */}
              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-7">
                  {cells.map((day, idx) => {
                    if (day === null) {
                      return <div key={`e${idx}`} className="min-h-[88px] border-b border-r border-zinc-800/20 bg-zinc-950/10" />;
                    }

                    const dateStr = toISODate(viewYear, viewMonth, day);
                    const isToday = dateStr === todayISO;
                    const isSelected = dateStr === selectedDate;
                    const daySessions = sessionsByDate[dateStr] ?? [];
                    const isPast = dateStr < todayISO;

                    return (
                      <div
                        key={dateStr}
                        onClick={() => { setSelectedDate(dateStr); setFormMode(null); }}
                        className={`min-h-[88px] border-b border-r border-zinc-800/20 p-2 cursor-pointer transition-all duration-150 flex flex-col gap-1 group
                          ${isSelected ? 'bg-emerald-950/20 border-emerald-500/20' : 'hover:bg-zinc-900/40'}
                          ${isPast && !isToday ? 'opacity-55' : ''}
                        `}
                      >
                        {/* Day number */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors
                          ${isToday ? 'bg-emerald-500 text-zinc-950'
                            : isSelected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'text-zinc-500 group-hover:text-zinc-200'}`}
                        >
                          {day}
                        </div>

                        {/* Dots */}
                        <div className="flex flex-wrap gap-0.5">
                          {daySessions.slice(0, 4).map(s => (
                            <span key={s.$id} className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[s.status].dot}`} />
                          ))}
                          {daySessions.length > 4 && (
                            <span className="text-[8px] text-zinc-600 font-bold leading-none mt-0.5">+{daySessions.length - 4}</span>
                          )}
                        </div>

                        {/* Session labels */}
                        <div className="space-y-0.5">
                          {daySessions.slice(0, 2).map(s => (
                            <p key={s.$id} className={`text-[9px] font-semibold px-1 py-0.5 rounded truncate ${STATUS_CONFIG[s.status].pill}`}>
                              {s.title}
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 mt-4 flex-wrap">
              {(Object.entries(STATUS_CONFIG) as [SessionStatus, typeof STATUS_CONFIG[SessionStatus]][]).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </div>
              ))}
              <div className="ml-auto text-[10px] text-zinc-600">Click any date to view or add sessions</div>
            </div>

          </div>
        </main>
      </div>

      {/* ── Side Drawer ─────────────────────────────────────────────────────── */}
      {selectedDate && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-zinc-950/70 backdrop-blur-sm"
          onClick={() => { setSelectedDate(null); setFormMode(null); }}
        >
          <div
            className="w-full max-w-md bg-zinc-900 border-l border-zinc-800/80 h-full shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-y-auto flex flex-col z-50 animate-slide-in relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Gradient top line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

            {/* ── Add / Edit Form ────────────────────────────────────── */}
            {formMode !== null && isMentor ? (
              <div className="p-6 flex flex-col gap-4 flex-1">

                {/* Form header */}
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-500/25 text-emerald-400 bg-emerald-950/20">
                    {formMode === 'add' ? `Add Session · ${selectedDate}` : `Edit Session · ${selectedDate}`}
                  </span>
                  <button onClick={closeForm} className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest mb-1.5">Session Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Week 3 Live Coding Session"
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/60 transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest mb-1.5">Session Notes / Agenda</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={4}
                    placeholder="Topics to cover, what students should prepare, etc."
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/60 transition-colors resize-none"
                  />
                </div>

                {/* Week */}
                <div>
                  <label className="block text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest mb-1.5">Linked Curriculum Week</label>
                  <select
                    value={form.week_number}
                    onChange={e => setForm(f => ({ ...f, week_number: Number(e.target.value) }))}
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/60 transition-colors cursor-pointer"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(w => (
                      <option key={w} value={w}>Week {w}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest mb-1.5">Status</label>
                  <div className="flex gap-2">
                    {(['scheduled', 'completed', 'cancelled'] as SessionStatus[]).map(s => (
                      <button
                        key={s}
                        onClick={() => setForm(f => ({ ...f, status: s }))}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                          form.status === s ? STATUS_CONFIG[s].pill : 'border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400'
                        }`}
                      >
                        {STATUS_CONFIG[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-auto pt-4 border-t border-zinc-900">
                  <button
                    onClick={closeForm}
                    className="flex-1 py-2.5 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSession}
                    disabled={saving}
                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-extrabold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    {saving ? 'Saving…' : formMode === 'add' ? 'Add Session' : 'Save Changes'}
                  </button>
                </div>
              </div>

            ) : (
              /* ── View Mode ────────────────────────────────────────── */
              <div className="p-6 flex flex-col gap-5 flex-1">

                {/* Drawer header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                    <p className="text-base font-bold text-zinc-200 mt-0.5">
                      {selectedDateSessions.length === 0
                        ? 'No sessions'
                        : `${selectedDateSessions.length} Session${selectedDateSessions.length > 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isMentor && (
                      <button
                        onClick={openAddForm}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 hover:text-emerald-300 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    )}
                    <button
                      onClick={() => { setSelectedDate(null); setFormMode(null); }}
                      className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Empty state */}
                {selectedDateSessions.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <CalendarDays className="w-6 h-6 text-zinc-700" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-500">No sessions on this day</p>
                    {isMentor && <p className="text-xs text-zinc-700">Click "Add" to schedule one.</p>}
                  </div>
                )}

                {/* Session cards */}
                <div className="space-y-4">
                  {selectedDateSessions.map(s => {
                    const cfg = STATUS_CONFIG[s.status];
                    const StatusIcon = cfg.Icon;
                    const isDeleting = deleting === s.$id;

                    return (
                      <div key={s.$id} className="p-4 bg-zinc-950/50 border border-zinc-800/60 rounded-2xl flex flex-col gap-3">

                        {/* Card header row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-zinc-100 leading-snug">{s.title}</h3>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${cfg.pill}`}>
                                <StatusIcon className="w-2.5 h-2.5" />
                                {cfg.label}
                              </span>
                              <span className="flex items-center gap-1 text-[9px] text-zinc-600">
                                <BookOpen className="w-2.5 h-2.5" /> Week {s.week_number}
                              </span>
                              <span className="flex items-center gap-1 text-[9px] text-zinc-600">
                                <Clock className="w-2.5 h-2.5" /> {s.date}
                              </span>
                            </div>
                          </div>

                          {/* Mentor edit/delete buttons */}
                          {isMentor && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => openEditForm(s)}
                                className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 text-zinc-600 hover:text-cyan-400 transition-all cursor-pointer"
                                title="Edit session"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteSession(s.$id)}
                                disabled={isDeleting}
                                className="p-1.5 rounded-lg border border-zinc-800 hover:border-rose-900/50 text-zinc-600 hover:text-rose-400 transition-all cursor-pointer disabled:opacity-50"
                                title="Delete session"
                              >
                                {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        {s.description && (
                          <p className="text-xs text-zinc-400 leading-relaxed border-t border-zinc-900/50 pt-3">
                            {s.description}
                          </p>
                        )}

                        {/* Email students button — mentor only */}
                        {isMentor && (
                          <button
                            onClick={() => handleEmailStudents(s)}
                            disabled={emailLoading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/25 hover:border-emerald-500/50 hover:from-emerald-500/20 hover:to-cyan-500/20 text-emerald-400 hover:text-emerald-300 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer disabled:opacity-50 group/email"
                          >
                            {emailLoading
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Mail className="w-3.5 h-3.5 group-hover/email:scale-110 transition-transform" />
                            }
                            <span>{emailLoading ? 'Fetching student emails…' : 'Email Students'}</span>
                            <Users className="w-3 h-3 text-emerald-600 ml-0.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slide-in animation */}
      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
    </ProtectedRoute>
  );
}
