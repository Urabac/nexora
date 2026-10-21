import { pageHead } from "@/lib/page-head";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FIREBASE_PACKAGES } from "@/lib/firebase-domain";
import { useFirebaseData } from "@/lib/use-firebase-data";
import { useCutoffCountdown } from "@/lib/use-countdown";
import { firebaseSimulateCutoff } from "@/lib/firebase.functions";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Settings,
  Wallet,
  Users,
  UserCircle2,
  TrendingUp,
  Sparkles,
  ChevronRight,
  BadgeDollarSign,
  RefreshCw,
  Timer,
  FlaskConical,
} from "lucide-react";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => pageHead('Inicio', 'Tu saldo, inversiones y paquetes Nexora.'),
  component: Home,
});

const accents: Record<string, string> = {
  Starter: "from-sky-500 to-blue-700",
  Bronze: "from-amber-600 to-orange-800",
  Silver: "from-slate-300 to-slate-600",
  Gold: "from-yellow-400 to-amber-700",
  Platinum: "from-indigo-400 to-indigo-800",
  Diamond: "from-cyan-300 to-blue-700",
};

function Home() {
  const { user } = useAuth();
  const { data, error, loading: isRefreshing, refresh: fetchBalances } = useFirebaseData();
  const countdown = useCutoffCountdown();
  const simulateCutoff = useServerFn(firebaseSimulateCutoff);
  const [simulating, setSimulating] = useState(false);
  const packages = FIREBASE_PACKAGES;
  const email = user?.email ?? "";
  const available = data ? data.availableBalance.toFixed(2) : "—";
  const invested = data ? data.lockedBalance.toFixed(2) : "—";
  const earned = data ? data.earned.toFixed(2) : "—";

  const runSimulation = async () => {
    setSimulating(true);
    try {
      const result = await simulateCutoff();
      toast.success(`Corte simulado: ${result.credited.toFixed(2)} USDT acreditados.`);
      await fetchBalances();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo simular el corte.");
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-12">
      <div className="mx-auto max-w-md px-5 pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bienvenido</p>
              <p className="text-sm font-semibold truncate max-w-[180px]">{email}</p>
            </div>
          </div>
          <Link to="/profile" className="rounded-full bg-card p-2 hover:bg-secondary">
            <UserCircle2 className="h-6 w-6 text-muted-foreground" />
          </Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-border/60 bg-gradient-primary p-6 shadow-glow">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/70">
              Balance disponible
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={fetchBalances}
                disabled={isRefreshing}
                aria-label="Actualizar balance"
                title="Actualizar balance"
                className="grid h-8 w-8 place-items-center rounded-full bg-background/20 text-primary-foreground backdrop-blur transition hover:bg-background/30 disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
              <BadgeDollarSign className="h-4 w-4 text-primary-foreground/70" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight text-primary-foreground">{available}</span>
            <span className="text-sm font-semibold text-primary-foreground/80">USDT</span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-primary-foreground/80">
            <span>Invertido: {invested}</span>
            <span>· Ganado: {earned}</span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              to="/deposit"
              className="flex items-center justify-center gap-2 rounded-2xl bg-background/20 px-4 py-3 text-sm font-semibold text-primary-foreground backdrop-blur transition hover:bg-background/30"
            >
              <ArrowDownToLine className="h-4 w-4" /> Recargar
            </Link>
            <Link
              to="/withdraw"
              className="flex items-center justify-center gap-2 rounded-2xl bg-background/20 px-4 py-3 text-sm font-semibold text-primary-foreground backdrop-blur transition hover:bg-background/30"
            >
              <ArrowUpFromLine className="h-4 w-4" /> Retirar
            </Link>
          </div>
        </div>

        {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-4 rounded-2xl border border-primary/30 bg-card/60 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15">
              <Timer className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Próximo reparto de rendimientos en:</p>
              <p className="text-xl font-bold tabular-nums tracking-wide">{countdown}</p>
            </div>
            <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-semibold text-primary">8:00 PM VET</span>
          </div>
          {import.meta.env.DEV && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={runSimulation}
              disabled={simulating}
              className="mt-3 w-full gap-2 border-dashed"
            >
              <FlaskConical className="h-4 w-4" />
              {simulating ? "Simulando..." : "Simular corte de 8:00 PM"}
            </Button>
          )}
        </div>

        <div className="mt-6 grid grid-cols-4 gap-3">
          <QuickAction to="/wallet" Icon={Wallet} label="Billetera" />
          <QuickAction to="/referrals" Icon={Users} label="Referidos" />
          <QuickAction to="/earnings" Icon={TrendingUp} label="Ingresos" />
          <QuickAction to="/settings" Icon={Settings} label="Ajustes" />
        </div>

        {data && data.subscriptions.length > 0 && <section className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold">Mis inversiones</h2>
          {data.subscriptions.map(s => <div key={s.id} className="rounded-2xl border border-border bg-card p-4">
            <p className="font-semibold">{String(s.packageName)} · {Number(s.amountInvested)} USDT</p>
            <p className="mt-1 text-xs text-muted-foreground">{Number(s.daysCompleted ?? 0)}/42 días · {Number(s.dailyReturn)} USDT/día · {String(s.status)}</p>
          </div>)}
        </section>}
        <div className="mt-8 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Paquetes de inversión</h2>
            <p className="text-xs text-muted-foreground">5% diario · 42 días</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {packages.map((p) => {
            const dailyPct = Number(p.daily_interest) * 100;
            const total = Number(p.min_amount) * Number(p.daily_interest) * p.duration_days;
            return (
              <Link
                key={p.id}
                to="/packages/$id"
                params={{ id: p.id }}
                className="block rounded-2xl border border-border/60 bg-gradient-card p-4 shadow-card transition hover:border-primary/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${accents[p.name] ?? "from-sky-500 to-blue-700"} text-white font-bold`}
                    >
                      {p.name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold">{p.name}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {dailyPct}% diario · {p.duration_days} días
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold">
                      {Number(p.min_amount)} <span className="text-xs text-muted-foreground">USDT</span>
                    </p>
                    <p className="text-[10px] text-success">+{total} USDT</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3 text-xs">
                  <span className="text-muted-foreground">Suscribirme</span>
                  <ChevronRight className="h-4 w-4 text-primary" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ to, Icon, label }: { to: string; Icon: any; label: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-1.5 rounded-2xl border border-border/50 bg-card/60 p-3 text-center transition hover:border-primary/40"
    >
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <span className="text-[11px] font-medium">{label}</span>
    </Link>
  );
}
