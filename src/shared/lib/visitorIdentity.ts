export const VISITOR_ID_KEY = 'crevo_visitor_id'
const SESSION_ID_KEY = 'crevo_session_id'
const LAST_SEEN_KEY = 'crevo_session_last_seen'
const SESSION_TIMEOUT_MS = 30 * 60 * 1000

/** Pseudonymous and persistent. Identifies a browser, never a person. */
export function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  return readOrCreate(window.localStorage, VISITOR_ID_KEY)
}

/** Resets after 30 minutes of inactivity, like any analytics session. */
export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  try {
    const lastSeen = Number(window.sessionStorage.getItem(LAST_SEEN_KEY) ?? 0)
    if (lastSeen && Date.now() - lastSeen > SESSION_TIMEOUT_MS) {
      window.sessionStorage.removeItem(SESSION_ID_KEY)
    }
    window.sessionStorage.setItem(LAST_SEEN_KEY, String(Date.now()))
  } catch {
    /* private mode — fall through to a throwaway id */
  }
  return readOrCreate(window.sessionStorage, SESSION_ID_KEY)
}

/** Reads an existing ID from storage or generates and stores a new UUID. */
function readOrCreate(storage: Storage, key: string): string {
  try {
    const existing = storage.getItem(key)
    if (existing) return existing
    const created = crypto.randomUUID()
    storage.setItem(key, created)
    return created
  } catch {
    // Storage blocked: a per-call id still lets the request through.
    return crypto.randomUUID()
  }
}
