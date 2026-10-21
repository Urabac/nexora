import { pageHead } from "@/lib/page-head";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, QrCode, CheckCircle2, Clock } from "lucide-react";
import { AppShell, PrimaryButton } from "@/components/AppShell";
import { useServerFn } from "@tanstack/react-start";
import { firebaseDeposit } from "@/lib/firebase.functions";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/deposit")({
  head: () => pageHead('Recargar USDT', 'Envía tu comprobante de depósito para revisión externa.'),
  component: Deposit,
});

function Deposit() {
  const [copied, setCopied] = useState(false);
  const address = "TX9aB3kLm2pQ7rN4vY8zE5wH6jU1cF0sDt";
  const [amount, setAmount] = useState("");
  const [senderRef, setSenderRef] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();
  const sendDeposit = useServerFn(firebaseDeposit);

  const submit = async () => {
    if (!user) return;
    const n = parseFloat(amount);
    if (!n || n < 10) { setMsg("Monto mínimo: 10 USDT"); return; }
    const ref = senderRef.trim();
    if (ref.length < 6) { setMsg("Ingresa tu dirección de billetera o ID de transacción"); return; }
    setBusy(true);
    setMsg(null);
    try {
      await sendDeposit({ data: { amount: n, reference: ref } });
      setSubmitted(true);
    } catch (e) { setMsg(e instanceof Error ? e.message : "No se pudo enviar el depósito."); }
    finally { setBusy(false); }
  };

  if (submitted) {
    return (
      <AppShell title="Recargar USDT">
        <div className="rounded-3xl border border-primary/30 bg-gradient-card p-6 shadow-card text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/15">
            <Clock className="h-7 w-7 text-primary" />
          </div>
          <h2 className="mt-4 text-lg font-bold">Depósito en revisión</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tu depósito está siendo revisado. Te notificaremos una vez que se acredite en tu cuenta.
            Este proceso usualmente toma hasta 10 minutos.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Recargar USDT">
      <div className="rounded-3xl border border-border/60 bg-gradient-card p-5 shadow-card text-center">
        <div className="mx-auto grid h-40 w-40 place-items-center rounded-2xl bg-background/60 border border-border">
          <QrCode className="h-24 w-24 text-foreground" />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Red TRC-20 · USDT</p>
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-border bg-background/40 px-3 py-2.5">
          <span className="truncate text-xs font-mono">{address}</span>
          <button
            onClick={() => { navigator.clipboard?.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className="shrink-0 rounded-lg bg-primary/15 p-2 text-primary"
          >
            {copied ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Monto a recargar</span>
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-card/60 px-4 py-3.5">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-lg font-semibold outline-none"
            />
            <span className="text-sm font-semibold text-muted-foreground">USDT</span>
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-medium">Tu dirección de billetera o ID de transacción</span>
          <div className="mt-2 rounded-2xl border border-border bg-card/60 px-4 py-3">
            <input
              type="text"
              value={senderRef}
              onChange={(e) => setSenderRef(e.target.value)}
              placeholder="Ej: TXxxxxxxxxxxxxxxx o hash de la transacción"
              className="w-full bg-transparent text-sm font-mono outline-none"
            />
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">Necesario para verificar tu pago.</p>
        </label>

        <div className="rounded-2xl border border-border/60 bg-card/40 p-4 text-xs text-muted-foreground space-y-1.5">
          <p>• Envía únicamente USDT por la red TRC-20.</p>
          <p>• Tu depósito quedará pendiente hasta confirmación.</p>
          <p>• Monto mínimo: 10 USDT.</p>
        </div>

        {msg && <p className="text-xs text-destructive">{msg}</p>}

        <PrimaryButton onClick={submit} disabled={busy}>{busy ? "Enviando…" : "He realizado el pago"}</PrimaryButton>
      </div>
    </AppShell>
  );
}
