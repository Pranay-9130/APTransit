// Access token store (docs/12, Tokens on the web): memory only, never localStorage.
// React reads it through useSyncExternalStore in AuthProvider; lib/api.ts reads it directly.

export type SessionStatus = "unknown" | "authenticated" | "anonymous";

export interface SessionState {
  accessToken: string | null;
  status: SessionStatus;
}

let state: SessionState = { accessToken: null, status: "unknown" };
const listeners = new Set<() => void>();

function emit(next: SessionState) {
  state = next;
  for (const listener of listeners) listener();
}

export const sessionStore = {
  get: (): SessionState => state,
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setAccessToken(accessToken: string) {
    emit({ accessToken, status: "authenticated" });
  },
  clear() {
    emit({ accessToken: null, status: "anonymous" });
  },
  /** Tests only. */
  reset() {
    emit({ accessToken: null, status: "unknown" });
  },
};

const SERVER_STATE: SessionState = { accessToken: null, status: "unknown" };
export const getServerSessionState = (): SessionState => SERVER_STATE;
