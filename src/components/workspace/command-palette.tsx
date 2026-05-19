import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  LayoutDashboard, Code2, Cpu, Brain, BookOpen, Briefcase,
  CheckSquare, NotebookPen, Dumbbell, Timer,
} from "lucide-react";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dsa", label: "DSA Tracker", icon: Code2 },
  { to: "/development", label: "Development", icon: Cpu },
  { to: "/subjects", label: "Core CS Subjects", icon: BookOpen },
  { to: "/ml", label: "Machine Learning", icon: Brain },
  { to: "/internship", label: "Internship", icon: Briefcase },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/notes", label: "Notes", icon: NotebookPen },
  { to: "/gym", label: "Gym", icon: Dumbbell },
  { to: "/focus", label: "Focus Mode", icon: Timer },
] as const;

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const navigate = useNavigate();
  const [, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Jump to anything…" />
      <CommandList>
        <CommandEmpty>Nothing here.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <CommandItem
                key={it.to}
                onSelect={() => {
                  onOpenChange(false);
                  navigate({ to: it.to });
                }}
              >
                <Icon className="size-4" />
                <span>{it.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
