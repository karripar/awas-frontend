export const SESSION_CHANGED_EVENT = "awas:session-changed";

let currentSession: unknown = null;

const STORAGE_KEY = "awas.session";

export function readSessionState(): unknown {
  return currentSession;
}

export function setSessionState(session: unknown): void {
  currentSession = session;
  dispatchSessionChanged(session);
}

export function clearSessionState(): void {
  currentSession = null;
  dispatchSessionChanged(null);
}

export function dispatchSessionChanged(session: unknown): void {
  try {
    window.dispatchEvent(
      new CustomEvent(SESSION_CHANGED_EVENT, { detail: session }),
    );
  } catch {
    // ignore
  }
}

// Persistent storage helpers (used by hooks to persist across reloads)
export function readSessionFromStorage(): unknown | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSessionInStorage(session: unknown): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
}
