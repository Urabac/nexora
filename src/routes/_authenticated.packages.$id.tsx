import { pageHead } from "@/lib/page-head";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PrimaryButton } from "@/components/AppShell";
import { CheckCircle2, TrendingUp, Calendar, Coins } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { firebasePurchase } from "@/lib/firebase.functions";
import { FIREBASE_PACKAGES } from "@/lib/firebase-domain";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/packages/$id")({
  head: () => pageHead('Paquete de inversión', 'Consulta el precio, duración y retorno diario del paquete Nexora.'),
  component: PackageDetail,
});

function PackageDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const pkg = FIREBASE_PACKAGES.find(p => p.id === id);
  const purchase = useServerFn(firebasePurchase);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!pkg) {
    return <AppShell title="Paquete"><p className="text-sm text-muted-foreground">Paquete no disponible.</p></AppShell>;
  }

  const amount = Number(pkg.min_amount);
  const rate = Number(pkg.daily_interest);
  const daily = amount * rate;
  const total = daily * pkg.duration_days;

  const subscribe = async () => {
    if (!user || busy) return;
    setBusy(true);
    setMsg(null);

    try {
      const requestId = purchaseId ?? crypto.randomUUID();
      setPurchaseId(requestId);
      await purchase({ data: { packageId: pkg.id, purchaseId: requestId } });
      await navigate({ to: "/home" });
    } catch (e) { setMsg(e instanceof Error ? e.message : "No se pudo comprar el paquete."); }
    finally { setBusy(false); }
  };

  return (
    <AppShell title={`Paquete ${pkg.name}`}>
      <div className="rounded-3xl bg-gradient-primary p-6 shadow-glow">
        <h2 className="text-3xl font-bold text-white">{pkg.name}</h2>
        <p className="mt-1 text-sm text-white/80">Plan de inversión</p>
        <div className="mt-5 flex items-baseline gap-2 text-white">
          <span className="text-5xl font-bold">{amount}</span>
          <span className="text-base font-semibold">USDT</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Metric Icon={TrendingUp} value={`${(rate * 100).toFixed(0)}%`} label="Diario" />
        <Metric Icon={Calendar} value={`${pkg.duration_days}`} label="Días" />
        <Metric Icon={Coins} value={`${daily}`} label="USDT/día" />
      </div>

      <div className="mt-6 rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-card">
        <h3 className="text-sm font-semibold">Resumen de ganancias</h3>
        <ul className="mt-3 space-y-2.5 text-sm">
          <Row label="Inversión inicial" value={`${amount} USDT`} />
          <Row label="Ganancia diaria" value={`${daily} USDT`} />
          <Row label="Duración" value={`${pkg.duration_days} días`} />
          <div className="my-2 border-t border-border/40" />
          <Row label="Ganancia total" value={`+${total} USDT`} highlight />
          <Row label="Retorno total" value={`${amount + total} USDT`} />
        </ul>
      </div>

      <div className="mt-6 space-y-2.5">
        {["5% de rendimiento diario", `Duración de ${pkg.duration_days} días`, "Soporte 24/7"].map((f) => (
          <div key={f} className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-success" /> <span>{f}</span>
          </div>
        ))}
      </div>

      {msg && <p className="mt-4 text-sm text-destructive">{msg}</p>}

      <div className="mt-8">
        <PrimaryButton variant="success" onClick={subscribe} disabled={busy}>
          {busy ? "Procesando…" : `Suscribirme por ${amount} USDT`}
        </PrimaryButton>
      </div>
    </AppShell>
  );
}

function Metric({ Icon, value, label }: { Icon: any; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4 text-center">
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <p className="mt-2 text-lg font-bold">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${highlight ? "text-success" : ""}`}>{value}</span>
    </li>
  );
}
