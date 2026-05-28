export const SESSION_KEY = import.meta.env.VITE_SESSION_KEY ?? "awas.session";
export const SESSION_CHANGED_EVENT = "awas:session-changed";

export function readSessionFromStorage(): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSessionInStorage(session: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
}

export function dispatchSessionChanged(session: unknown): void {
  try {
    window.dispatchEvent(new CustomEvent(SESSION_CHANGED_EVENT, { detail: session }));
  } catch {
    // ignore
  }
}
