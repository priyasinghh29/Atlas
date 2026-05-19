import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, StatCard, ProgressBar, SectionHeader } from "@/components/workspace/ui-bits";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { seedProgress } from "@/lib/workspace-data";
import { Plus, X } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/ml")({
  component: MLPage,
  head: () => ({ meta: [{ title: "Machine Learning — Atlas" }, { name: "description", content: "ML roadmap, algorithms, projects, datasets." }] }),
});

function MLPage() {
  const [roadmap, setRoadmap] = useLocalStorage("ws.ml.roadmap", seedProgress.ml.roadmap);
  const [algos, setAlgos] = useLocalStorage<string[]>("ws.ml.algos", seedProgress.ml.algorithms);
  const [ideas, setIdeas] = useLocalStorage<string[]>("ws.ml.ideas", ["Re-implement Transformer from scratch", "Replicate ResNet on CIFAR-10"]);
  const [datasets, setDatasets] = useLocalStorage<string[]>("ws.ml.datasets", ["MNIST", "CIFAR-10", "IMDB reviews"]);
  const [projects, setProjects] = useLocalStorage("ws.ml.projects", seedProgress.ml.projects);

  const [newAlgo, setNewAlgo] = useState("");
  const [newIdea, setNewIdea] = useState("");

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader title="Machine Learning" subtitle="Roadmap · algorithms · research" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Roadmap" value={`${roadmap}%`} />
        <StatCard label="Algorithms" value={algos.length} />
        <StatCard label="Projects" value={projects.length} />
        <StatCard label="Datasets" value={datasets.length} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <GlassCard className="lg:col-span-2">
          <h3 className="text-sm font-medium mb-3">Roadmap progress</h3>
          <ProgressBar value={roadmap} />
          <input
            type="range"
            min={0}
            max={100}
            value={roadmap}
            onChange={(e) => setRoadmap(Number(e.target.value))}
            className="w-full mt-4 accent-primary"
          />
        </GlassCard>
        <GlassCard>
          <h3 className="text-sm font-medium mb-3">Projects</h3>
          <ul className="space-y-3">
            {projects.map((p, i) => (
              <li key={p.name}>
                <div className="flex justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="text-muted-foreground tabular-nums">{p.pct}%</span>
                </div>
                <ProgressBar value={p.pct} />
                <input type="range" min={0} max={100} value={p.pct} onChange={(e) => setProjects(projects.map((x, idx) => idx === i ? { ...x, pct: Number(e.target.value) } : x))} className="w-full mt-1 accent-primary" />
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <TagList title="Algorithms learned" items={algos} setItems={setAlgos} value={newAlgo} setValue={setNewAlgo} placeholder="e.g. SVM" />
        <TagList title="Research ideas" items={ideas} setItems={setIdeas} value={newIdea} setValue={setNewIdea} placeholder="e.g. distillation experiment" />
        <SimpleList title="Datasets explored" items={datasets} setItems={setDatasets} placeholder="e.g. Fashion-MNIST" />
      </div>
    </div>
  );
}

function TagList({ title, items, setItems, value, setValue, placeholder }: { title: string; items: string[]; setItems: (s: string[]) => void; value: string; setValue: (s: string) => void; placeholder: string }) {
  return (
    <GlassCard>
      <h3 className="text-sm font-medium mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.map((it, i) => (
          <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-secondary/60 border border-border flex items-center gap-1">
            {it}
            <button onClick={() => setItems(items.filter((_, idx) => idx !== i))}><X className="size-3 opacity-60 hover:opacity-100" /></button>
          </span>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (value.trim()) { setItems([...items, value.trim()]); setValue(""); } }} className="flex gap-2">
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} className="flex-1 bg-secondary/40 rounded-lg px-3 py-2 text-sm outline-none border border-border focus:border-primary/40" />
        <button className="size-9 rounded-lg bg-primary text-primary-foreground grid place-items-center hover:opacity-90"><Plus className="size-4" /></button>
      </form>
    </GlassCard>
  );
}

function SimpleList({ title, items, setItems, placeholder }: { title: string; items: string[]; setItems: (s: string[]) => void; placeholder: string }) {
  const [v, setV] = useState("");
  return <TagList title={title} items={items} setItems={setItems} value={v} setValue={setV} placeholder={placeholder} />;
}
