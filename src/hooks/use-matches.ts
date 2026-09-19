"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Match } from "@/lib/types";
import { createSampleMatch } from "@/lib/sample";
import {
  deleteMatch as removeMatch,
  getServerMatchesSnapshot,
  markSeeded,
  readMatchesSnapshot,
  saveMatch as persist,
  subscribeMatches,
  wasSeeded,
} from "@/lib/storage";

let didSeed = false;

function seedDemoMatch() {
  if (didSeed) return;
  didSeed = true;
  try {
    if (!wasSeeded() && readMatchesSnapshot().length === 0) {
      persist(createSampleMatch());
    }
    markSeeded();
  } catch (error) {
    console.error("無法載入示範場次", error);
  }
}

function subscribe(onStoreChange: () => void) {
  seedDemoMatch();
  const unsubscribe = subscribeMatches(onStoreChange);
  queueMicrotask(onStoreChange);
  return unsubscribe;
}

export function useMatches() {
  const matches = useSyncExternalStore(
    subscribe,
    readMatchesSnapshot,
    getServerMatchesSnapshot
  );

  const save = useCallback((match: Match) => {
    persist({ ...match, updatedAt: Date.now() });
  }, []);

  const remove = useCallback((id: string) => {
    removeMatch(id);
  }, []);

  return { matches, save, remove };
}

export function useMatch(id: string) {
  const matches = useSyncExternalStore(
    subscribe,
    readMatchesSnapshot,
    getServerMatchesSnapshot
  );
  const match = matches.find((item) => item.id === id) ?? null;

  const update = useCallback((next: Match) => {
    persist({ ...next, updatedAt: Date.now() });
  }, []);

  return { match, update };
}
