import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.2, 0.7, 0.2, 1] }}
      className={cn(
        "glass rounded-2xl p-5 shadow-soft",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function StatCard({
  label, value, hint, accent,
}: { label: string; value: string | number; hint?: string; accent?: string }) {
  return (
    <GlassCard className="relative overflow-hidden">
      <div className="absolute -top-10 -right-10 size-32 rounded-full opacity-20 blur-2xl"
           style={{ background: accent ?? "var(--gradient-primary)" }} />
      <div className="relative">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
        <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
        {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
      </div>
    </GlassCard>
  );
}

export function ProgressBar({ value, max = 100, accent }: { value: number; max?: number; accent?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="h-1.5 w-full rounded-full bg-secondary/60 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
        className="h-full rounded-full"
        style={{ background: accent ?? "var(--gradient-primary)" }}
      />
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
