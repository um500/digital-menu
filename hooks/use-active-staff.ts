"use client";

import { useSyncExternalStore } from "react";

export interface ActiveStaff {
  staffId: string;
  name: string;
  role: string;
}

const STORAGE_KEY = "garden-cafe-active-staff";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

function emitChange() {
  for (const listener of listeners) listener();
}

function parseStaff(raw: string | null): ActiveStaff | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Tracks who is currently "clocked in" on a shared device (kitchen tablet,
 * counter terminal) via sessionStorage — cleared when the browser tab
 * closes, so the next shift always starts from a PIN prompt. This is
 * identity attribution only; the device itself stays protected by the
 * admin session cookie regardless of who is clocked in here.
 *
 * Uses useSyncExternalStore (rather than useState+useEffect) to read
 * sessionStorage, since that's the store this state actually lives in —
 * React itself owns none of it, this hook just subscribes to it.
 */
export function useActiveStaff() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const staff = parseStaff(raw);

  function clockIn(next: ActiveStaff) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore — storage may be unavailable (private browsing, etc.)
    }
    emitChange();
  }

  function clockOut() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    emitChange();
  }

  return { staff, isLoaded: true, clockIn, clockOut };
}
