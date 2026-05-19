import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, SectionHeader } from "@/components/workspace/ui-bits";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { seedInternship, type InternshipItem } from "@/lib/workspace-data";
import { Plus, Bug, Wrench, Sparkles, X } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/internship")({
  component: InternshipPage,
  head: () => ({ meta: [{ title: "Internship — Atlas" }, { name: "description", content: "Internship tasks, bugs, features, deadlines." }] }),
});

const columns: { key: InternshipItem["status"]; label: string }[] = [
  { key: "todo", label: "To do" },
  { key: "doing", label: "In progress" },
  { key: "review", label: "In review" },
  { key: "done", label: "Done" },
];

const kindIcon = { task: Wrench, bug: Bug, feature: Sparkles } as const;

function InternshipPage() {
  const [items, setItems] = useLocalStorage<InternshipItem[]>("ws.internship", seedInternship);
  const [goals, setGoals] = useLocalStorage("ws.internship.goals", "Ship dashboard refactor · Land 2 PRs · Pair with senior on caching");
  const [meeting, setMeeting] = useLocalStorage("ws.internship.meeting", "## Standup\n- Working on dashboard widgets\n- Blocked on design tokens\n- Will pair with Sam at 3pm");
  const [newItem, setNewItem] = useState("");

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setItems([{ id: Math.random().toString(36).slice(2, 10), title: newItem.trim(), status: "todo", kind: "task" }, ...items]);
    setNewItem("");
  };

  const move = (id: string, dir: 1 | -1) => {
    setItems(items.map((it) => {
      if (it.id !== id) return it;
      const order = columns.map((c) => c.key);
      const i = order.indexOf(it.status);
      const next = order[Math.max(0, Math.min(order.length - 1, i + dir))];
      return { ...it, status: next };
    }));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader title="Internship workspace" subtitle="Ship the work · note the wins" />

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <GlassCard>
          <h3 className="text-sm font-medium mb-2">Weekly goals</h3>
          <textarea value={goals} onChange={(e) => setGoals(e.target.value)} rows={3} className="w-full bg-secondary/30 rounded-lg p-3 text-sm outline-none border border-border focus:border-primary/40 resize-none" />
        </GlassCard>
        <GlassCard>
          <h3 className="text-sm font-medium mb-2">Meeting notes</h3>
          <textarea value={meeting} onChange={(e) => setMeeting(e.target.value)} rows={3} className="w-full bg-secondary/30 rounded-lg p-3 text-sm font-mono outline-none border border-border focus:border-primary/40 resize-none" />
        </GlassCard>
      </div>

      <form onSubmit={add} className="flex gap-2 mb-4">
        <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Add task, bug, or feature…" className="flex-1 bg-secondary/40 rounded-xl px-4 py-2.5 text-sm outline-none border border-border focus:border-primary/40" />
        <button className="px-4 rounded-xl bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5 text-sm"><Plus className="size-4" /> Add</button>
      </form>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const list = items.filter((i) => i.status === col.key);
          return (
            <GlassCard key={col.key} className="min-h-[280px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">{col.label}</h3>
                <span className="text-[11px] text-muted-foreground tabular-nums">{list.length}</span>
              </div>
              <ul className="space-y-2">
                {list.map((it) => {
                  const Icon = kindIcon[it.kind];
                  return (
                    <li key={it.id} className="group bg-secondary/40 border border-border rounded-xl p-3 hover:bg-secondary/60 transition">
                      <div className="flex items-start gap-2">
                        <Icon className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm">{it.title}</div>
                          {it.due && <div className="text-[10px] text-muted-foreground mt-1">Due {it.due}</div>}
                        </div>
                        <button onClick={() => setItems(items.filter((x) => x.id !== it.id))} className="opacity-0 group-hover:opacity-100 transition"><X className="size-3 text-muted-foreground" /></button>
                      </div>
                      <div className="flex gap-1 mt-2">
                        <button onClick={() => move(it.id, -1)} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/60 hover:bg-secondary text-muted-foreground">←</button>
                        <button onClick={() => move(it.id, 1)} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/60 hover:bg-secondary text-muted-foreground">→</button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
