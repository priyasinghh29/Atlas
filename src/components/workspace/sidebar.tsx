import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Code2,
  Brain,
  Cpu,
  Briefcase,
  CheckSquare,
  NotebookPen,
  Dumbbell,
  Timer,
  BookOpen,
  Sparkles,
  Command,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dsa", label: "DSA", icon: Code2 },
  { to: "/development", label: "Development", icon: Cpu },
  { to: "/subjects", label: "Core CS", icon: BookOpen },
  { to: "/ml", label: "Machine Learning", icon: Brain },
  { to: "/internship", label: "Internship", icon: Briefcase },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/notes", label: "Notes", icon: NotebookPen },
  { to: "/gym", label: "Gym", icon: Dumbbell },
  { to: "/focus", label: "Focus", icon: Timer },
] as const;

export function Sidebar({ onOpenCommand }: { onOpenCommand: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 248 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="sticky top-0 h-screen shrink-0 flex flex-col gap-2 p-3 glass border-r border-sidebar-border"
    >
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-sidebar-accent/50 transition-colors group"
      >
        <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-chart-4 grid place-items-center shadow-glow">
          <Sparkles className="size-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-semibold tracking-tight">Atlas</span>
            <span className="text-[11px] text-muted-foreground">personal OS</span>
          </div>
        )}
      </button>

      <button
        onClick={onOpenCommand}
        className={cn(
          "flex items-center gap-2 px-2.5 py-2 rounded-xl border border-border bg-secondary/40 hover:bg-secondary/70 transition-colors text-xs text-muted-foreground",
          collapsed && "justify-center"
        )}
      >
        <Command className="size-3.5" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">Quick jump…</span>
            <kbd className="text-[10px] font-mono opacity-70">⌘K</kbd>
          </>
        )}
      </button>

      <nav className="flex flex-col gap-0.5 mt-2 scrollbar-thin overflow-y-auto">
        {nav.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm transition-colors",
                active
                  ? "text-foreground bg-sidebar-accent/70"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/40"
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/15 to-transparent border border-primary/20"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon className="size-4 shrink-0 relative" />
              {!collapsed && <span className="relative truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2.5 py-2 text-[11px] text-muted-foreground">
        {!collapsed && <p className="leading-relaxed">Build quietly.<br/>Ship daily.</p>}
      </div>
    </motion.aside>
  );
}
