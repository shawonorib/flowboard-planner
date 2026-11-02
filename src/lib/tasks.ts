import { useSyncExternalStore } from "react";

export type Status = "todo" | "doing" | "done";
export type Priority = "low" | "med" | "high";
export type Task = {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  due?: string | undefined; // YYYY-MM-DD
  createdAt: number;
};

const KEY = "flowdesk.tasks.v1";
const listeners = new Set<() => void>();
let cache: Task[] | null = null;
const EMPTY: Task[] = [];

function today(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function seed(): Task[] {
  const n = Date.now();
  return [
    { id: "1", title: "Draft Q4 roadmap", status: "doing", priority: "high", due: today(1), createdAt: n },
    { id: "2", title: "Review design feedback", status: "todo", priority: "med", due: today(3), createdAt: n },
    { id: "3", title: "Book team offsite", status: "todo", priority: "low", due: today(7), createdAt: n },
    { id: "4", title: "Ship onboarding emails", status: "done", priority: "med", due: today(-1), createdAt: n },
  ];
}

function read(): Task[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? JSON.parse(raw) : seed();
  } catch {
    cache = seed();
  }
  return cache!;
}

function write(next: Task[]) {
  cache = next;
  listeners.forEach((l) => l());
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage blocked (e.g. embedded preview) — keep working in memory
  }
  return;
  listeners.forEach((l) => l());
}

export function useTasks() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    read,
    () => EMPTY,
  );
}

export const taskActions = {
  add(t: Omit<Task, "id" | "createdAt">) {
    write([...read(), { ...t, id: Date.now().toString(36) + Math.random().toString(36).slice(2), createdAt: Date.now() }]);
  },
  update(id: string, patch: Partial<Task>) {
    write(read().map((t) => (t.id === id ? { ...t, ...patch } : t)));
  },
  remove(id: string) {
    write(read().filter((t) => t.id !== id));
  },
};

export const STATUSES: { id: Status; label: string }[] = [
  { id: "todo", label: "To do" },
  { id: "doing", label: "In progress" },
  { id: "done", label: "Done" },
];
