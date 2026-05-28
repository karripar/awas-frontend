import React, {useEffect, useState } from "react";
import { AuthContext } from "./auth-context";
import type { SessionUser } from "../hooks/useBlogApi.ts";
import { SESSION_CHANGED_EVENT, readSessionFromStorage } from "../lib/session.ts";
import type { StoredSession } from "./auth-context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => {
    if (typeof window === "undefined") return null;
    const parsed = readSessionFromStorage() as StoredSession;
    return parsed?.user ?? null;
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<StoredSession>;
      if (ce?.detail && ce.detail.user) {
        setUser(ce.detail.user ?? null);
        return;
      }

      // fallback to localStorage
      try {
        const parsed = readSessionFromStorage() as StoredSession;
        setUser(parsed?.user ?? null);
      } catch {
        setUser(null);
      }
    };

    const storageHandler = (e: StorageEvent) => {
      if (e.key === SESSION_CHANGED_EVENT || e.key === undefined) {
        try {
          const parsed = e.newValue
            ? (JSON.parse(e.newValue) as StoredSession)
            : null;
          setUser(parsed?.user ?? null);
        } catch {
          setUser(null);
        }
      }
    };

    window.addEventListener(SESSION_CHANGED_EVENT, handler as EventListener);
    window.addEventListener("storage", storageHandler);

    return () => {
      window.removeEventListener(
        SESSION_CHANGED_EVENT,
        handler as EventListener,
      );
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
}

// keep named export only
