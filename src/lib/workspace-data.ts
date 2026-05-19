// Mock initial data + types for the workspace app.
// All persisted via localStorage by individual hooks.

export type Priority = "low" | "med" | "high";

export interface Task {
  id: string;
  title: string;
  done: boolean;
  priority: Priority;
  scope: "today" | "week" | "month" | "quarter";
  tag?: string;
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  tag: string;
  updatedAt: number;
}

export interface Workout {
  id: string;
  date: string; // YYYY-MM-DD
  split: string;
  notes: string;
  weight?: number;
}

export interface InternshipItem {
  id: string;
  title: string;
  status: "todo" | "doing" | "review" | "done";
  kind: "task" | "bug" | "feature";
  due?: string;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const dayOffset = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return iso(d);
};

export const seedTasks: Task[] = [
  { id: uid(), title: "Solve 3 LeetCode mediums", done: false, priority: "high", scope: "today", tag: "DSA", createdAt: Date.now() },
  { id: uid(), title: "Ship dashboard UI for internship", done: false, priority: "high", scope: "today", tag: "Intern", createdAt: Date.now() },
  { id: uid(), title: "Read OS — Process Synchronization", done: true, priority: "med", scope: "today", tag: "Core", createdAt: Date.now() },
  { id: uid(), title: "Gym — Push day", done: false, priority: "med", scope: "today", tag: "Gym", createdAt: Date.now() },
  { id: uid(), title: "Finish Striver SDE Sheet — Arrays", done: false, priority: "high", scope: "week", tag: "DSA", createdAt: Date.now() },
  { id: uid(), title: "Deploy portfolio v2", done: false, priority: "med", scope: "week", tag: "Dev", createdAt: Date.now() },
  { id: uid(), title: "Complete ML — Regression module", done: false, priority: "med", scope: "month", tag: "ML", createdAt: Date.now() },
  { id: uid(), title: "Reach 1600 on Codeforces", done: false, priority: "high", scope: "quarter", tag: "DSA", createdAt: Date.now() },
];

export const seedNotes: Note[] = [
  {
    id: uid(),
    title: "React — useEffect mental model",
    tag: "Dev",
    body: "# useEffect\n\nThink in terms of **synchronization**, not lifecycle.\n\n- Effects describe how to sync external systems to state.\n- Dependencies are *inputs*, not triggers.",
    updatedAt: Date.now() - 86400000,
  },
  {
    id: uid(),
    title: "DSA — Sliding window patterns",
    tag: "DSA",
    body: "## Sliding window\n\n1. Fixed-size window\n2. Variable-size with constraint\n3. Two-pointer hybrid\n\nKey: maintain invariant while expanding right, shrinking left.",
    updatedAt: Date.now() - 2 * 86400000,
  },
  {
    id: uid(),
    title: "Internship — Standup notes",
    tag: "Intern",
    body: "## Today\n- Reviewed PR #42\n- Discussed caching strategy\n\n## Blockers\n- Waiting on design tokens",
    updatedAt: Date.now() - 3 * 86400000,
  },
  {
    id: uid(),
    title: "ML — Bias / variance tradeoff",
    tag: "ML",
    body: "**High bias** → underfitting (simple model)\n**High variance** → overfitting (complex model)\n\nGoal: minimize total error = bias² + variance + noise.",
    updatedAt: Date.now() - 5 * 86400000,
  },
];

export const seedWorkouts: Workout[] = Array.from({ length: 12 }).map((_, i) => ({
  id: uid(),
  date: dayOffset(-i * 2),
  split: ["Push", "Pull", "Legs", "Upper", "Lower"][i % 5],
  notes: "Felt strong. Bumped up DB press by 2.5kg.",
  weight: 72 + Math.sin(i / 2) * 0.6,
}));

export const seedInternship: InternshipItem[] = [
  { id: uid(), title: "Refactor dashboard widgets", status: "doing", kind: "task", due: dayOffset(2) },
  { id: uid(), title: "Fix off-by-one in pagination", status: "review", kind: "bug" },
  { id: uid(), title: "Add CSV export to reports", status: "todo", kind: "feature", due: dayOffset(5) },
  { id: uid(), title: "Write Storybook for Button", status: "done", kind: "task" },
  { id: uid(), title: "Investigate Sentry spike", status: "todo", kind: "bug", due: dayOffset(1) },
];

// Tracker progress (manually edited or persisted)
export const seedProgress = {
  dsa: { leetcode: 187, leetcodeGoal: 500, striver: 92, striverGoal: 191, cfRating: 1487, contests: 14, today: 2, weak: ["Graphs", "DP on Trees"] },
  dev: { hoursToday: 3.2, hoursGoal: 5, stacks: ["React", "TanStack", "Node", "Postgres", "Tailwind"], projects: [
    { name: "Personal OS", status: "in progress", pct: 62 },
    { name: "Portfolio v2", status: "polishing", pct: 88 },
    { name: "Realtime chat", status: "planning", pct: 12 },
  ]},
  ml: { roadmap: 34, algorithms: ["Linear Reg", "Logistic Reg", "Decision Trees", "KNN", "K-Means"], projects: [
    { name: "Spam classifier", pct: 100 },
    { name: "Movie recommender", pct: 55 },
  ]},
  subjects: [
    { name: "OOPS", pct: 78 },
    { name: "DBMS", pct: 64 },
    { name: "Operating Systems", pct: 52 },
    { name: "Computer Networks", pct: 41 },
    { name: "System Design", pct: 22 },
  ],
  gym: { streak: 9, weekTarget: 5, weekDone: 4 },
  streak: 23,
};

// Heatmap: last 16 weeks (rows = day-of-week 0-6, cols = week)
export function generateHeatmap(seed = 42) {
  const weeks = 16;
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: 7 }).map(() =>
    Array.from({ length: weeks }).map(() => {
      const v = rand();
      if (v < 0.35) return 0;
      if (v < 0.6) return 1;
      if (v < 0.8) return 2;
      if (v < 0.93) return 3;
      return 4;
    })
  );
}

export const motivationalQuotes = [
  "Small reps, every day. That's the whole secret.",
  "You are one focused session away from progress.",
  "Discipline is choosing the future you want.",
  "Build quietly. Let the work speak.",
  "Today's effort is tomorrow's edge.",
];

export function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Late night, focused mind";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Winding down";
}
