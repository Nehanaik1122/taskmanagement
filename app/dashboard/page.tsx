'use client';

import { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

// ── Accent tokens ──────────────────────────────────────────────────────────────
const ACCENT_TOKENS = [
  { border: 'border-violet-500' },
  { border: 'border-sky-500' },
  { border: 'border-emerald-500' },
  { border: 'border-rose-500' },
  { border: 'border-amber-500' },
];

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, delay }: { label: string; value: number; icon: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white/70 p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
    >
      <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gray-100 opacity-60 blur-2xl dark:bg-white/5" />
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</p>
      <div className="flex items-end justify-between">
        <motion.span
          key={value}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="text-4xl font-black tabular-nums text-gray-900 dark:text-white"
        >
          {value}
        </motion.span>
        <span className="mb-1 text-2xl">{icon}</span>
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { tasks, createTask, deleteTask, updateTask, filter, setFilter, search, setSearch } = useTasks();

  const [user, setUser]               = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate]         = useState('');
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editTitle, setEditTitle]     = useState('');
  const [darkMode, setDarkMode]       = useState(false);

  // ── Persistent dark mode ───────────────────────────────────────────────────
  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // ── Firebase auth guard ────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
        setLoadingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (loadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top_left,_#ede9fe_0%,_#f0f9ff_40%,_#f8fafc_100%)] dark:bg-[radial-gradient(ellipse_at_top_left,_#1e1b4b_0%,_#0f172a_50%,_#020617_100%)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="h-8 w-8 rounded-full border-2 border-violet-500 border-t-transparent"
        />
      </div>
    );
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddTask = () => {
    if (!title.trim() || !dueDate) {
      toast({ title: '⚠️ Missing fields', description: 'Please enter both a title and a due date.', variant: 'destructive' });
      return;
    }
    createTask({ title: title.trim(), dueDate, description: description.trim() });
    toast({ title: '✅ Task added', description: `"${title.trim()}" is on your list.` });
    setTitle('');
    setDescription('');
    setDueDate('');
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setEditTitle(task.title);
  };

  const saveEdit = () => {
    if (!editTitle.trim()) {
      toast({ title: '⚠️ Empty title', description: 'Title cannot be empty.', variant: 'destructive' });
      return;
    }
    updateTask(editingTask.id, { title: editTitle.trim() });
    toast({ title: '✏️ Task updated', description: `Renamed to "${editTitle.trim()}".` });
    setEditingTask(null);
  };

  const handleDelete = (id: string, taskTitle: string) => {
    deleteTask(id);
    toast({ title: '🗑️ Task deleted', description: `"${taskTitle}" has been removed.`, variant: 'destructive' });
  };

  const handleToggle = (task: any) => {
    const next = task.status === 'completed' ? 'pending' : 'completed';
    updateTask(task.id, { status: next });
    toast({
      title: next === 'completed' ? '🎉 Completed!' : '🔄 Marked pending',
      description: `"${task.title}" is now ${next}.`,
    });
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const total     = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending   = tasks.filter(t => t.status === 'pending').length;

  // ── Avatar initials fallback ───────────────────────────────────────────────
  const displayName = user?.displayName || user?.email || 'User';
  const initials    = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Mono&display=swap');

        .tm-wordmark {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.35rem;
          letter-spacing: 0.03em;
          background: linear-gradient(110deg, #7c3aed 0%, #a855f7 45%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
          cursor: pointer;
          user-select: none;
          line-height: 1;
        }

        .dark .tm-wordmark {
          background: linear-gradient(110deg, #a78bfa 0%, #c084fc 45%, #f472b6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .tm-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #a855f7;
          margin-left: 2px;
          vertical-align: middle;
          position: relative;
          top: -3px;
          box-shadow: 0 0 7px #a855f7, 0 0 16px rgba(168, 85, 247, 0.5);
          animation: tm-pulse 2.4s ease-in-out infinite;
        }

        .dark .tm-dot {
          background: #c084fc;
          box-shadow: 0 0 7px #c084fc, 0 0 16px rgba(192, 132, 252, 0.45);
        }

        @keyframes tm-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(0.75); }
        }

        .tm-navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          height: 58px;
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(20px) saturate(1.5);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .dark .tm-navbar {
          background: rgba(9, 9, 18, 0.85);
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }
      `}</style>

      {/* ── Sticky Nav ── */}
      <nav className="tm-navbar">
        {/* Brand */}
        <motion.div
          className="tm-wordmark"
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          onClick={() => router.push('/dashboard')}
        >
          TASKMASTER<span className="tm-dot" />
        </motion.div>

        {/* Right controls */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Dark mode */}
          <button
            onClick={() => setDarkMode(d => !d)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-gray-200/70 bg-white/80 text-base shadow-sm backdrop-blur transition hover:scale-105 dark:border-white/10 dark:bg-white/5"
            aria-label="Toggle theme"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* Profile avatar */}
          <button
            onClick={() => router.push('/profile')}
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-gray-200/70 bg-white/80 shadow-sm backdrop-blur transition hover:scale-105 dark:border-white/10 dark:bg-white/5"
            aria-label="Profile"
            title={displayName}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-violet-600 dark:text-violet-400">{initials}</span>
            )}
          </button>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="rounded-xl border border-gray-200/70 bg-white/80 px-3 py-1.5 text-xs font-semibold text-gray-500 shadow-sm backdrop-blur transition hover:bg-red-50 hover:text-red-500 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            Sign out
          </button>
        </motion.div>
      </nav>

      {/* Background mesh */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_#ede9fe_0%,_#f0f9ff_40%,_#f8fafc_100%)] transition-colors duration-500 dark:bg-[radial-gradient(ellipse_at_top_left,_#1e1b4b_0%,_#0f172a_50%,_#020617_100%)]" />

      <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">

          {/* ── Page title row ── */}
          <motion.div
            className="mb-10 flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                My Tasks
              </h1>
              <p className="mt-0.5 text-sm text-gray-400 dark:text-gray-500">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </motion.div>

          {/* ── Stat cards ── */}
          <div className="mb-8 grid grid-cols-3 gap-4">
            <StatCard label="Total"     value={total}     icon="📋" delay={0.05} />
            <StatCard label="Completed" value={completed} icon="✅" delay={0.12} />
            <StatCard label="Pending"   value={pending}   icon="⏳" delay={0.19} />
          </div>

          {/* ── Add task row ── */}
          <motion.div
            className="mb-6 flex flex-col gap-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            <div className="flex gap-2">
              <Input
                placeholder="New task title…"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                className="flex-1 rounded-xl border-gray-200/60 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-white/5"
              />
              <Input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-40 rounded-xl border-gray-200/60 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-white/5"
              />
              <button
                onClick={handleAddTask}
                className="rounded-xl bg-violet-600 px-4 font-semibold text-white shadow transition hover:bg-violet-700 active:scale-95"
              >
                + Add
              </button>
            </div>
            <Input
              placeholder="Description (optional)…"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="rounded-xl border-gray-200/60 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-white/5"
            />
          </motion.div>

          {/* ── Search ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-4"
          >
            <Input
              placeholder="Search tasks…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="rounded-xl border-gray-200/60 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-white/5"
            />
          </motion.div>

          {/* ── Filter pills ── */}
          <motion.div
            className="mb-6 flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            {(['all', 'pending', 'completed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-all
                  ${filter === f
                    ? 'bg-violet-600 text-white shadow'
                    : 'bg-white/70 text-gray-500 hover:bg-white dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
                  }`}
              >
                {f}
              </button>
            ))}
          </motion.div>

          {/* ── Task list ── */}
          <AnimatePresence mode="popLayout">
            {tasks.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center text-sm text-gray-400"
              >
                No tasks here. Add one above ↑
              </motion.p>
            ) : (
              tasks.map((task, index) => {
                const token = ACCENT_TOKENS[index % ACCENT_TOKENS.length];
                const isDone = task.status === 'completed';

                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -24, scale: 0.96 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -2, transition: { duration: 0.18 } }}
                    className={`mb-3 flex items-center justify-between rounded-2xl border border-l-4 border-gray-200/40 bg-white/75 p-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5 ${token.border}`}
                  >
                    {/* Left: checkbox + info */}
                    <div className="flex min-w-0 items-center gap-3">
                      <button
                        onClick={() => handleToggle(task)}
                        aria-label="Toggle completion"
                        className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded-md border-2 transition-all ${
                          isDone
                            ? 'border-violet-500 bg-violet-500'
                            : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-transparent'
                        }`}
                      >
                        {isDone && (
                          <motion.svg
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            viewBox="0 0 10 8"
                            className="h-3 w-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M1 4l3 3 5-6" />
                          </motion.svg>
                        )}
                      </button>

                      <div className="min-w-0">
                        <p className={`truncate font-semibold transition-colors ${
                          isDone ? 'text-gray-400 line-through dark:text-gray-600' : 'text-gray-800 dark:text-white'
                        }`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="truncate text-xs text-gray-400 dark:text-gray-500 mt-0.5">{task.description}</p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500">Due {task.dueDate}</p>
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="ml-4 flex flex-shrink-0 gap-2">
                      <button
                        onClick={() => handleEdit(task)}
                        className="rounded-lg border border-gray-200/70 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50 active:scale-95 dark:border-white/10 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(task.id, task.title)}
                        className="rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-500 transition hover:bg-rose-500/20 active:scale-95 dark:bg-rose-500/20 dark:text-rose-400"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* ── Edit dialog ── */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="rounded-2xl border border-gray-200/60 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/90">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-gray-900 dark:text-white">Edit Task</DialogTitle>
          </DialogHeader>
          <Input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveEdit()}
            className="mb-4 rounded-xl border-gray-200/60 bg-white/80 dark:border-white/10 dark:bg-white/5"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditingTask(null)}
              className="rounded-xl border border-gray-200/60 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-violet-700 active:scale-95"
            >
              Save changes
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </>
  );
}
