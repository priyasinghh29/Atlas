import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, StatCard, ProgressBar, SectionHeader } from "@/components/workspace/ui-bits";
import { seedProgress } from "@/lib/workspace-data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ExternalLink, Github, Youtube, FileText, Plus, Minus } from "lucide-react";

export const Route = createFileRoute("/development")({
  component: DevPage,
  head: () => ({ meta: [{ title: "Development — Atlas" }, { name: "description", content: "Projects, stacks, and hours shipped." }] }),
});

function DevPage() {
  const [hours, setHours] = useLocalStorage("ws.dev.hours", seedProgress.dev.hoursToday);
  const [projects, setProjects] = useLocalStorage("ws.dev.projects", seedProgress.dev.projects);
  const goal = seedProgress.dev.hoursGoal;

  const setPct = (i: number, delta: number) =>
    setProjects(projects.map((p, idx) => idx === i ? { ...p, pct: Math.max(0, Math.min(100, p.pct + delta)) } : p));

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader title="Development" subtitle="Stacks · projects · deep work" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Hours today" value={hours.toFixed(1)} hint={`Goal ${goal}h`} />
        <StatCard label="Active projects" value={projects.length} />
        <StatCard label="Avg completion" value={`${Math.round(projects.reduce((a, p) => a + p.pct, 0) / projects.length)}%`} />
        <StatCard label="Stacks" value={seedProgress.dev.stacks.length} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Today's deep work</h3>
            <div className="flex items-center gap-1">
              <button onClick={() => setHours(Math.max(0, hours - 0.5))} className="size-7 rounded-md bg-secondary/60 hover:bg-secondary grid place-items-center"><Minus className="size-3" /></button>
              <span className="w-14 text-center text-sm tabular-nums">{hours.toFixed(1)}h</span>
              <button onClick={() => setHours(hours + 0.5)} className="size-7 rounded-md bg-secondary/60 hover:bg-secondary grid place-items-center"><Plus className="size-3" /></button>
            </div>
          </div>
          <ProgressBar value={Math.min(100, (hours / goal) * 100)} />
          <p className="text-xs text-muted-foreground mt-3">Aim for {goal} focused hours — quality over duration.</p>
        </GlassCard>

        <GlassCard>
          <h3 className="text-sm font-medium mb-3">Stacks</h3>
          <div className="flex flex-wrap gap-2">
            {seedProgress.dev.stacks.map((s) => (
              <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-secondary/60 border border-border">{s}</span>
            ))}
          </div>
        </GlassCard>
      </div>

      <SectionHeader title="Projects" />
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {projects.map((p, i) => (
          <GlassCard key={p.name} delay={0.05 * i}>
            <div className="text-sm font-medium">{p.name}</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">{p.status}</div>
            <div className="mt-4 text-3xl font-semibold tabular-nums">{p.pct}%</div>
            <div className="mt-3"><ProgressBar value={p.pct} /></div>
            <div className="mt-3 flex gap-1">
              <button onClick={() => setPct(i, -5)} className="flex-1 text-xs py-1.5 rounded-md bg-secondary/60 hover:bg-secondary">−5</button>
              <button onClick={() => setPct(i, +5)} className="flex-1 text-xs py-1.5 rounded-md bg-secondary/60 hover:bg-secondary">+5</button>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {[
          { title: "Frontend", items: ["React · TanStack Router", "Tailwind · shadcn", "Framer Motion"] },
          { title: "Backend", items: ["Node · TypeScript", "Postgres · Drizzle", "tRPC"] },
          { title: "DevOps", items: ["Docker", "GitHub Actions", "Cloudflare Workers"] },
        ].map((g) => (
          <GlassCard key={g.title}>
            <h3 className="text-sm font-medium mb-3">{g.title}</h3>
            <ul className="space-y-1.5">
              {g.items.map((i) => <li key={i} className="text-sm text-muted-foreground">{i}</li>)}
            </ul>
          </GlassCard>
        ))}
      </div>

      <SectionHeader title="Resources" />
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { name: "GitHub", href: "https://github.com", icon: Github },
          { name: "YouTube playlists", href: "https://youtube.com", icon: Youtube },
          { name: "MDN docs", href: "https://developer.mozilla.org", icon: FileText },
        ].map((l) => {
          const Icon = l.icon;
          return (
            <a key={l.name} href={l.href} target="_blank" rel="noreferrer" className="glass rounded-2xl p-4 hover:bg-white/[0.06] transition flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2"><Icon className="size-4" /> {l.name}</span>
              <ExternalLink className="size-4 text-muted-foreground" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
