import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  seedTasks, seedProgress, seedNotes, motivationalQuotes, greeting,
  type Task, type Note,
} from "@/lib/workspace-data";
import { GlassCard, StatCard, ProgressBar, SectionHeader } from "@/components/workspace/ui-bits";
import {
  Flame, Target, TrendingUp, Clock, ArrowRight, Plus, Check,
  Code2, Cpu, Brain, BookOpen, Briefcase, Dumbbell,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard — Atlas" },
      { name: "description", content: "Your daily focus, streaks, and progress at a glance." },
    ],
  }),
});

function Dashboard() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("ws.tasks", seedTasks);
  const [notes] = useLocalStorage<Note[]>("ws.notes", seedNotes);
  const [focusToday, setFocusToday] = useLocalStorage<string>("ws.focusToday", "Finish 3 DSA problems and ship the dashboard widget.");

  const quote = useMemo(() => motivationalQuotes[new Date().getDate() % motivationalQuotes.length], []);
  const today = tasks.filter((t) => t.scope === "today");
  const todayDone = today.filter((t) => t.done).length;
  const completion = today.length ? Math.round((todayDone / today.length) * 100) : 0;

  const toggle = (id: string) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const trackers = [
    { name: "DSA", icon: Code2, pct: Math.round((seedProgress.dsa.leetcode / seedProgress.dsa.leetcodeGoal) * 100), to: "/dsa", accent: "linear-gradient(135deg, oklch(0.78 0.13 200), oklch(0.7 0.15 260))" },
    { name: "Development", icon: Cpu, pct: 64, to: "/development", accent: "linear-gradient(135deg, oklch(0.72 0.14 155), oklch(0.78 0.13 200))" },
    { name: "Machine Learning", icon: Brain, pct: seedProgress.ml.roadmap, to: "/ml", accent: "linear-gradient(135deg, oklch(0.7 0.15 310), oklch(0.74 0.15 25))" },
    { name: "Core CS", icon: BookOpen, pct: Math.round(seedProgress.subjects.reduce((a, s) => a + s.pct, 0) / seedProgress.subjects.length), to: "/subjects", accent: "linear-gradient(135deg, oklch(0.78 0.14 75), oklch(0.74 0.15 25))" },
    { name: "Internship", icon: Briefcase, pct: 48, to: "/internship", accent: "linear-gradient(135deg, oklch(0.7 0.15 260), oklch(0.7 0.15 310))" },
    { name: "Gym", icon: Dumbbell, pct: Math.round((seedProgress.gym.weekDone / seedProgress.gym.weekTarget) * 100), to: "/gym", accent: "linear-gradient(135deg, oklch(0.72 0.14 155), oklch(0.78 0.14 75))" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="text-xs text-muted-foreground uppercase tracking-widest">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</div>
        <h1 className="mt-2 text-4xl md:text-5xl font-semibold tracking-tight">
          {greeting()}, <span className="text-gradient">builder</span>.
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl">{quote}</p>
      </motion.div>

      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Day streak" value={seedProgress.streak} hint="Keep showing up" />
        <StatCard label="Today's focus" value={`${completion}%`} hint={`${todayDone}/${today.length} tasks done`} />
        <StatCard label="LeetCode" value={seedProgress.dsa.leetcode} hint={`Goal ${seedProgress.dsa.leetcodeGoal}`} />
        <StatCard label="CF rating" value={seedProgress.dsa.cfRating} hint={`${seedProgress.dsa.contests} contests`} />
      </div>

      {/* Focus + tasks */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <GlassCard className="lg:col-span-2" delay={0.05}>
          <div className="flex items-center gap-2 mb-3">
            <Target className="size-4 text-primary" />
            <h3 className="text-sm font-medium">Focus for today</h3>
          </div>
          <textarea
            value={focusToday}
            onChange={(e) => setFocusToday(e.target.value)}
            className="w-full bg-transparent text-lg leading-relaxed resize-none outline-none placeholder:text-muted-foreground"
            rows={2}
            placeholder="What matters most today?"
          />
          <div className="mt-4 flex items-center gap-3">
            <ProgressBar value={completion} />
            <span className="text-xs text-muted-foreground tabular-nums">{completion}%</span>
          </div>
        </GlassCard>

        <GlassCard delay={0.1}>
          <div className="flex items-center gap-2 mb-3">
            <Flame className="size-4 text-warning" />
            <h3 className="text-sm font-medium">Streaks</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Overall", val: seedProgress.streak },
              { label: "Gym", val: seedProgress.gym.streak },
              { label: "Daily DSA", val: 12 },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <span className="text-sm font-medium tabular-nums">{s.val} days</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Tracker grid */}
      <SectionHeader title="Tracks" subtitle="Where your reps go" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {trackers.map((t, i) => {
          const Icon = t.icon;
          return (
            <Link key={t.name} to={t.to} className="group">
              <GlassCard delay={0.04 * i} className="hover:bg-white/[0.06] transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="size-10 rounded-xl grid place-items-center" style={{ background: t.accent }}>
                    <Icon className="size-5 text-primary-foreground" />
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-foreground transition" />
                </div>
                <div className="text-sm text-muted-foreground">{t.name}</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">{t.pct}%</div>
                <div className="mt-3"><ProgressBar value={t.pct} accent={t.accent} /></div>
              </GlassCard>
            </Link>
          );
        })}
      </div>

      {/* Tasks + recent */}
      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium flex items-center gap-2"><Clock className="size-4" /> Tasks due today</h3>
            <Link to="/tasks" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">All tasks <ArrowRight className="size-3" /></Link>
          </div>
          <ul className="space-y-1">
            {today.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => toggle(t.id)}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition group text-left"
                >
                  <span className={`size-4 rounded-md border flex items-center justify-center transition ${t.done ? "bg-primary border-primary" : "border-border"}`}>
                    {t.done && <Check className="size-3 text-primary-foreground" />}
                  </span>
                  <span className={`flex-1 text-sm ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.title}</span>
                  {t.tag && <span className="text-[10px] uppercase tracking-wider text-muted-foreground px-1.5 py-0.5 rounded bg-secondary/60">{t.tag}</span>}
                </button>
              </li>
            ))}
            {today.length === 0 && (
              <li className="text-sm text-muted-foreground px-2 py-6 text-center">
                Nothing scheduled. <Link to="/tasks" className="text-primary hover:underline inline-flex items-center gap-1"><Plus className="size-3" /> Add a task</Link>
              </li>
            )}
          </ul>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium flex items-center gap-2"><TrendingUp className="size-4" /> Recent notes</h3>
            <Link to="/notes" className="text-xs text-muted-foreground hover:text-foreground">All</Link>
          </div>
          <ul className="space-y-2">
            {notes.slice(0, 4).map((n) => (
              <li key={n.id}>
                <Link to="/notes" className="block px-2 py-2 rounded-lg hover:bg-white/5 transition">
                  <div className="text-sm font-medium truncate">{n.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{n.tag} · {new Date(n.updatedAt).toLocaleDateString()}</div>
                </Link>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
