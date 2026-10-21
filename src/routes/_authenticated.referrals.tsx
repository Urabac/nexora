import { pageHead } from "@/lib/page-head";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PrimaryButton } from "@/components/AppShell";
import { Copy, Share2, Users, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/referrals")({
  head: () => pageHead('Mis referidos', 'Referidos de tu cuenta Nexora.'),
  component: Referrals,
});

function Referrals() {
  const [copied, setCopied] = useState(false);
  const link = "https://nexora.app/r/USER123";

  return (
    <AppShell title="Mis referidos">
      <div className="rounded-3xl border border-border/60 bg-gradient-card p-5 shadow-card">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total de referidos</p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat label="Ingresos referidos" value="0.00 USDT" />
          <Stat label="Comisión" value="10%" />
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-border/60 bg-card/60 p-5">
        <p className="text-sm font-semibold">Tu enlace de referido</p>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-2.5">
          <span className="truncate text-xs font-mono">{link}</span>
          <button
            onClick={() => { navigator.clipboard?.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className="shrink-0 rounded-lg bg-primary/15 p-2 text-primary"
          >
            {copied ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => navigator.share?.({ url: link, title: "Únete a Nexora" }).catch(() => {})}>
            <Share2 className="h-4 w-4" /> Compartir
          </PrimaryButton>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Gana <span className="font-semibold text-foreground">10% de comisión</span> por cada suscripción de tus referidos.
      </p>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background/40 p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}
