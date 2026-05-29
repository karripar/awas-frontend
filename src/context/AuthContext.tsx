import React, { useEffect, useState } from "react";
import { AuthContext } from "./auth-context";
import type { SessionUser } from "../hooks/useBlogApi.ts";
import { SESSION_CHANGED_EVENT, readSessionState } from "../lib/session.ts";
import type { StoredSession } from "./auth-context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => {
    const parsed = readSessionState() as StoredSession;
    return parsed?.user ?? null;
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<StoredSession>;
      if (ce?.detail && ce.detail.user) {
        setUser(ce.detail.user ?? null);
        return;
      }

      const parsed = readSessionState() as StoredSession;
      setUser(parsed?.user ?? null);
    };

    window.addEventListener(SESSION_CHANGED_EVENT, handler as EventListener);

    return () => {
      window.removeEventListener(
        SESSION_CHANGED_EVENT,
        handler as EventListener,
      );
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
}

// keep named export only
