import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, ProgressBar, SectionHeader } from "@/components/workspace/ui-bits";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { seedProgress } from "@/lib/workspace-data";
import { Plus, Minus } from "lucide-react";

export const Route = createFileRoute("/subjects")({
  component: SubjectsPage,
  head: () => ({ meta: [{ title: "Core CS — Atlas" }, { name: "description", content: "OOPS, DBMS, OS, CN, System Design." }] }),
});

function SubjectsPage() {
  const [subjects, setSubjects] = useLocalStorage("ws.subjects", seedProgress.subjects);
  const [notes, setNotes] = useLocalStorage<Record<string, string>>("ws.subjects.notes", {});

  const bump = (i: number, d: number) =>
    setSubjects(subjects.map((s, idx) => idx === i ? { ...s, pct: Math.max(0, Math.min(100, s.pct + d)) } : s));

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader title="Core CS Subjects" subtitle="The fundamentals that compound" />

      <div className="grid md:grid-cols-2 gap-4">
        {subjects.map((s, i) => (
          <GlassCard key={s.name} delay={0.05 * i}>
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{s.name}</h3>
              <div className="flex items-center gap-1">
                <button onClick={() => bump(i, -5)} className="size-7 rounded-md bg-secondary/60 hover:bg-secondary grid place-items-center"><Minus className="size-3" /></button>
                <span className="w-12 text-center text-sm tabular-nums">{s.pct}%</span>
                <button onClick={() => bump(i, +5)} className="size-7 rounded-md bg-secondary/60 hover:bg-secondary grid place-items-center"><Plus className="size-3" /></button>
              </div>
            </div>
            <div className="mt-3"><ProgressBar value={s.pct} /></div>
            <textarea
              value={notes[s.name] ?? ""}
              onChange={(e) => setNotes({ ...notes, [s.name]: e.target.value })}
              placeholder="Notes, topics completed, revision status…"
              className="mt-4 w-full bg-secondary/30 rounded-lg p-3 text-sm outline-none resize-none border border-border focus:border-primary/40 transition"
              rows={3}
            />
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
