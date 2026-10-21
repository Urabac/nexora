import { useEffect, useState } from "react";
import { nextCutoff } from "./firebase-domain";

export function useCutoffCountdown() {
  const [remaining, setRemaining] = useState(() => nextCutoff() - Date.now());
  useEffect(() => {
    const timer = setInterval(() => setRemaining(nextCutoff() - Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const total = Math.max(0, remaining);
  const hours = Math.floor(total / 3600000);
  const minutes = Math.floor(total / 60000) % 60;
  const seconds = Math.floor(total / 1000) % 60;
  return [hours, minutes, seconds].map(n => String(n).padStart(2, "0")).join(":");
}
