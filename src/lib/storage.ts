import type { CollectionItem, HistoryEntry } from "./types";

const HISTORY_KEY = "reqlab.history";
const COLLECTIONS_KEY = "reqlab.collections";
const MAX_HISTORY = 50;

const isBrowser = () => typeof window !== "undefined";

export function loadHistory(): HistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]) {
  if (!isBrowser()) return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)));
}

export function addHistoryEntry(entry: HistoryEntry) {
  const list = [entry, ...loadHistory()];
  saveHistory(list);
  return list.slice(0, MAX_HISTORY);
}

export function clearHistory() {
  if (!isBrowser()) return;
  localStorage.removeItem(HISTORY_KEY);
}

export function loadCollections(): CollectionItem[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(COLLECTIONS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCollections(items: CollectionItem[]) {
  if (!isBrowser()) return;
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(items));
}
