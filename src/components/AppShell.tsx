import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { taskActions, type Priority } from "@/lib/tasks";

const nav = [
  { to: "/", label: "Tasks" },
  { to: "/board", label: "Board" },
  { to: "/calendar", label: "Calendar" },
] as const;

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-display text-2xl">Flowdesk<span className="text-primary">.</span></span>
          <nav className="flex gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-full px-4 py-1.5 text-sm text-muted-foreground transition hover:text-foreground"
                activeProps={{ className: "bg-foreground !text-background" }}
                activeOptions={{ exact: true }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-display text-5xl tracking-tight">{title}</h1>
        <QuickAdd />
        {children}
      </main>
    </div>
  );
}

function QuickAdd() {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState<Priority>("med");
  return (
    <form
      className="my-8 flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-2 shadow-soft"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        taskActions.add({ title: title.trim(), status: "todo", priority, due: due || undefined });
        setTitle("");
        setDue("");
      }}
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task…"
        className="min-w-48 flex-1 bg-transparent px-3 py-2 outline-none"
      />
      <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="rounded-lg bg-muted px-3 text-sm" />
      <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="rounded-lg bg-muted px-3 text-sm">
        <option value="low">Low</option>
        <option value="med">Medium</option>
        <option value="high">High</option>
      </select>
      <button className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Add</button>
    </form>
  );
}

export function PriorityDot({ p }: { p: Priority }) {
  const cls = p === "high" ? "bg-destructive" : p === "med" ? "bg-primary" : "bg-muted-foreground";
  return <span className={`inline-block h-2 w-2 rounded-full ${cls}`} title={p} />;
}
