import { pageHead } from "@/lib/page-head";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, Sparkles } from "lucide-react";
import { PrimaryButton } from "@/components/AppShell";
import { Field } from "./login";
import { useServerFn } from "@tanstack/react-start";
import { firebaseAuthenticate } from "@/lib/firebase.functions";
import { saveSession } from "@/lib/firebase-session";

export const Route = createFileRoute("/register")({
  head: () => pageHead('Crear cuenta', 'Registra tu cuenta Nexora para consultar paquetes y saldo.'),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const authenticate = useServerFn(firebaseAuthenticate);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const session = await authenticate({ data: { email: email.trim(), password, register: true } });
      saveSession(session);
      await navigate({ to: "/home" });
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo crear la cuenta."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="mx-auto max-w-md px-5 pt-10 pb-12">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">Nexora</span>
        </Link>

        <div className="mt-10">
          <h1 className="text-3xl font-bold tracking-tight">Crea tu cuenta</h1>
          <p className="mt-2 text-sm text-muted-foreground">Comienza a invertir desde 20 USDT.</p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Field icon={<Mail className="h-4 w-4" />} type="email" placeholder="tu@correo.com" value={email} onChange={setEmail} required />
          <Field icon={<Lock className="h-4 w-4" />} type="password" placeholder="Contraseña (mín. 6)" value={password} onChange={setPassword} required />

          {error && <p className="text-xs text-destructive">{error}</p>}

          <PrimaryButton type="submit" disabled={loading}>{loading ? "Creando…" : "Crear cuenta"}</PrimaryButton>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
