import { pageHead } from "@/lib/page-head";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TrendingUp, Users, Coins } from "lucide-react";
import { useFirebaseData } from "@/lib/use-firebase-data";

export const Route = createFileRoute("/_authenticated/earnings")({
  head: () => pageHead('Mis ingresos', 'Consulta los ingresos registrados de tus inversiones Nexora.'),
  component: Earnings,
});

function Earnings() {
  const { data, error } = useFirebaseData();
  const earned = data?.earned.toFixed(2) ?? "—";
  return (
    <AppShell title="Mis ingresos">
      <div className="rounded-3xl border border-border/60 bg-gradient-primary p-6 shadow-glow">
        <p className="text-xs uppercase tracking-wider text-primary-foreground/70">Ingresos totales</p>
        <p className="mt-2 text-4xl font-bold text-primary-foreground">{earned} <span className="text-sm">USDT</span></p>
      </div>

      <div className="mt-6 grid gap-3">
        <Card Icon={TrendingUp} label="Por inversiones" value={`${earned} USDT`} />
        <Card Icon={Users} label="Por referidos" value="0.00 USDT" />
        <Card Icon={Coins} label="Bonos" value="0.00 USDT" />
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Historial</h2>
      {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
      {data?.subscriptions.map(s => <div key={s.id} className="mt-3 rounded-2xl border border-border p-4"><p className="text-sm font-semibold">{String(s.packageName)} · {Number(s.earned ?? 0).toFixed(2)} USDT</p><p className="text-xs text-muted-foreground">{Number(s.daysCompleted ?? 0)} de 42 días</p></div>)}
      {data?.subscriptions.length === 0 &&
      <div className="mt-3 rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
        Aún no tienes ingresos registrados. Suscríbete a un paquete para comenzar.
      </div>}
    </AppShell>
  );
}

function Card({ Icon, label, value }: { Icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-gradient-card p-4 shadow-card">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}
