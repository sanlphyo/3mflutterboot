'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/components/AuthProvider';
import { databases, DATABASE_ID, CLASS_PROGRESS_COLLECTION_ID, CURRICULUM_COLLECTION_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { BookOpen, Award, CheckCircle2, ChevronRight, Layers, Smartphone, Database, X, CheckSquare, Square, FolderOpen, Lock, PlayCircle, Eye, AlertCircle, RefreshCw, HelpCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface WeekItem {
  week: number;
  title: string;
  description: string;
  topics: string[];
  subtasks: string[];
}

interface Phase {
  title: string;
  subtitle: string;
  accentClass: string;
  glowClass: string;
  badgeColor: string;
  colorName: 'cyan' | 'violet' | 'emerald';
  icon: React.ComponentType<any>;
  weeks: WeekItem[];
}

const curriculumData: Phase[] = [
  {
    title: 'Phase 1: The Foundations',
    subtitle: 'Master the building blocks of Dart & fundamental UI creation',
    accentClass: 'border-cyan-500/20 hover:border-cyan-500/50',
    glowClass: 'glow-cyan',
    badgeColor: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/25',
    colorName: 'cyan',
    icon: Smartphone,
    weeks: [
      {
        week: 1,
        title: 'Dart Basics',
        description: 'Establish the core programming knowledge required to write robust Dart code.',
        topics: ['Variables & built-in types', 'Sound null safety', 'Control flow (loops, if/else)', 'Functions & basic parameters'],
        subtasks: [
          'Set up Flutter and Dart SDK environment',
          'Practice variable declaration & Null Safety constraints in DartPad',
          'Write helper functions featuring optional positional & named parameters',
          'Implement conditional calculations and iteration loops'
        ]
      },
      {
        week: 2,
        title: 'Object-Oriented Dart',
        description: 'Understand OOP paradigms to structure maintainable applications.',
        topics: ['Classes & constructors', 'Inheritance & polymorphism', 'Interfaces & mixins', 'Dart collections & generics'],
        subtasks: [
          'Declare a class containing private fields and getter/setter expressions',
          'Write custom classes featuring named and redirecting constructors',
          'Implement polymorphism utilizing class extensions and abstract class interfaces',
          'Practice filter, map, and fold queries on List and Map collections'
        ]
      },
      {
        week: 3,
        title: 'The Widget Tree',
        description: 'Dive into Flutter UI and comprehend how the rendering tree operates.',
        topics: ['Stateless vs Stateful widgets', 'Layout builders (Column, Row, Container)', 'Padding, Align & Center widgets', 'Understanding Constraints'],
        subtasks: [
          'Build a custom presentational Stateless widget displaying clean text styles',
          'Explain the precise operational difference between Widget, Element, and RenderObject',
          'Construct complex UI grids combining Column, Row, and nested Containers',
          'Build a responsive layout using Expanded, Flexible, and Spacer elements'
        ]
      },
      {
        week: 4,
        title: 'User Input & Forms',
        description: 'Learn how to capture input, validate data, and trigger user events.',
        topics: ['Text fields & controllers', 'Gesture detectors & buttons', 'Form validation & key controls', 'Displaying SnackBars & dialogs'],
        subtasks: [
          'Implement a custom Form containing multiple TextFormField structures',
          'Inject a TextEditingController to listen to, modify, and clear input fields',
          'Utilize GlobalKey<FormState> validation to trigger live regex validator alerts',
          'Design interactive button sets triggering custom feedback SnackBars'
        ]
      }
    ]
  },
  {
    title: 'Phase 2: Movement & State',
    subtitle: 'Understand lifecycle, navigation, and robust state propagation',
    accentClass: 'border-violet-500/20 hover:border-violet-500/50',
    glowClass: 'glow-violet',
    badgeColor: 'text-violet-400 bg-violet-950/40 border-violet-500/25',
    colorName: 'violet',
    icon: Layers,
    weeks: [
      {
        week: 5,
        title: 'Local State Management',
        description: 'Control state within an individual screen or widget tree branch.',
        topics: ['setState state updates', 'Widget lifecycles (initState, dispose)', 'Passing state via constructor parameters', 'Keys in Flutter'],
        subtasks: [
          'Construct a reactive state counter incrementing via setState calls',
          'Perform timer tasks and API fetches using initState, and safely release them inside dispose',
          'Build parent-child widget data sharing structures via interactive callbacks',
          'Understand Key variations (ValueKey, ObjectKey, UniqueKey) and why they preserve states'
        ]
      },
      {
        week: 6,
        title: 'Routing & Navigation',
        description: 'Build complex user flows and traverse screens smoothly.',
        topics: ['Pushing & popping routes', 'Named routes & argument pass-through', 'Custom transitions', 'Navigator 2.0 introduction'],
        subtasks: [
          'Push navigation pages using standard MaterialPageRoute commands',
          'Pop back to historical screens while returning response data maps',
          'Establish named routers inside MaterialApp configurations',
          'Inject arguments dynamic types and process them cleanly in receiving route routes'
        ]
      },
      {
        week: 7,
        title: 'Global State Management',
        description: 'Separate business logic from presentational user interfaces.',
        topics: ['Limitations of local state', 'Provider or Riverpod architecture', 'ChangeNotifiers & listeners', 'Architectural folders structure'],
        subtasks: [
          'List limitations of using local prop-drilling inside complex structures',
          'Integrate the Provider or Riverpod package inside global app runners',
          'Build a ChangeNotifier/Notifier controller holding logical triggers',
          'Wrap pages in Consumer widgets to trigger selective partial-rendering updates'
        ]
      },
      {
        week: 8,
        title: 'Advanced UI Design',
        description: 'Create fluid layouts, render dynamic lists, and customize system visuals.',
        topics: ['ListView.builder & GridViews', 'Custom styles & unified theme configurations', 'CustomPaint introductory concepts', 'Slivers & scrolling effects'],
        subtasks: [
          'Render lists exceeding 1000 items utilizing efficient ListView.builder pools',
          'Synchronize systemic dark/light themes inside theme data overrides',
          'Configure a custom paint canvas rendering geometric patterns',
          'Build beautiful expanding headers utilizing CustomScrollView and Slivers'
        ]
      }
    ]
  },
  {
    title: 'Phase 3: The Real World',
    subtitle: 'Connect to remote APIs, link databases, and deploy the application',
    accentClass: 'border-emerald-500/20 hover:border-emerald-500/50',
    glowClass: 'glow-emerald',
    badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/25',
    colorName: 'emerald',
    icon: Database,
    weeks: [
      {
        week: 9,
        title: 'Asynchronous Dart',
        description: 'Handle parallel computations, latency, and background jobs.',
        topics: ['Futures, async, and await', 'Streams & StreamBuilders', 'Try-Catch error controls', 'Delayed operations'],
        subtasks: [
          'Simulate mock delays returning values using future delay constructors',
          'Capture real-time events pools utilizing periodic Streams API',
          'Construct a reactive UI mapping stream states into dynamic StreamBuilders',
          'Handle error try-catch bubbles safely in async asynchronous pipelines'
        ]
      },
      {
        week: 10,
        title: 'REST API Integration',
        description: 'Connect Flutter to remote web services to load dynamic JSON content.',
        topics: ['Http/Dio packages implementation', 'Parsing complex JSON models', 'Using TMDB or public APIs', 'Handling loading and error UI states'],
        subtasks: [
          'Install and import the official Dio package inside networking layers',
          'Construct parse models using automated JSON parsing generators',
          'Connect the app to a public API (e.g. TMDB) to query real movie feeds',
          'Create high-contrast dynamic loaders and fallback error widgets'
        ]
      },
      {
        week: 11,
        title: 'Appwrite Backend & Auth',
        description: 'Link your app to a production BaaS for user registers and database storage.',
        topics: ['Configuring the Appwrite Flutter SDK', 'Database Collections syncing', 'Email registration & user logins', 'Cloud file uploads'],
        subtasks: [
          'Connect Appwrite Flutter Client to your cloud server endpoints',
          'Handle user registrations and persistent login sessions in-app',
          'Query, add, and update items inside Appwrite dynamic databases',
          'Upload photos from device galleries directly to Appwrite storage buckets'
        ]
      },
      {
        week: 12,
        title: 'Polish & App Release',
        description: 'Clean up code smells, write checks, and compile release builds.',
        topics: ['Flutter DevTools diagnostics', 'Performance profiling', 'Launcher icons & splash screens', 'Google Play & App Store build export'],
        subtasks: [
          'Debug rendering lags and memory leaks utilizing Flutter DevTools analyzer',
          'Asset compress graphics, configure unique launcher app icons, and add custom splash layouts',
          'Compile highly optimized release apk packages via flutter build commands',
          'Outline full deployment check processes for both iOS and Android stores'
        ]
      }
    ]
  }
];

type WeekClassStatus = 'locked' | 'active' | 'completed';

interface ClassProgressRecord {
  docId: string;
  status: WeekClassStatus;
}

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Roster States
  const [activePhaseFilter, setActivePhaseFilter] = useState<'all' | 0 | 1 | 2>('all');
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<WeekItem | null>(null);
  const [selectedWeekPhase, setSelectedWeekPhase] = useState<Phase | null>(null);

  // Appwrite Class Progress States
  const [classProgress, setClassProgress] = useState<Record<number, ClassProgressRecord>>({});
  const [progressLoading, setProgressLoading] = useState<boolean>(true);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [updatingWeek, setUpdatingWeek] = useState<number | null>(null);

  // Dynamic Curriculum Database States
  const [curriculum, setCurriculum] = useState<Phase[]>(curriculumData);
  const [curriculumLoading, setCurriculumLoading] = useState<boolean>(true);
  const [curriculumError, setCurriculumError] = useState<string | null>(null);

  // Syllabus Edit Form States
  const [isEditingSyllabus, setIsEditingSyllabus] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editTopics, setEditTopics] = useState<string[]>(['', '', '', '']);
  const [editSubtasks, setEditSubtasks] = useState<string[]>(['', '', '', '']);
  const [savingSyllabus, setSavingSyllabus] = useState<boolean>(false);

  // Populate Edit Fields when Week opens
  useEffect(() => {
    if (selectedWeek) {
      setEditTitle(selectedWeek.title);
      setEditDescription(selectedWeek.description);
      
      const topicsList = [...selectedWeek.topics];
      while (topicsList.length < 4) topicsList.push('');
      setEditTopics(topicsList.slice(0, 4));

      const subtasksList = [...selectedWeek.subtasks];
      while (subtasksList.length < 4) subtasksList.push('');
      setEditSubtasks(subtasksList.slice(0, 4));
      
      setIsEditingSyllabus(false);
    }
  }, [selectedWeek]);

  // Fetch syllabus curriculum from Appwrite Database
  const fetchCurriculum = async () => {
    setCurriculumLoading(true);
    setCurriculumError(null);
    try {
      if (!DATABASE_ID || !CURRICULUM_COLLECTION_ID) {
        throw new Error('Curriculum Database ID or Collection ID is not configured.');
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        CURRICULUM_COLLECTION_ID,
        [Query.limit(100)]
      );

      const docs = response.documents || [];

      if (docs.length > 0) {
        const sortedWeeks = [...docs].sort((a: any, b: any) => a.week - b.week);
        
        const updatedCurriculum = curriculumData.map((phase, phaseIdx) => {
          const startWeek = phaseIdx * 4 + 1;
          const endWeek = startWeek + 3;
          
          const phaseWeeks = sortedWeeks
            .filter((doc: any) => doc.week >= startWeek && doc.week <= endWeek)
            .map((doc: any) => ({
              docId: doc.$id,
              week: doc.week,
              title: doc.title || '',
              description: doc.description || '',
              topics: Array.isArray(doc.topics) ? doc.topics : [],
              subtasks: Array.isArray(doc.subtasks) ? doc.subtasks : []
            }));

          const defaultWeeks = phase.weeks.map(defaultW => {
            const found = phaseWeeks.find(pw => pw.week === defaultW.week);
            return found || { ...defaultW, docId: undefined };
          });

          return {
            ...phase,
            weeks: defaultWeeks
          };
        });

        setCurriculum(updatedCurriculum);
      } else {
        setCurriculum(curriculumData.map(p => ({
          ...p,
          weeks: p.weeks.map(w => ({ ...w, docId: undefined }))
        })));
      }
    } catch (err: any) {
      console.error('Failed to sync syllabus from database:', err);
      setCurriculumError(err.message || 'Failed to retrieve curriculum.');
      setCurriculum(curriculumData);
    } finally {
      setCurriculumLoading(false);
    }
  };

  // Seeding Helper: Automatically seeds the curriculum documents
  const seedCurriculumDatabase = async () => {
    if (user?.role !== 'mentor') {
      alert("Unauthorized: Only the mentor can seed the curriculum.");
      return;
    }
    setCurriculumLoading(true);
    setCurriculumError(null);
    try {
      if (!DATABASE_ID || !CURRICULUM_COLLECTION_ID) {
        throw new Error('Database or Curriculum collection is unconfigured.');
      }

      const flatWeeks: any[] = [];
      curriculumData.forEach(p => {
        p.weeks.forEach(w => {
          flatWeeks.push(w);
        });
      });

      const promises = flatWeeks.map(w => {
        return databases.createDocument(
          DATABASE_ID,
          CURRICULUM_COLLECTION_ID,
          ID.unique(),
          {
            week: w.week,
            title: w.title,
            description: w.description,
            topics: w.topics,
            subtasks: w.subtasks
          }
        );
      });

      await Promise.all(promises);
      await fetchCurriculum();
      alert("Syllabus successfully seeded into Appwrite database!");
    } catch (err: any) {
      console.error('Failed to seed curriculum documents:', err);
      setCurriculumError(err.message || 'Seeding failed. Make sure collection schema matches.');
    } finally {
      setCurriculumLoading(false);
    }
  };

  // Save customized week syllabus details (Mentor only write command)
  const handleSaveSyllabusContent = async (weekNumber: number) => {
    if (user?.role !== 'mentor') {
      alert("Unauthorized: Only the mentor can edit dynamic syllabus contents.");
      return;
    }

    setSavingSyllabus(true);
    try {
      let weekDocId: string | undefined = undefined;
      for (const phase of curriculum) {
        const found = phase.weeks.find((w: any) => w.week === weekNumber);
        if (found) {
          weekDocId = (found as any).docId;
          break;
        }
      }

      const cleanedTopics = editTopics.filter(t => t.trim() !== '');
      const cleanedSubtasks = editSubtasks.filter(s => s.trim() !== '');

      if (!DATABASE_ID || !CURRICULUM_COLLECTION_ID) {
        throw new Error('Database configuration details missing.');
      }

      if (weekDocId) {
        await databases.updateDocument(
          DATABASE_ID,
          CURRICULUM_COLLECTION_ID,
          weekDocId,
          {
            title: editTitle,
            description: editDescription,
            topics: cleanedTopics,
            subtasks: cleanedSubtasks
          }
        );
      } else {
        await databases.createDocument(
          DATABASE_ID,
          CURRICULUM_COLLECTION_ID,
          ID.unique(),
          {
            week: weekNumber,
            title: editTitle,
            description: editDescription,
            topics: cleanedTopics,
            subtasks: cleanedSubtasks
          }
        );
      }

      setSelectedWeek(prev => prev ? {
        ...prev,
        title: editTitle,
        description: editDescription,
        topics: cleanedTopics,
        subtasks: cleanedSubtasks
      } : null);

      await fetchCurriculum();
      setIsEditingSyllabus(false);
      alert(`Syllabus for Week ${weekNumber} saved successfully to database!`);
    } catch (err: any) {
      console.error('Failed to save syllabus document:', err);
      alert(`Database write failed: ${err.message || 'Connection failed.'}`);
    } finally {
      setSavingSyllabus(false);
    }
  };

  // Fetch Class progress from Appwrite Database
  const fetchClassProgress = async () => {
    setProgressLoading(true);
    setProgressError(null);
    try {
      if (!DATABASE_ID || !CLASS_PROGRESS_COLLECTION_ID) {
        throw new Error('Class Progress Collection ID is missing in environment configuration.');
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        CLASS_PROGRESS_COLLECTION_ID,
        [Query.limit(100)]
      );

      const recordsMap: Record<number, ClassProgressRecord> = {};
      (response.documents || []).forEach((doc: any) => {
        const weekNum = typeof doc.week_number === 'number' ? doc.week_number : 1;
        recordsMap[weekNum] = {
          docId: doc.$id,
          status: (doc.status === 'active' || doc.status === 'completed' || doc.status === 'locked' 
            ? doc.status 
            : 'locked') as WeekClassStatus
        };
      });

      setClassProgress(recordsMap);
    } catch (err: any) {
      console.error('Failed to sync class progress from database:', err);
      setProgressError(err.message || 'Failed to retrieve class progress.');
    } finally {
      setProgressLoading(false);
    }
  };

  // Seeding Helper: Automatically inserts 12 weeks with status locked/active
  const seedClassProgressDatabase = async () => {
    if (user?.role !== 'mentor') {
      alert("Unauthorized: Only the mentor can seed class progress.");
      return;
    }
    setProgressLoading(true);
    setProgressError(null);
    try {
      if (!DATABASE_ID || !CLASS_PROGRESS_COLLECTION_ID) {
        throw new Error('Database ID or Progress collection ID is unconfigured.');
      }

      const promises = Array.from({ length: 12 }, (_, i) => {
        const weekNum = i + 1;
        const initialStatus = weekNum === 1 ? 'active' : 'locked';
        
        return databases.createDocument(
          DATABASE_ID,
          CLASS_PROGRESS_COLLECTION_ID,
          ID.unique(),
          {
            week_number: weekNum,
            status: initialStatus
          }
        );
      });

      await Promise.all(promises);
      await fetchClassProgress();
    } catch (err: any) {
      console.error('Failed to seed progress documents:', err);
      setProgressError(err.message || 'Seeding failed. Make sure collection schema matches.');
    } finally {
      setProgressLoading(false);
    }
  };

  // Update specific week class status (Mentor only write command)
  const handleUpdateClassStatus = async (weekNumber: number, newStatus: WeekClassStatus) => {
    if (user?.role !== 'mentor') {
      alert("Unauthorized: Only the mentor can update class progress.");
      return;
    }
    const record = classProgress[weekNumber];
    if (!record) return;

    setUpdatingWeek(weekNumber);
    
    try {
      // Optimistic Local State Update
      setClassProgress(prev => ({
        ...prev,
        [weekNumber]: {
          ...prev[weekNumber],
          status: newStatus
        }
      }));

      await databases.updateDocument(
        DATABASE_ID,
        CLASS_PROGRESS_COLLECTION_ID,
        record.docId,
        {
          status: newStatus
        }
      );
    } catch (err: any) {
      console.error('Failed to update class progress document:', err);
      alert(`Database write failed: ${err.message || 'Connection failed.'}`);
      fetchClassProgress(); // Rollback local state
    } finally {
      setUpdatingWeek(null);
    }
  };

  // Sync completion states with local storage
  useEffect(() => {
    try {
      const savedWeeks = localStorage.getItem('3m_completed_weeks');
      const savedTasks = localStorage.getItem('3m_completed_tasks');
      if (savedWeeks) setCompletedWeeks(JSON.parse(savedWeeks));
      if (savedTasks) setCompletedTasks(JSON.parse(savedTasks));
    } catch (err) {
      console.error('Failed to parse syllabus interaction progress.', err);
    }
    
    fetchClassProgress();
    fetchCurriculum();
  }, []);

  const saveProgress = (weeks: number[], tasks: string[]) => {
    localStorage.setItem('3m_completed_weeks', JSON.stringify(weeks));
    localStorage.setItem('3m_completed_tasks', JSON.stringify(tasks));
  };

  // Toggle local week completion
  const handleToggleWeekComplete = (weekNumber: number) => {
    let newCompletedWeeks = [...completedWeeks];
    const index = newCompletedWeeks.indexOf(weekNumber);
    
    let weekObj: WeekItem | null = null;
    for (const phase of curriculumData) {
      const found = phase.weeks.find(w => w.week === weekNumber);
      if (found) {
        weekObj = found;
        break;
      }
    }

    let newCompletedTasks = [...completedTasks];

    if (index > -1) {
      newCompletedWeeks.splice(index, 1);
      if (weekObj) {
        weekObj.subtasks.forEach((_, idx) => {
          const taskKey = `${weekNumber}-${idx}`;
          const tIdx = newCompletedTasks.indexOf(taskKey);
          if (tIdx > -1) newCompletedTasks.splice(tIdx, 1);
        });
      }
    } else {
      newCompletedWeeks.push(weekNumber);
      if (weekObj) {
        weekObj.subtasks.forEach((_, idx) => {
          const taskKey = `${weekNumber}-${idx}`;
          if (!newCompletedTasks.includes(taskKey)) {
            newCompletedTasks.push(taskKey);
          }
        });
      }
    }
    
    setCompletedWeeks(newCompletedWeeks);
    setCompletedTasks(newCompletedTasks);
    saveProgress(newCompletedWeeks, newCompletedTasks);
  };

  // Toggle granular task checklist item
  const handleToggleGranularTask = (weekNumber: number, taskIndex: number, subtasksCount: number) => {
    const taskKey = `${weekNumber}-${taskIndex}`;
    let newCompletedTasks = [...completedTasks];
    const index = newCompletedTasks.indexOf(taskKey);

    if (index > -1) {
      newCompletedTasks.splice(index, 1);
    } else {
      newCompletedTasks.push(taskKey);
    }

    setCompletedTasks(newCompletedTasks);

    const weekTaskKeys = Array.from({ length: subtasksCount }, (_, idx) => `${weekNumber}-${idx}`);
    const allCompleted = weekTaskKeys.every(key => newCompletedTasks.includes(key));

    let newCompletedWeeks = [...completedWeeks];
    const weekIdx = newCompletedWeeks.indexOf(weekNumber);

    if (allCompleted && weekIdx === -1) {
      newCompletedWeeks.push(weekNumber);
    } else if (!allCompleted && weekIdx > -1) {
      newCompletedWeeks.splice(weekIdx, 1);
    }

    setCompletedWeeks(newCompletedWeeks);
    saveProgress(newCompletedWeeks, newCompletedTasks);
  };

  const getWeekProgressPercentage = (weekNumber: number, subtasksCount: number) => {
    const weekTaskKeys = Array.from({ length: subtasksCount }, (_, idx) => `${weekNumber}-${idx}`);
    const completedCount = weekTaskKeys.filter(key => completedTasks.includes(key)).length;
    return Math.round((completedCount / subtasksCount) * 100);
  };

  // Calculate overall metrics
  const totalWeeks = 12;
  const progressPercent = Math.round((completedWeeks.length / totalWeeks) * 100);

  // Filter content
  const displayedPhases = activePhaseFilter === 'all' 
    ? curriculum 
    : [curriculum[activePhaseFilter as number]];

  const handleOpenWeekDrawer = (weekItem: WeekItem, phaseItem: Phase) => {
    setSelectedWeek(weekItem);
    setSelectedWeekPhase(phaseItem);
  };

  const handleCloseWeekDrawer = () => {
    setSelectedWeek(null);
    setSelectedWeekPhase(null);
  };

  const hasProgressLoaded = Object.keys(classProgress).length > 0;

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans overflow-x-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Core Portal Feed */}
        <main className="flex-1 pl-64 relative min-h-screen">
          {/* Background Ambient Glows */}
          <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full bg-cyan-500/5 blur-[130px] pointer-events-none z-0"></div>
          <div className="absolute bottom-20 left-64 w-[450px] h-[450px] rounded-full bg-violet-600/5 blur-[130px] pointer-events-none z-0"></div>

          <div className="max-w-5xl mx-auto px-8 py-10 relative z-10">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-zinc-900 pb-8">
              <div>
                <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">
                  Active Learning Desk
                </span>
                <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight mt-1">
                  Class Syllabus Timeline
                </h1>
                <p className="text-sm text-zinc-400 mt-2">
                  {user?.role === 'mentor' 
                    ? 'Mentor Terminal: Track dynamic lesson stages and configure active weeks for your class.'
                    : 'Track class focus, view lesson details, and tick off weekly learning milestones.'}
                </p>
              </div>

              {/* Progress Summary Orb Card */}
              <div className="flex items-center gap-4 px-5 py-3.5 bg-zinc-900/40 border border-zinc-800 rounded-2xl glow-cyan min-w-[240px]">
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="rgba(39,39,42,0.6)" strokeWidth="3" fill="transparent" />
                    <circle cx="24" cy="24" r="20" stroke="url(#cyanVioletGrad)" strokeWidth="3" fill="transparent"
                      strokeDasharray={2 * Math.PI * 20}
                      strokeDashoffset={2 * Math.PI * 20 * (1 - progressPercent / 100)}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="cyanVioletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute text-xs font-bold tracking-tight text-zinc-200">
                    {progressPercent}%
                  </span>
                </div>
                <div className="text-left flex-1 min-w-0">
                  <span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Your Milestones</span>
                  <span className="text-xs font-semibold text-zinc-200 truncate block mt-0.5">
                    {completedWeeks.length} of {totalWeeks} Weeks Done
                  </span>
                  <div className="w-full bg-zinc-800 h-1 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-violet-400 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error / Seeding Panel in case Database is unseeded */}
            {progressError ? (
              <div className="border border-amber-900/40 bg-amber-950/10 backdrop-blur-md rounded-2xl p-6 mb-10 max-w-2xl">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-400">Class Progress Synchronization Inactive</h4>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      Could not load synchronized class progress cards from Appwrite:
                    </p>
                    <code className="block mt-2 p-2 bg-zinc-950/80 border border-zinc-900 rounded text-[10px] text-amber-300 font-mono">
                      {progressError}
                    </code>
                    {user?.role === 'mentor' && (
                      <p className="text-xs text-zinc-500 mt-3">
                        💡 **Mentor Action:** Make sure you have created the `class_progress` collection in database `{DATABASE_ID}` with the attributes `week_number` (Integer) and `status` (String).
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : !progressLoading && !hasProgressLoaded && user?.role === 'mentor' ? (
              /* Auto-seeding terminal alert for Mentors */
              <div className="border border-violet-900/40 bg-violet-950/10 backdrop-blur-md rounded-2xl p-6 mb-10 max-w-2xl flex items-center justify-between gap-6">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-violet-400 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h4 className="text-sm font-bold text-violet-300">Synchronized Progress Setup Needed</h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      No progress records were found in the database. Initialize them now to start tracking the 12-week course.
                    </p>
                  </div>
                </div>
                <button
                  onClick={seedClassProgressDatabase}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-violet-500 hover:from-cyan-300 hover:to-violet-400 text-zinc-950 text-xs font-bold rounded-xl cursor-pointer shadow-md tracking-wide shrink-0"
                >
                  Seed Database (12 Weeks)
                </button>
              </div>
            ) : null}

            {/* Seeding panel for Curriculum in case database is unseeded */}
            {!curriculumLoading && !curriculum.some(phase => phase.weeks.some(w => (w as any).docId !== undefined)) && user?.role === 'mentor' ? (
              <div className="border border-cyan-900/40 bg-cyan-950/10 backdrop-blur-md rounded-2xl p-6 mb-10 max-w-2xl flex items-center justify-between gap-6">
                <div className="flex gap-3">
                  <BookOpen className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-cyan-300">Syllabus Database Setup Needed</h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      No custom syllabus records were found in the database. Initialize the curriculum table now to enable real-time dynamic syllabus edits.
                    </p>
                  </div>
                </div>
                <button
                  onClick={seedCurriculumDatabase}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-violet-500 hover:from-cyan-300 hover:to-violet-400 text-zinc-950 text-xs font-bold rounded-xl cursor-pointer shadow-md tracking-wide shrink-0 font-sans"
                >
                  Seed Curriculum (12 Weeks)
                </button>
              </div>
            ) : null}

            {/* Interactive Filters Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-zinc-900/40 border border-zinc-800/80 rounded-xl mb-10 w-fit">
              <button
                onClick={() => setActivePhaseFilter('all')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activePhaseFilter === 'all'
                    ? 'text-zinc-100 bg-zinc-800 border-zinc-700/60 shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                }`}
              >
                All Phases
              </button>
              {curriculumData.map((phase, index) => (
                <button
                  key={phase.title}
                  onClick={() => setActivePhaseFilter(index as 0 | 1 | 2)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activePhaseFilter === index
                      ? index === 0 ? 'text-cyan-400 bg-cyan-950/20 border border-cyan-500/20' :
                        index === 1 ? 'text-violet-400 bg-violet-950/20 border border-violet-500/20' :
                        'text-emerald-400 bg-emerald-950/20 border border-emerald-500/20'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                  }`}
                >
                  Phase {index + 1}
                </button>
              ))}
            </div>

            {/* Curriculum Timeline */}
            <div className="space-y-16">
              {displayedPhases.map((phase) => {
                const PhaseIcon = phase.icon;
                const phaseIndex = curriculumData.indexOf(phase);

                return (
                  <div key={phase.title} className="relative">
                    {/* Phase Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-lg shrink-0">
                        <PhaseIcon className="w-5 h-5 text-zinc-300" />
                      </div>
                      <div>
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${phase.badgeColor} mb-1`}>
                          Phase {phaseIndex + 1}
                        </span>
                        <h2 className="text-xl font-bold text-zinc-100 tracking-wide">
                          {phase.title.split(': ')[1] || phase.title}
                        </h2>
                        <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                          {phase.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Weeks Vertical Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-1">
                      {phase.weeks.map((item) => {
                        const isWeekDone = completedWeeks.includes(item.week);
                        const weekProgress = getWeekProgressPercentage(item.week, item.subtasks.length);
                        
                        // Dynamic Class Progress Status from Appwrite database
                        const statusRecord = classProgress[item.week];
                        const classStatus: WeekClassStatus = statusRecord ? statusRecord.status : 'locked';

                        const isLocked = classStatus === 'locked' && user?.role !== 'mentor';

                        // Aesthetic configuration based on classStatus
                        let statusBadge = null;
                        let statusBorder = phase.accentClass;
                        let statusCardBg = 'bg-zinc-900/30';
                        let statusOpacity = 'opacity-100';

                        if (classStatus === 'locked') {
                          statusBorder = 'border-zinc-900/80 hover:border-zinc-800/80';
                          statusCardBg = 'bg-zinc-950/40';
                          statusOpacity = 'opacity-85 hover:opacity-100 cursor-pointer';
                          statusBadge = (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                              <Lock className="w-2.5 h-2.5" />
                              Locked
                            </span>
                          );
                        } else if (classStatus === 'active') {
                          statusBorder = `${phase.accentClass} ${phase.glowClass} border-cyan-500/30 ring-1 ring-cyan-500/10`;
                          statusCardBg = 'bg-zinc-900/40';
                          statusBadge = (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/25 text-[9px] font-bold uppercase tracking-wider text-cyan-400 animate-pulse">
                              <PlayCircle className="w-2.5 h-2.5" />
                              Active Focus
                            </span>
                          );
                        } else if (classStatus === 'completed') {
                          statusBorder = 'border-emerald-500/20 hover:border-emerald-500/40';
                          statusCardBg = 'bg-emerald-950/5';
                          statusBadge = (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/25 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Session Completed
                            </span>
                          );
                        }

                        return (
                          <div
                            key={item.week}
                            className={`group relative p-6 border rounded-2xl transition-all duration-500 flex flex-col justify-between cursor-pointer ${statusBorder} ${statusCardBg} ${statusOpacity}`}
                            onClick={() => handleOpenWeekDrawer(item, phase)}
                          >
                            {/* Accent blur for active weeks */}
                            {classStatus === 'active' && (
                              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none z-0"></div>
                            )}

                            <div className="relative z-10">
                              {/* Card Header Info */}
                              <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex flex-col gap-1.5">
                                  <span className="text-[10px] font-extrabold tracking-widest text-zinc-500 uppercase">
                                    Week {item.week}
                                  </span>
                                  {statusBadge}
                                </div>
                                
                                {/* Personal completion indicator */}
                                <div className="flex items-center gap-2 shrink-0">
                                  {isWeekDone ? (
                                    <div className="w-6 h-6 rounded-full bg-emerald-950/40 border border-emerald-500/35 flex items-center justify-center text-emerald-400">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    </div>
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                                      #{item.week}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Titles */}
                              <h3 className={`text-base font-bold tracking-wide transition-colors ${
                                isLocked ? 'text-zinc-400 group-hover:text-zinc-200' : 'text-zinc-200 group-hover:text-zinc-100'
                              }`}>
                                {item.title}
                              </h3>
                              <p className={`text-xs mt-2 leading-relaxed ${isLocked ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                {item.description}
                              </p>

                              {/* Personal Progress indicator */}
                              {weekProgress > 0 && !isWeekDone && !isLocked && (
                                <div className="mt-4 flex items-center gap-2">
                                  <div className="flex-1 bg-zinc-950/80 rounded-full h-1 overflow-hidden border border-zinc-900">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        phase.colorName === 'cyan' ? 'bg-cyan-400' :
                                        phase.colorName === 'violet' ? 'bg-violet-400' : 'bg-emerald-400'
                                      }`}
                                      style={{ width: `${weekProgress}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-[9px] text-zinc-500 font-bold shrink-0">{weekProgress}%</span>
                                </div>
                              )}

                              {/* Bullet Topics list */}
                              <ul className="mt-4 space-y-1.5 border-t border-zinc-900/50 pt-4">
                                {item.topics.map((topic, i) => (
                                  <li key={i} className="flex items-start gap-2 text-[11px] text-zinc-450 group-hover:text-zinc-300 transition-colors">
                                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600 mt-0.5 shrink-0" />
                                    <span>{topic}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Card Footer Block */}
                            <div className="mt-5 relative z-10 border-t border-zinc-900/30 pt-3.5 flex flex-col gap-3.5 justify-between">
                              
                              {/* ROLE FLAG CHECK: MENTOR STATUS CONTROLLER DROPDOWN */}
                              {user?.role === 'mentor' && statusRecord && (
                                <div 
                                  className="w-full flex items-center justify-between gap-2 p-2 bg-zinc-950/50 border border-zinc-800/80 rounded-xl"
                                  onClick={(e) => e.stopPropagation()} // Prevent card modal expansion trigger
                                >
                                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">
                                    Set Class Status:
                                  </span>
                                  {updatingWeek === item.week ? (
                                    <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin shrink-0"></div>
                                  ) : (
                                    <select
                                      value={classStatus}
                                      onChange={(e) => handleUpdateClassStatus(item.week, e.target.value as WeekClassStatus)}
                                      className="bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-[9px] font-bold tracking-wider text-zinc-300 focus:outline-none cursor-pointer appearance-none uppercase"
                                    >
                                      <option value="locked">🔒 Locked</option>
                                      <option value="active">⚡ Active</option>
                                      <option value="completed">✓ Completed</option>
                                    </select>
                                  )}
                                </div>
                              )}

                              {/* Interactive Cue */}
                              <div className="flex items-center justify-between text-[10px] font-bold tracking-wider">
                                <span className={isLocked ? 'text-zinc-600' : isWeekDone ? 'text-emerald-400/80' : 'text-zinc-500 group-hover:text-zinc-400'}>
                                  {isLocked ? 'Closed Content' : isWeekDone ? 'Completed' : 'Expand Milestones'}
                                </span>
                                {!isLocked && (
                                  <div className="flex items-center gap-1 text-zinc-500 group-hover:text-zinc-400 transition-colors">
                                    <span>Details</span>
                                    <ChevronRight className="w-3.5 h-3.5 ml-0.5 transform group-hover:translate-x-0.5 transition-transform" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Side Slide-out Drawer Panel (Week Interactive Tasks) */}
      {selectedWeek && selectedWeekPhase && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-zinc-950/70 backdrop-blur-sm transition-opacity duration-300"
          onClick={handleCloseWeekDrawer}
        >
          <div 
            className="w-full max-w-lg bg-zinc-900 border-l border-zinc-800/80 h-full p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-y-auto flex flex-col justify-between z-50 animate-slide-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>

            {isEditingSyllabus ? (
              /* SYLLABUS EDIT MODE */
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-cyan-500/20 text-cyan-400 bg-cyan-950/20">
                    Edit Week {selectedWeek.week} Syllabus
                  </span>
                  
                  <button 
                    onClick={() => setIsEditingSyllabus(false)}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest mb-1.5">Week Title</label>
                    <input 
                      type="text" 
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500 transition-colors"
                      placeholder="Title"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest mb-1.5">Overview Description</label>
                    <textarea 
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                      placeholder="Description"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest mb-2.5">Weekly Topics (Max 4)</label>
                    <div className="space-y-2">
                      {editTopics.map((topic, idx) => (
                        <input 
                          key={idx}
                          type="text" 
                          placeholder={`Topic ${idx + 1}`}
                          value={topic}
                          onChange={(e) => {
                            const newList = [...editTopics];
                            newList[idx] = e.target.value;
                            setEditTopics(newList);
                          }}
                          className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest mb-2.5">Granular Milestones (Max 4)</label>
                    <div className="space-y-2">
                      {editSubtasks.map((task, idx) => (
                        <input 
                          key={idx}
                          type="text" 
                          placeholder={`Milestone ${idx + 1}`}
                          value={task}
                          onChange={(e) => {
                            const newList = [...editSubtasks];
                            newList[idx] = e.target.value;
                            setEditSubtasks(newList);
                          }}
                          className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-900 flex items-center gap-3">
                  <button
                    onClick={() => setIsEditingSyllabus(false)}
                    className="flex-grow py-3 border border-zinc-800 bg-zinc-950/50 hover:bg-zinc-950/80 text-xs font-bold text-zinc-400 hover:text-zinc-200 rounded-xl transition-all duration-300 cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveSyllabusContent(selectedWeek.week)}
                    disabled={savingSyllabus}
                    className="flex-grow py-3 bg-gradient-to-r from-cyan-500 to-violet-500 text-zinc-950 font-extrabold hover:from-cyan-400 hover:to-violet-400 text-xs rounded-xl transition-all duration-300 cursor-pointer shadow-lg disabled:opacity-50 text-center"
                  >
                    {savingSyllabus ? 'Saving...' : 'Save Syllabus'}
                  </button>
                </div>
              </div>
            ) : (
              /* SYLLABUS VIEW MODE (STANDARD VIEW) */
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${selectedWeekPhase.badgeColor}`}>
                    Week {selectedWeek.week} Details
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {user?.role === 'mentor' && (
                      <button
                        onClick={() => setIsEditingSyllabus(true)}
                        className="px-3 py-1 text-[10px] font-bold tracking-wide rounded-lg border border-zinc-850 hover:border-zinc-750 bg-zinc-950/40 text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer"
                      >
                        ✏️ Edit Syllabus
                      </button>
                    )}
                    <button 
                      onClick={handleCloseWeekDrawer}
                      className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-950/80 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h2 className="text-2xl font-extrabold text-zinc-100 tracking-tight">
                  {selectedWeek.title}
                </h2>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {selectedWeek.description}
                </p>

                <div className="p-3 bg-zinc-950/50 border border-zinc-800/60 rounded-xl mt-4 flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest block">Phase Segment:</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    selectedWeekPhase.colorName === 'cyan' ? 'text-cyan-400' :
                    selectedWeekPhase.colorName === 'violet' ? 'text-violet-400' : 'text-emerald-400'
                  }`}>
                    {selectedWeekPhase.title.split(': ')[1]}
                  </span>
                </div>

                {/* Class Lock Status Alert inside Syllabus Details */}
                {classProgress[selectedWeek.week]?.status === 'locked' && (
                  <div className="p-3 bg-amber-950/10 border border-amber-900/30 text-amber-400/80 text-[10px] font-semibold rounded-xl mt-3 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>This curriculum week is currently locked by the mentor.</span>
                  </div>
                )}

                {/* Granular Milestones List */}
                <div className="mt-8">
                  <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-4 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-cyan-400" />
                    <span>Granular Milestones ({selectedWeek.subtasks.filter((_, idx) => completedTasks.includes(`${selectedWeek.week}-${idx}`)).length} / {selectedWeek.subtasks.length})</span>
                  </h3>
                  
                  <div className="space-y-3">
                    {selectedWeek.subtasks.map((task, idx) => {
                      const taskKey = `${selectedWeek.week}-${idx}`;
                      const isTaskDone = completedTasks.includes(taskKey);
                      
                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleGranularTask(selectedWeek.week, idx, selectedWeek.subtasks.length)}
                          className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer select-none transition-all duration-300 ${
                            isTaskDone 
                              ? 'bg-emerald-950/10 border-emerald-950 text-zinc-400 hover:bg-emerald-950/15' 
                              : 'bg-zinc-950/20 border-zinc-800/80 hover:border-zinc-800 hover:bg-zinc-950/50 text-zinc-200'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isTaskDone ? (
                              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 fill-emerald-950/40" />
                            ) : (
                              <Square className="w-4.5 h-4.5 text-zinc-600 hover:text-zinc-400 transition-colors" />
                            )}
                          </div>
                          <span className={`text-xs leading-relaxed ${isTaskDone ? 'line-through decoration-zinc-800 text-zinc-500' : ''}`}>
                            {task}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Drawer Actions */}
            {!isEditingSyllabus && (
              <div className="pt-6 border-t border-zinc-900 mt-8 space-y-3">
                <Link
                  href="/resources"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-zinc-800 bg-zinc-950/50 hover:bg-zinc-950/80 text-xs font-bold tracking-wide text-zinc-300 hover:text-zinc-100 transition-all duration-300"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Open Weekly Resources Vault</span>
                </Link>

                <button
                  onClick={() => {
                    handleToggleWeekComplete(selectedWeek.week);
                    handleCloseWeekDrawer();
                  }}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                    completedWeeks.includes(selectedWeek.week)
                      ? 'border border-rose-900/30 text-rose-400 hover:bg-rose-950/15'
                      : 'bg-gradient-to-r from-cyan-500 to-violet-500 text-zinc-950 font-extrabold hover:from-cyan-400 hover:to-violet-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {completedWeeks.includes(selectedWeek.week) 
                      ? 'Reset All Weekly Progress' 
                      : 'Complete Entire Week'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slide-in styles */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </ProtectedRoute>
  );
}
