import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, SectionHeader, ProgressBar } from "@/components/workspace/ui-bits";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { seedTasks, type Task, type Priority } from "@/lib/workspace-data";
import { Plus, Check, X, GripVertical } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
  head: () => ({ meta: [{ title: "Tasks — Atlas" }, { name: "description", content: "Daily, weekly, monthly, and quarterly goals." }] }),
});

const scopes: { key: Task["scope"]; label: string; sub: string }[] = [
  { key: "today", label: "Today", sub: "Just for today" },
  { key: "week", label: "This week", sub: "Weekly goals" },
  { key: "month", label: "This month", sub: "Monthly goals" },
  { key: "quarter", label: "3-month", sub: "Quarter goals" },
];

const priColor: Record<Priority, string> = {
  high: "bg-destructive/20 text-destructive border-destructive/30",
  med: "bg-warning/15 text-warning border-warning/30",
  low: "bg-secondary/60 text-muted-foreground border-border",
};

function TasksPage() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("ws.tasks", seedTasks);
  const [draft, setDraft] = useState<Record<Task["scope"], string>>({ today: "", week: "", month: "", quarter: "" });
  const [dragId, setDragId] = useState<string | null>(null);

  const add = (scope: Task["scope"]) => {
    const t = draft[scope].trim();
    if (!t) return;
    setTasks([{ id: Math.random().toString(36).slice(2, 10), title: t, done: false, priority: "med", scope, createdAt: Date.now() }, ...tasks]);
    setDraft({ ...draft, [scope]: "" });
  };

  const toggle = (id: string) => setTasks(tasks.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id: string) => setTasks(tasks.filter((t) => t.id !== id));
  const cyclePriority = (id: string) => setTasks(tasks.map((t) => {
    if (t.id !== id) return t;
    const order: Priority[] = ["low", "med", "high"];
    return { ...t, priority: order[(order.indexOf(t.priority) + 1) % order.length] };
  }));

  const onDrop = (scope: Task["scope"], targetId: string | null) => {
    if (!dragId) return;
    const src = tasks.find((t) => t.id === dragId);
    if (!src) return;
    const rest = tasks.filter((t) => t.id !== dragId);
    const updated: Task = { ...src, scope };
    if (!targetId) {
      setTasks([...rest, updated]);
    } else {
      const idx = rest.findIndex((t) => t.id === targetId);
      rest.splice(idx, 0, updated);
      setTasks(rest);
    }
    setDragId(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader title="Tasks" subtitle="Drag between columns · click priority to cycle" />

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {scopes.map((s) => {
          const list = tasks.filter((t) => t.scope === s.key);
          const done = list.filter((t) => t.done).length;
          return (
            <div
              key={s.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(s.key, null)}
            >
            <GlassCard className="min-h-[400px] flex flex-col">
              <div className="flex items-end justify-between mb-1">
                <h3 className="font-medium">{s.label}</h3>
                <span className="text-[11px] text-muted-foreground tabular-nums">{done}/{list.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
              <div className="my-3"><ProgressBar value={list.length ? (done / list.length) * 100 : 0} /></div>

              <ul className="space-y-1.5 flex-1">
                {list.map((t) => (
                  <li
                    key={t.id}
                    draggable
                    onDragStart={() => setDragId(t.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.stopPropagation(); onDrop(s.key, t.id); }}
                    className="group flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-white/5 transition"
                  >
                    <GripVertical className="size-3.5 text-muted-foreground/40 mt-1 cursor-grab" />
                    <button onClick={() => toggle(t.id)} className={`size-4 rounded-md border mt-0.5 grid place-items-center transition shrink-0 ${t.done ? "bg-primary border-primary" : "border-border"}`}>
                      {t.done && <Check className="size-3 text-primary-foreground" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.title}</div>
                      <div className="flex gap-1 mt-1">
                        <button onClick={() => cyclePriority(t.id)} className={`text-[10px] px-1.5 py-0.5 rounded border ${priColor[t.priority]}`}>{t.priority}</button>
                        {t.tag && <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground border border-border">{t.tag}</span>}
                      </div>
                    </div>
                    <button onClick={() => remove(t.id)} className="opacity-0 group-hover:opacity-100 transition"><X className="size-3 text-muted-foreground" /></button>
                  </li>
                ))}
              </ul>

              <form onSubmit={(e) => { e.preventDefault(); add(s.key); }} className="mt-3 flex gap-2">
                <input
                  value={draft[s.key]}
                  onChange={(e) => setDraft({ ...draft, [s.key]: e.target.value })}
                  placeholder="Add task…"
                  className="flex-1 bg-secondary/40 rounded-lg px-3 py-1.5 text-sm outline-none border border-border focus:border-primary/40"
                />
                <button className="size-8 rounded-lg bg-primary text-primary-foreground grid place-items-center hover:opacity-90"><Plus className="size-4" /></button>
              </form>
            </GlassCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}
