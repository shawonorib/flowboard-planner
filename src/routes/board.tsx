import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PriorityDot } from "@/components/AppShell";
import { STATUSES, taskActions, useTasks, type Status } from "@/lib/tasks";

export const Route = createFileRoute("/board")({
  head: () => ({
    meta: [
      { title: "Kanban Board — Flowdesk" },
      { name: "description", content: "Drag tasks across To do, In progress and Done." },
      { property: "og:title", content: "Kanban Board — Flowdesk" },
      { property: "og:description", content: "Drag tasks across To do, In progress and Done." },
    ],
  }),
  component: BoardPage,
});

function BoardPage() {
  const tasks = useTasks();
  const [over, setOver] = useState<Status | null>(null);
  return (
    <AppShell title="Board">
      <div className="grid gap-4 md:grid-cols-3">
        {STATUSES.map((col) => {
          const items = tasks.filter((t) => t.status === col.id);
          return (
            <section
              key={col.id}
              onDragOver={(e) => { e.preventDefault(); setOver(col.id); }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => {
                taskActions.update(e.dataTransfer.getData("id"), { status: col.id });
                setOver(null);
              }}
              className={`min-h-96 rounded-2xl border p-3 transition ${over === col.id ? "border-primary bg-accent" : "border-border bg-muted/50"}`}
            >
              <h2 className="mb-3 flex justify-between px-2 text-sm font-medium">
                {col.label} <span className="text-muted-foreground">{items.length}</span>
              </h2>
              <div className="space-y-2">
                {items.map((t) => (
                  <article
                    key={t.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("id", t.id)}
                    className="cursor-grab rounded-xl border border-border bg-card p-4 shadow-soft active:cursor-grabbing"
                  >
                    <div className="flex items-center gap-2">
                      <PriorityDot p={t.priority} />
                      <span className={t.status === "done" ? "line-through text-muted-foreground" : ""}>{t.title}</span>
                    </div>
                    {t.due && <div className="mt-2 text-xs text-muted-foreground">Due {t.due}</div>}
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
