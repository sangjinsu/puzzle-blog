import type { APILogEntry } from './types';

type Listener = () => void;

const MAX_ENTRIES = 200;

let entries: APILogEntry[] = [];
let listeners = new Set<Listener>();
let paused = false;
let idCounter = 0;

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function getSnapshot(): APILogEntry[] {
  return entries;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function addEntry(entry: Omit<APILogEntry, 'id' | 'timestamp'>): void {
  if (paused) return;

  const newEntry: APILogEntry = {
    ...entry,
    id: `log-${++idCounter}`,
    timestamp: Date.now(),
  };

  entries = [newEntry, ...entries].slice(0, MAX_ENTRIES);
  emit();
}

export function clearEntries(): void {
  entries = [];
  emit();
}

export function setPaused(value: boolean): void {
  paused = value;
  emit();
}

export function isPaused(): boolean {
  return paused;
}
