export const SESSION_CHANGED_EVENT = "awas:session-changed";

let currentSession: unknown = null;

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
