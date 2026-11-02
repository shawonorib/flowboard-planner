import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PriorityDot } from "@/components/AppShell";
import { useTasks, type Task } from "@/lib/tasks";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Flowdesk" },
      { name: "description", content: "See every task on a monthly calendar and export to your calendar app." },
      { property: "og:title", content: "Calendar — Flowdesk" },
      { property: "og:description", content: "See every task on a monthly calendar and export to your calendar app." },
    ],
  }),
  component: CalendarPage,
});

const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function exportIcs(tasks: Task[]) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Flowdesk//EN"];
  tasks.filter((t) => t.due).forEach((t) => {
    const d = t.due!.replace(/-/g, "");
    lines.push("BEGIN:VEVENT", `UID:${t.id}@flowdesk`, `DTSTART;VALUE=DATE:${d}`, `SUMMARY:${t.title}`, "END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "flowdesk.ics";
  a.click();
}

function gcalLink(t: Task) {
  const d = t.due!.replace(/-/g, "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(t.title)}&dates=${d}/${d}`;
}

function CalendarPage() {
  const tasks = useTasks();
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const start = new Date(cursor);
  start.setDate(1 - ((cursor.getDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  const todayStr = fmt(new Date());
  const shift = (n: number) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));

  return (
    <AppShell title="Calendar">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button onClick={() => shift(-1)} className="rounded-full border border-border px-3 py-1">←</button>
        <span className="min-w-40 text-center font-display text-xl">{cursor.toLocaleString("default", { month: "long", year: "numeric" })}</span>
        <button onClick={() => shift(1)} className="rounded-full border border-border px-3 py-1">→</button>
        <button onClick={() => exportIcs(tasks)} className="ml-auto rounded-xl bg-foreground px-4 py-2 text-sm text-background">
          Export to calendar (.ics)
        </button>
      </div>
      <div className="grid grid-cols-7 overflow-hidden rounded-2xl border border-border bg-border gap-px">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="bg-muted px-2 py-2 text-xs text-muted-foreground">{d}</div>
        ))}
        {days.map((d) => {
          const key = fmt(d);
          const items = tasks.filter((t) => t.due === key);
          const inMonth = d.getMonth() === cursor.getMonth();
          return (
            <div key={key} className={`min-h-28 bg-card p-2 ${inMonth ? "" : "opacity-40"}`}>
              <div className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${key === todayStr ? "bg-primary text-primary-foreground" : ""}`}>
                {d.getDate()}
              </div>
              {items.map((t) => (
                <a key={t.id} href={gcalLink(t)} target="_blank" rel="noreferrer" title="Add to Google Calendar"
                  className={`mb-1 flex items-center gap-1 truncate rounded-md bg-accent px-1.5 py-0.5 text-xs hover:bg-secondary ${t.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                  <PriorityDot p={t.priority} /> {t.title}
                </a>
              ))}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">Click a task to add it to Google Calendar, or export all to Apple/Outlook.</p>
    </AppShell>
  );
}
