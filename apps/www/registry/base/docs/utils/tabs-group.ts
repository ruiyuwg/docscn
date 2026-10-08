// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const listeners = new Map<string, Set<() => void>>();

function subscribe(groupId: string | undefined) {
  return (onChange: () => void) => {
    if (!groupId) return () => {};
    const groupListeners = listeners.get(groupId) ?? new Set();
    groupListeners.add(onChange);
    listeners.set(groupId, groupListeners);
    return () => {
      groupListeners.delete(onChange);
    };
  };
}

/**
 * The tab selected in a group of tabs that share a `groupId`, kept in
 * `sessionStorage` (and `localStorage` with `persist`), and a setter that
 * updates every tabs of the group.
 *
 * The value is `null` without a `groupId`, on the server, and before a tab of
 * the group has been selected.
 */
export function useTabsGroup(
  groupId: string | undefined,
  persist = false,
): [value: string | null, setValue: (value: string) => void] {
  const value = useSyncExternalStore(
    useMemo(() => subscribe(groupId), [groupId]),
    () => {
      if (!groupId) return null;
      const value = sessionStorage.getItem(groupId);
      return persist ? (value ?? localStorage.getItem(groupId)) : value;
    },
    () => null,
  );

  const setValue = useCallback(
    (value: string) => {
      if (!groupId) return;
      sessionStorage.setItem(groupId, value);
      if (persist) localStorage.setItem(groupId, value);
      for (const listener of listeners.get(groupId) ?? []) listener();
    },
    [groupId, persist],
  );

  return [value, setValue];
}
