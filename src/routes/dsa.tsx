import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { GlassCard, StatCard, ProgressBar, SectionHeader } from "@/components/workspace/ui-bits";
import { seedProgress, generateHeatmap } from "@/lib/workspace-data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ExternalLink, Plus, Minus } from "lucide-react";

export const Route = createFileRoute("/dsa")({
  component: DSAPage,
  head: () => ({ meta: [{ title: "DSA Tracker — Atlas" }, { name: "description", content: "Track LeetCode, Striver sheet, contests, and weak topics." }] }),
});

const levels = [
  "bg-white/[0.04]",
  "bg-primary/20",
  "bg-primary/40",
  "bg-primary/65",
  "bg-primary/90",
];

function DSAPage() {
  const heatmap = useMemo(() => generateHeatmap(7), []);
  const [solvedToday, setSolvedToday] = useLocalStorage("ws.dsa.solvedToday", seedProgress.dsa.today);
  const [leetcode, setLeetcode] = useLocalStorage("ws.dsa.leetcode", seedProgress.dsa.leetcode);
  const [striver, setStriver] = useLocalStorage("ws.dsa.striver", seedProgress.dsa.striver);
  const [cf, setCf] = useLocalStorage("ws.dsa.cf", seedProgress.dsa.cfRating);

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader title="DSA Tracker" subtitle="LeetCode · Striver · Codeforces" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Solved today" value={solvedToday} hint="Goal 3/day" />
        <StatCard label="LeetCode" value={leetcode} hint={`of ${seedProgress.dsa.leetcodeGoal}`} />
        <StatCard label="Striver sheet" value={`${striver}/${seedProgress.dsa.striverGoal}`} hint={`${Math.round((striver / seedProgress.dsa.striverGoal) * 100)}% done`} />
        <StatCard label="CF rating" value={cf} hint={`${seedProgress.dsa.contests} contests`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <GlassCard className="lg:col-span-2">
          <h3 className="text-sm font-medium mb-4">Consistency · last 16 weeks</h3>
          <div className="flex gap-1 overflow-x-auto scrollbar-thin">
            {heatmap[0].map((_, w) => (
              <div key={w} className="flex flex-col gap-1">
                {heatmap.map((row, d) => (
                  <div key={d} className={`size-3 rounded-sm ${levels[row[w]]}`} title={`Week ${w + 1}, Day ${d + 1}`} />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4 text-[11px] text-muted-foreground">
            Less {levels.map((c, i) => <span key={i} className={`size-3 rounded-sm ${c}`} />)} More
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-sm font-medium mb-3">Quick log</h3>
          <div className="space-y-3">
            {[
              { label: "Solved today", val: solvedToday, set: setSolvedToday },
              { label: "LeetCode total", val: leetcode, set: setLeetcode },
              { label: "Striver done", val: striver, set: setStriver },
              { label: "CF rating", val: cf, set: setCf },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{r.label}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => r.set(Math.max(0, r.val - 1))} className="size-7 rounded-md bg-secondary/60 hover:bg-secondary grid place-items-center"><Minus className="size-3" /></button>
                  <span className="w-12 text-center text-sm tabular-nums">{r.val}</span>
                  <button onClick={() => r.set(r.val + 1)} className="size-7 rounded-md bg-secondary/60 hover:bg-secondary grid place-items-center"><Plus className="size-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <GlassCard>
          <h3 className="text-sm font-medium mb-3">Progress</h3>
          <div className="space-y-4">
            <Row label="LeetCode" value={leetcode} max={seedProgress.dsa.leetcodeGoal} />
            <Row label="Striver SDE" value={striver} max={seedProgress.dsa.striverGoal} />
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-sm font-medium mb-3">Weak topics · revise</h3>
          <div className="flex flex-wrap gap-2">
            {seedProgress.dsa.weak.map((w) => (
              <span key={w} className="text-xs px-2.5 py-1 rounded-full bg-warning/10 text-warning border border-warning/30">{w}</span>
            ))}
            {["Trie", "Segment Tree", "Tarjan's"].map((w) => (
              <span key={w} className="text-xs px-2.5 py-1 rounded-full bg-secondary/60 text-muted-foreground border border-border">{w}</span>
            ))}
          </div>
        </GlassCard>
      </div>

      <SectionHeader title="Quick links" />
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { name: "LeetCode", href: "https://leetcode.com/" },
          { name: "Codeforces", href: "https://codeforces.com/" },
          { name: "Striver SDE Sheet", href: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/" },
        ].map((l) => (
          <a key={l.name} href={l.href} target="_blank" rel="noreferrer" className="glass rounded-2xl p-4 hover:bg-white/[0.06] transition flex items-center justify-between">
            <span className="text-sm font-medium">{l.name}</span>
            <ExternalLink className="size-4 text-muted-foreground" />
          </a>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums">{value} / {max} · {pct}%</span>
      </div>
      <ProgressBar value={pct} />
    </div>
  );
}
