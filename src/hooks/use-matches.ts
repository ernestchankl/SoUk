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

const noopSubscribe = () => () => {};

export function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

function subscribe(onStoreChange: () => void) {
  if (!didSeed) {
    didSeed = true;
    if (!wasSeeded() && readMatchesSnapshot().length === 0) {
      persist(createSampleMatch());
      markSeeded();
    }
  }
  return subscribeMatches(onStoreChange);
}

export function useMatches() {
  const hydrated = useIsClient();
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

  return { hydrated, matches, save, remove };
}

export function useMatch(id: string) {
  const hydrated = useIsClient();
  const matches = useSyncExternalStore(
    subscribe,
    readMatchesSnapshot,
    getServerMatchesSnapshot
  );
  const match = matches.find((item) => item.id === id) ?? null;

  const update = useCallback((next: Match) => {
    persist({ ...next, updatedAt: Date.now() });
  }, []);

  return { hydrated, match, update };
}
