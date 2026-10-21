import { pageHead } from "@/lib/page-head";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, ShieldCheck, Coins, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => pageHead('Nexora — Inversiones en USDT', 'Cuenta, saldo y paquetes de inversión en USDT.'),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="mx-auto max-w-md px-5 pb-16 pt-10">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">Nexora</span>
          </div>
          <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Entrar
          </Link>
        </nav>

        <section className="mt-16 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Plataforma activa 24/7
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight">
            Multiplica tu <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">USDT</span> con interés compuesto
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Suscríbete a paquetes de inversión y gana <strong className="text-foreground">5% diario durante 42 días</strong>. Simple, transparente y a tu ritmo.
          </p>

          <div className="mt-8 space-y-3">
            <Link
              to="/register"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 py-4 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              Crear cuenta gratis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="flex w-full items-center justify-center rounded-2xl border border-border bg-card/60 px-5 py-4 text-sm font-semibold backdrop-blur"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </section>

        <section className="mt-14 grid gap-3">
          {[
            { Icon: TrendingUp, title: "5% diario", desc: "Rendimientos consistentes cada 24h" },
            { Icon: ShieldCheck, title: "Seguro y transparente", desc: "Tus fondos en USDT, sin sorpresas" },
            { Icon: Coins, title: "Desde 20 USDT", desc: "Empieza pequeño, crece grande" },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-gradient-card p-4 shadow-card">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </section>


      </div>
    </div>
  );
}
