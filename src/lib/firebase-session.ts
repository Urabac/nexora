export interface FirebaseSession { user: { id: string; uid: string; email: string }; idToken: string; refreshToken: string; expiresAt: number }
const KEY = "nexora-firebase-session";
export function readSession(): FirebaseSession | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(KEY) ?? "null"); } catch { return null; }
}
export function saveSession(session: FirebaseSession | null) {
  if (session) localStorage.setItem(KEY, JSON.stringify(session));
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("firebase-session"));
}