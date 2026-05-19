import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, StatCard, SectionHeader } from "@/components/workspace/ui-bits";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { seedWorkouts, type Workout } from "@/lib/workspace-data";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/gym")({
  component: GymPage,
  head: () => ({ meta: [{ title: "Gym — Atlas" }, { name: "description", content: "Workouts, weight progress, consistency." }] }),
});

const uid = () => Math.random().toString(36).slice(2, 10);
const splits = ["Push", "Pull", "Legs", "Upper", "Lower", "Full body"];

function GymPage() {
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>("ws.gym", seedWorkouts);
  const [split, setSplit] = useState("Push");
  const [notes, setNotes] = useState("");
  const [weight, setWeight] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    setWorkouts([{ id: uid(), date: today, split, notes, weight: weight ? Number(weight) : undefined }, ...workouts]);
    setNotes(""); setWeight("");
  };

  const streak = (() => {
    const set = new Set(workouts.map((w) => w.date));
    let s = 0;
    const d = new Date();
    while (set.has(d.toISOString().slice(0, 10))) { s++; d.setDate(d.getDate() - 1); }
    return s;
  })();

  const last30 = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    const iso = d.toISOString().slice(0, 10);
    return { iso, did: workouts.some((w) => w.date === iso) };
  });

  const weights = workouts.filter((w) => w.weight).slice(0, 12).reverse();

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader title="Gym" subtitle="Consistency · weight · split" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Current streak" value={`${streak}d`} hint="Don't break the chain" />
        <StatCard label="This month" value={workouts.filter((w) => w.date.startsWith(new Date().toISOString().slice(0, 7))).length} hint="sessions logged" />
        <StatCard label="Latest weight" value={weights.at(-1)?.weight?.toFixed(1) ?? "—"} hint="kg" />
        <StatCard label="Total logged" value={workouts.length} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <GlassCard className="lg:col-span-2">
          <h3 className="text-sm font-medium mb-3">Last 30 days</h3>
          <div className="grid grid-cols-30 gap-1.5" style={{ gridTemplateColumns: "repeat(30, minmax(0, 1fr))" }}>
            {last30.map((d) => (
              <div key={d.iso} title={d.iso} className={`aspect-square rounded ${d.did ? "bg-primary/80" : "bg-white/[0.04]"}`} />
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-sm font-medium mb-3">Weight progress</h3>
          <Sparkline values={weights.map((w) => w.weight!)} />
          <div className="mt-2 text-xs text-muted-foreground">Last {weights.length} entries</div>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-4">
        <GlassCard>
          <h3 className="text-sm font-medium mb-3">Log workout</h3>
          <form onSubmit={add} className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Split</label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {splits.map((s) => (
                  <button key={s} type="button" onClick={() => setSplit(s)} className={`text-xs px-2.5 py-1 rounded-full border ${split === s ? "bg-primary/15 text-primary border-primary/30" : "bg-secondary/60 text-muted-foreground border-border"}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Weight (kg, optional)</label>
              <input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" step="0.1" className="w-full mt-1 bg-secondary/40 rounded-lg px-3 py-2 text-sm outline-none border border-border focus:border-primary/40" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full mt-1 bg-secondary/40 rounded-lg px-3 py-2 text-sm outline-none border border-border focus:border-primary/40 resize-none" />
            </div>
            <button className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm flex items-center justify-center gap-1.5 hover:opacity-90"><Plus className="size-4" /> Log session</button>
          </form>
        </GlassCard>

        <GlassCard>
          <h3 className="text-sm font-medium mb-3">Recent sessions</h3>
          <ul className="space-y-1.5 max-h-[400px] overflow-y-auto scrollbar-thin -mr-2 pr-2">
            {workouts.map((w) => (
              <li key={w.id} className="group flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition">
                <div className="size-9 rounded-lg bg-gradient-to-br from-primary/30 to-chart-4/30 grid place-items-center text-[10px] font-semibold tracking-wider">{w.split.slice(0, 2).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">{w.split}{w.weight ? ` · ${w.weight.toFixed(1)}kg` : ""}</div>
                  <div className="text-[11px] text-muted-foreground">{w.date} · {w.notes || "—"}</div>
                </div>
                <button onClick={() => setWorkouts(workouts.filter((x) => x.id !== w.id))} className="opacity-0 group-hover:opacity-100 transition"><Trash2 className="size-3.5 text-muted-foreground" /></button>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (!values.length) return <div className="text-xs text-muted-foreground">No data yet</div>;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1 || 1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-24">
      <defs>
        <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.78 0.13 200)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="oklch(0.78 0.13 200)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,100 ${pts} 100,100`} fill="url(#spark)" />
      <polyline points={pts} fill="none" stroke="oklch(0.78 0.13 200)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
