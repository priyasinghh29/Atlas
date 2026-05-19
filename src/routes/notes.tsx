import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, SectionHeader } from "@/components/workspace/ui-bits";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { seedNotes, type Note } from "@/lib/workspace-data";
import { Plus, Search, Trash2, Tag as TagIcon } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/notes")({
  component: NotesPage,
  head: () => ({ meta: [{ title: "Notes — Atlas" }, { name: "description", content: "Markdown notes for study sessions, projects, and ideas." }] }),
});

const uid = () => Math.random().toString(36).slice(2, 10);

// minimal markdown renderer (headings, bold, italic, lists, code)
function renderMd(md: string) {
  const lines = md.split("\n");
  const out: React.ReactNode[] = [];
  let listBuf: string[] = [];
  const flushList = () => {
    if (!listBuf.length) return;
    out.push(<ul key={out.length} className="list-disc pl-5 space-y-1 my-2">{listBuf.map((l, i) => <li key={i} dangerouslySetInnerHTML={{ __html: inline(l) }} />)}</ul>);
    listBuf = [];
  };
  const inline = (s: string) =>
    s
      .replace(/`([^`]+)`/g, '<code class="bg-secondary/60 px-1 py-0.5 rounded text-xs">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");

  lines.forEach((line, i) => {
    if (line.startsWith("# ")) { flushList(); out.push(<h1 key={i} className="text-2xl font-semibold mt-4 mb-2">{line.slice(2)}</h1>); }
    else if (line.startsWith("## ")) { flushList(); out.push(<h2 key={i} className="text-xl font-semibold mt-3 mb-2">{line.slice(3)}</h2>); }
    else if (line.startsWith("### ")) { flushList(); out.push(<h3 key={i} className="text-lg font-medium mt-2 mb-1">{line.slice(4)}</h3>); }
    else if (/^[-*]\s/.test(line)) { listBuf.push(line.replace(/^[-*]\s/, "")); }
    else if (line.trim() === "") { flushList(); out.push(<div key={i} className="h-2" />); }
    else { flushList(); out.push(<p key={i} className="leading-relaxed text-foreground/90" dangerouslySetInnerHTML={{ __html: inline(line) }} />); }
  });
  flushList();
  return out;
}

function NotesPage() {
  const [notes, setNotes] = useLocalStorage<Note[]>("ws.notes", seedNotes);
  const [activeId, setActiveId] = useState<string>(notes[0]?.id ?? "");
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => Array.from(new Set(notes.map((n) => n.tag))), [notes]);
  const filtered = notes
    .filter((n) => (tag ? n.tag === tag : true))
    .filter((n) => q ? (n.title + n.body).toLowerCase().includes(q.toLowerCase()) : true)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const active = notes.find((n) => n.id === activeId) ?? filtered[0];

  const newNote = () => {
    const n: Note = { id: uid(), title: "Untitled note", body: "# New note\n\nStart writing…", tag: tag ?? "General", updatedAt: Date.now() };
    setNotes([n, ...notes]);
    setActiveId(n.id);
  };

  const update = (patch: Partial<Note>) => {
    if (!active) return;
    setNotes(notes.map((n) => n.id === active.id ? { ...n, ...patch, updatedAt: Date.now() } : n));
  };

  const remove = (id: string) => {
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    if (id === activeId) setActiveId(next[0]?.id ?? "");
  };

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        title="Notes"
        subtitle="Markdown · searchable · tagged"
        action={<button onClick={newNote} className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm flex items-center gap-1.5 hover:opacity-90"><Plus className="size-4" /> New</button>}
      />

      <div className="grid lg:grid-cols-[280px_1fr] gap-4">
        <GlassCard className="h-[calc(100vh-220px)] flex flex-col overflow-hidden">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes…" className="w-full bg-secondary/40 rounded-lg pl-8 pr-3 py-2 text-sm outline-none border border-border focus:border-primary/40" />
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <button onClick={() => setTag(null)} className={`text-[11px] px-2 py-0.5 rounded-full border ${!tag ? "bg-primary/15 text-primary border-primary/30" : "bg-secondary/60 border-border text-muted-foreground"}`}>All</button>
            {tags.map((t) => (
              <button key={t} onClick={() => setTag(t === tag ? null : t)} className={`text-[11px] px-2 py-0.5 rounded-full border ${tag === t ? "bg-primary/15 text-primary border-primary/30" : "bg-secondary/60 border-border text-muted-foreground"}`}>{t}</button>
            ))}
          </div>
          <ul className="space-y-1 overflow-y-auto scrollbar-thin -mr-2 pr-2">
            {filtered.map((n) => (
              <li key={n.id}>
                <button onClick={() => setActiveId(n.id)} className={`w-full text-left px-3 py-2.5 rounded-lg transition group ${active?.id === n.id ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"}`}>
                  <div className="text-sm font-medium truncate">{n.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1"><TagIcon className="size-2.5" />{n.tag}</span>
                    <span>·</span>
                    <span>{new Date(n.updatedAt).toLocaleDateString()}</span>
                  </div>
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className="text-xs text-muted-foreground px-3 py-6 text-center">No notes</li>}
          </ul>
        </GlassCard>

        <GlassCard className="h-[calc(100vh-220px)] flex flex-col overflow-hidden">
          {active ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <input value={active.title} onChange={(e) => update({ title: e.target.value })} className="flex-1 bg-transparent text-xl font-semibold outline-none" />
                <input value={active.tag} onChange={(e) => update({ tag: e.target.value })} className="w-28 bg-secondary/40 rounded-md px-2 py-1 text-xs outline-none border border-border focus:border-primary/40" />
                <button onClick={() => remove(active.id)} className="size-8 rounded-md hover:bg-destructive/20 grid place-items-center text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
              </div>
              <div className="grid md:grid-cols-2 gap-4 flex-1 overflow-hidden">
                <textarea
                  value={active.body}
                  onChange={(e) => update({ body: e.target.value })}
                  className="w-full h-full bg-secondary/20 rounded-xl p-4 text-sm font-mono outline-none resize-none border border-border focus:border-primary/40 scrollbar-thin leading-relaxed"
                  spellCheck={false}
                />
                <div className="prose-invert h-full overflow-y-auto scrollbar-thin bg-secondary/10 rounded-xl p-5 border border-border">
                  {renderMd(active.body)}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 grid place-items-center text-muted-foreground text-sm">Create your first note</div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
