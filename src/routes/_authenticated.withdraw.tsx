import { pageHead } from "@/lib/page-head";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useFirebaseData } from "@/lib/use-firebase-data";
import { AppShell, PrimaryButton } from "@/components/AppShell";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/withdraw")({
  head: () => pageHead('Retirar USDT', 'Consulta el saldo disponible para retiros.'),
  component: Withdraw,
});

function Withdraw() {
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const { data, error } = useFirebaseData();
  const balance = data?.availableBalance ?? 0;
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const n = parseFloat(amount);
    if (!n || n < 10) { setMsg("Monto mínimo: 10 USDT"); return; }
    if (n > balance) { setMsg("Saldo insuficiente"); return; }
    setMsg("Los retiros se gestionan en el sistema externo de pagos; aún no hay un enlace configurado.");
  };

  return (
    <AppShell title="Retirar USDT">
      <div className="rounded-3xl border border-border/60 bg-gradient-card p-5 shadow-card">
        <p className="text-xs text-muted-foreground">Balance disponible</p>
        <p className="mt-1 text-3xl font-bold">{balance.toFixed(2)} <span className="text-sm text-muted-foreground">USDT</span></p>
      </div>

      {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Dirección de retiro (TRC-20)</span>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="TX..."
            className="mt-2 w-full rounded-2xl border border-border bg-card/60 px-4 py-3.5 text-sm font-mono outline-none focus:border-primary"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Monto</span>
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-card/60 px-4 py-3.5">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-lg font-semibold outline-none"
              required
            />
            <button type="button" onClick={() => setAmount(String(balance))} className="text-xs font-semibold text-primary">MAX</button>
          </div>
        </label>

        <div className="rounded-2xl border border-border/60 bg-card/40 p-4 text-xs text-muted-foreground space-y-1.5">
          <p>• Comisión de red: 1 USDT</p>
          <p>• Monto mínimo: 10 USDT</p>
          <p>• Tiempo estimado: hasta 24h</p>
        </div>

        {msg && <p className="text-xs text-destructive">{msg}</p>}

        <PrimaryButton type="submit">{busy ? "Enviando…" : "Solicitar retiro"}</PrimaryButton>
      </form>
    </AppShell>
  );
}
