import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PriorityDot } from "@/components/AppShell";
import { STATUSES, taskActions, useTasks, type Status } from "@/lib/tasks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tasks — Flowdesk" },
      { name: "description", content: "Track tasks, priorities and due dates in Flowdesk." },
      { property: "og:title", content: "Tasks — Flowdesk" },
      { property: "og:description", content: "Track tasks, priorities and due dates in Flowdesk." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const tasks = useTasks();
  const open = tasks.filter((t) => t.status !== "done").length;
  const sorted = [...tasks].sort((a, b) => (a.status === "done" ? 1 : 0) - (b.status === "done" ? 1 : 0) || (a.due ?? "9").localeCompare(b.due ?? "9"));
  return (
    <AppShell title="Today's focus">
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[["Open", open], ["Completed", tasks.length - open], ["Total", tasks.length]].map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-border bg-card p-5">
            <div className="text-sm text-muted-foreground">{l}</div>
            <div className="font-display text-4xl">{v}</div>
          </div>
        ))}
      </div>
      <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
        {sorted.map((t) => (
          <li key={t.id} className="group flex items-center gap-4 px-5 py-4">
            <input
              type="checkbox"
              checked={t.status === "done"}
              onChange={(e) => taskActions.update(t.id, { status: e.target.checked ? "done" : "todo" })}
              className="h-5 w-5 accent-primary"
            />
            <PriorityDot p={t.priority} />
            <input
              defaultValue={t.title}
              onBlur={(e) => e.target.value.trim() && taskActions.update(t.id, { title: e.target.value.trim() })}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              className={`flex-1 rounded-md bg-transparent px-1 outline-none focus:bg-muted ${t.status === "done" ? "text-muted-foreground line-through" : ""}`}
            />
            <select value={t.status} onChange={(e) => taskActions.update(t.id, { status: e.target.value as Status })} className="rounded-full bg-muted px-3 py-0.5 text-xs">
              {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <input type="date" value={t.due ?? ""} onChange={(e) => taskActions.update(t.id, { due: e.target.value || undefined })} className="rounded-md bg-transparent text-sm text-muted-foreground" />
            <button onClick={() => taskActions.remove(t.id)} className="text-sm text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100">
              Delete
            </button>
          </li>
        ))}
        {!tasks.length && <li className="px-5 py-10 text-center text-muted-foreground">Nothing here yet — add your first task.</li>}
      </ul>
    </AppShell>
  );
}
