import type { Action, Match } from "@/lib/types";
import { uid } from "@/lib/id";
import { deriveState } from "@/lib/volleyball";

export const STORAGE_KEY = "rallycode.matches.v1";
const SEEDED = "rallycode.seeded.v3";
export const STORE_EVENT = "rallycode-matches";
const EMPTY_MATCHES: Match[] = [];

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

let cachedRaw = "__empty__";
let cachedMatches: Match[] = EMPTY_MATCHES;

function parseMatches(raw: string | null): Match[] {
  if (!raw) return EMPTY_MATCHES;
  try {
    const parsed = JSON.parse(raw) as Match[];
    if (!Array.isArray(parsed) || parsed.length === 0) return EMPTY_MATCHES;
    return parsed.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return EMPTY_MATCHES;
  }
}

export function readMatchesSnapshot(): Match[] {
  if (!canUseStorage()) return EMPTY_MATCHES;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const key = raw ?? "";
  if (key === cachedRaw) return cachedMatches;
  cachedRaw = key;
  cachedMatches = parseMatches(raw);
  return cachedMatches;
}

export function getServerMatchesSnapshot(): Match[] {
  return EMPTY_MATCHES;
}

export function loadMatches(): Match[] {
  return readMatchesSnapshot();
}

export function notifyStore() {
  if (!canUseStorage()) return;
  cachedRaw = "__invalidate__";
  window.dispatchEvent(new Event(STORE_EVENT));
}

export function saveMatches(matches: Match[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
  cachedRaw = "__invalidate__";
  cachedMatches = matches.length === 0 ? EMPTY_MATCHES : matches.sort((a, b) => b.updatedAt - a.updatedAt);
  window.dispatchEvent(new Event(STORE_EVENT));
}

export function getMatch(id: string): Match | undefined {
  return loadMatches().find((m) => m.id === id);
}

export function saveMatch(match: Match) {
  const matches = loadMatches().filter((m) => m.id !== match.id);
  matches.unshift(match);
  saveMatches(matches);
}

export function deleteMatch(id: string) {
  saveMatches(loadMatches().filter((m) => m.id !== id));
}

export function wasSeeded(): boolean {
  if (!canUseStorage()) return true;
  return window.localStorage.getItem(SEEDED) === "1";
}

export function markSeeded() {
  if (!canUseStorage()) return;
  window.localStorage.setItem(SEEDED, "1");
}

export function exportMatch(match: Match): string {
  return JSON.stringify(match, null, 2);
}

export function importMatchJson(raw: string): Match {
  const parsed = JSON.parse(raw) as Match;
  if (!parsed || typeof parsed !== "object" || !parsed.home || !parsed.away) {
    throw new Error("檔案格式不正確");
  }
  return {
    ...parsed,
    id: uid(),
    updatedAt: Date.now(),
    createdAt: parsed.createdAt ?? Date.now(),
    actions: parsed.actions ?? [],
  };
}

export function cloneWithNewIds(match: Match): Match {
  const state = deriveState(match);
  return {
    ...match,
    id: uid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: state.matchWinner ? "completed" : match.status,
    actions: match.actions.map((action: Action) => ({ ...action, id: uid() })),
  };
}

export function subscribeMatches(onStoreChange: () => void) {
  if (!canUseStorage()) return () => {};
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(STORE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(STORE_EVENT, handler);
  };
}
