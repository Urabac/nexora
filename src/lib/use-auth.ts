import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { firebaseRefresh } from "./firebase.functions";
import { readSession, saveSession, type FirebaseSession } from "./firebase-session";

export function useAuth() {
  const [session, setSession] = useState<FirebaseSession | null>(null);
  const refreshToken = useServerFn(firebaseRefresh);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const sync = () => { if (active) { setSession(readSession()); setLoading(false); } };
    const restore = async () => {
      const current = readSession();
      if (current && current.expiresAt < Date.now() + 120000) {
        try { const refreshed = await refreshToken({ data: { refreshToken: current.refreshToken } }); if (active) saveSession({ ...current, ...refreshed }); }
        catch { if (active) saveSession(null); }
      }
      sync();
    };
    void restore();
    const interval = setInterval(() => void restore(), 60000);
    window.addEventListener("firebase-session", sync);
    window.addEventListener("storage", sync);
    return () => { active = false; clearInterval(interval); window.removeEventListener("firebase-session", sync); window.removeEventListener("storage", sync); };
  }, [refreshToken]);

  return { session, user: session?.user ?? null, loading };
}
