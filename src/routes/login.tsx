import { pageHead } from "@/lib/page-head";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, Sparkles } from "lucide-react";
import { PrimaryButton } from "@/components/AppShell";
import { useServerFn } from "@tanstack/react-start";
import { firebaseAuthenticate } from "@/lib/firebase.functions";
import { saveSession } from "@/lib/firebase-session";

export const Route = createFileRoute("/login")({
  head: () => pageHead('Iniciar sesión', 'Accede a tu cuenta Nexora y consulta tu saldo en USDT.'),
  component: Login,
});

function Login() {
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
      const session = await authenticate({ data: { email: email.trim(), password, register: false } });
      saveSession(session);
      await navigate({ to: "/home" });
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo iniciar sesión."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="mx-auto max-w-md px-5 pt-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">Nexora</span>
        </Link>

        <div className="mt-10">
          <h1 className="text-3xl font-bold tracking-tight">Bienvenido de vuelta</h1>
          <p className="mt-2 text-sm text-muted-foreground">Inicia sesión para seguir invirtiendo.</p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Field icon={<Mail className="h-4 w-4" />} type="email" placeholder="tu@correo.com" value={email} onChange={setEmail} required />
          <Field icon={<Lock className="h-4 w-4" />} type="password" placeholder="Contraseña" value={password} onChange={setPassword} required />

          {error && <p className="text-xs text-destructive">{error}</p>}

          <PrimaryButton type="submit" disabled={loading}>{loading ? "Entrando…" : "Iniciar sesión"}</PrimaryButton>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Aún no tienes cuenta?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}

export function Field({
  icon, type = "text", placeholder, value, onChange, required,
}: { icon: React.ReactNode; type?: string; placeholder: string; value?: string; onChange?: (v: string) => void; required?: boolean }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3.5 focus-within:border-primary">
      <span className="text-muted-foreground">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}
