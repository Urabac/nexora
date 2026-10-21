import { pageHead } from "@/lib/page-head";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useFirebaseData } from "@/lib/use-firebase-data";
import { AppShell } from "@/components/AppShell";
import { ArrowDownToLine, ArrowUpFromLine, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/wallet")({
  head: () => pageHead('Mi billetera', 'Saldo y depósitos de tu cuenta Nexora.'),
  component: WalletPage,
});

function WalletPage() {
  const { data, error } = useFirebaseData();
  const available = data?.availableBalance;
  const locked = data?.lockedBalance;
  const txs = (data?.deposits ?? []).map(d => ({ id: String(d.id), type: "deposit", amount: Number(d.amount), status: String(d.status), created_at: String(d.createdAt) })).sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <AppShell title="Mi billetera">
      <div className="rounded-3xl border border-border/60 bg-gradient-primary p-6 shadow-glow">
        <p className="text-xs uppercase tracking-wider text-primary-foreground/70">Saldo disponible</p>
        <p className="mt-2 text-4xl font-bold text-primary-foreground">{available?.toFixed(2) ?? "—"} <span className="text-sm">USDT</span></p>
        <p className="mt-2 text-xs text-primary-foreground/80">Bloqueado en paquetes: {locked?.toFixed(2) ?? "—"} USDT</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link to="/deposit" className="flex items-center justify-center gap-2 rounded-2xl bg-background/20 py-3 text-sm font-semibold text-primary-foreground">
            <ArrowDownToLine className="h-4 w-4" /> Recargar
          </Link>
          <Link to="/withdraw" className="flex items-center justify-center gap-2 rounded-2xl bg-background/20 py-3 text-sm font-semibold text-primary-foreground">
            <ArrowUpFromLine className="h-4 w-4" /> Retirar
          </Link>
        </div>
      </div>

      {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Movimientos</h2>
      <div className="mt-3 space-y-2">
        {txs.length === 0 && <p className="text-xs text-muted-foreground">Sin movimientos aún.</p>}
        {txs.map((t) => {
          const sign = t.type === "deposit" || t.type === "earning" ? "+" : "-";
          const color = sign === "+" ? "text-success" : "text-destructive";
          const label = t.type === "deposit" ? "Recarga" : t.type === "withdrawal" ? "Retiro" : "Rendimiento";
          return (
            <div key={t.id} className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/60 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()} · {t.status}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold ${color}`}>{sign}{Number(t.amount)} USDT</span>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
