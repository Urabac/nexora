import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { firebaseDashboard } from "./firebase.functions";
import { useAuth } from "./use-auth";
export function useFirebaseData() {
  const { user } = useAuth();
  const fetchData = useServerFn(firebaseDashboard);
  const [data, setData] = useState<Awaited<ReturnType<typeof firebaseDashboard>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try { setData(await fetchData()); setError(null); }
    catch (e) { setError(e instanceof Error ? e.message : "No se pudo consultar el saldo."); }
    finally { setLoading(false); }
  }, [user?.uid, fetchData]);
  useEffect(() => {
    if (!user) return;
    void refresh();
    const timer = setInterval(() => void refresh(), 15000);
    const focus = () => void refresh();
    window.addEventListener("focus", focus);
    return () => { clearInterval(timer); window.removeEventListener("focus", focus); };
  }, [refresh, user?.uid]);
  return { data, error, loading, refresh };
}