import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Play, Pause, RotateCcw, X, Maximize2 } from "lucide-react";

export const Route = createFileRoute("/focus")({
  component: FocusPage,
  head: () => ({ meta: [{ title: "Focus — Atlas" }, { name: "description", content: "Pomodoro deep work, distraction-free." }] }),
});

type Mode = "focus" | "short" | "long";
const durations: Record<Mode, number> = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
const labels: Record<Mode, string> = { focus: "Focus", short: "Short break", long: "Long break" };

function FocusPage() {
  const [mode, setMode] = useState<Mode>("focus");
  const [remaining, setRemaining] = useState(durations.focus);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useLocalStorage("ws.focus.sessions", 0);
  const [intent, setIntent] = useLocalStorage("ws.focus.intent", "Deep work on the hardest problem first.");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setRemaining(durations[mode]); }, [mode]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          if (mode === "focus") setSessions((s) => s + 1);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, mode, setSessions]);

  const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");
  const pct = 1 - remaining / durations[mode];

  const reset = () => { setRemaining(durations[mode]); setRunning(false); };
  const fullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Ambient gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 30% 30%, oklch(0.4 0.18 260 / 0.4), transparent 60%), radial-gradient(ellipse at 70% 70%, oklch(0.45 0.18 320 / 0.3), transparent 60%)",
        }} />
        <motion.div
          animate={{ opacity: running ? [0.5, 0.8, 0.5] : 0.4 }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 50%, oklch(0.78 0.13 200 / 0.15), transparent 70%)" }}
        />
      </div>

      <header className="flex items-center justify-between p-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"><X className="size-4" /> Exit focus</Link>
        <button onClick={fullscreen} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"><Maximize2 className="size-4" /> Fullscreen</button>
      </header>

      <div className="flex-1 grid place-items-center px-6">
        <div className="text-center w-full max-w-2xl">
          <div className="flex justify-center gap-1.5 mb-12">
            {(Object.keys(durations) as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${mode === m ? "bg-primary/15 text-primary border-primary/30" : "bg-secondary/40 text-muted-foreground border-border hover:text-foreground"}`}
              >
                {labels[m]}
              </button>
            ))}
          </div>

          <div className="relative size-72 md:size-96 mx-auto">
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
              <circle cx="50" cy="50" r="46" fill="none" stroke="oklch(1 0 0 / 0.06)" strokeWidth="1" />
              <motion.circle
                cx="50" cy="50" r="46" fill="none"
                stroke="url(#focusGrad)" strokeWidth="1.5" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 46}
                animate={{ strokeDashoffset: 2 * Math.PI * 46 * (1 - pct) }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="focusGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.13 200)" />
                  <stop offset="100%" stopColor="oklch(0.7 0.15 310)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">{labels[mode]}</div>
                <div className="text-7xl md:text-8xl font-light tabular-nums tracking-tight">
                  {mins}<span className="text-muted-foreground/60">:</span>{secs}
                </div>
                <AnimatePresence>
                  {sessions > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted-foreground mt-3">
                      {sessions} session{sessions > 1 ? "s" : ""} today
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-12">
            <button
              onClick={() => setRunning((r) => !r)}
              className="size-14 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-glow hover:scale-105 transition"
            >
              {running ? <Pause className="size-5" /> : <Play className="size-5 translate-x-0.5" />}
            </button>
            <button onClick={reset} className="size-14 rounded-full glass-strong grid place-items-center hover:bg-white/10 transition">
              <RotateCcw className="size-4" />
            </button>
          </div>

          <input
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="What's the intention for this session?"
            className="mt-12 w-full max-w-md mx-auto block text-center bg-transparent text-sm text-muted-foreground outline-none placeholder:text-muted-foreground/50"
          />
        </div>
      </div>
    </div>
  );
}
