import { pageHead } from "@/lib/page-head";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, PrimaryButton } from "@/components/AppShell";
import { Mail, Shield, LogOut, BadgeCheck } from "lucide-react";
import { saveSession } from "@/lib/firebase-session";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => pageHead('Mi perfil', 'Identificación y sesión de tu cuenta Nexora.'),
  component: Profile,
});

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const email = user?.email ?? "";

  const logout = async () => {
    saveSession(null);
    navigate({ to: "/" });
  };

  return (
    <AppShell title="Mi perfil">
      <div className="flex flex-col items-center rounded-3xl border border-border/60 bg-gradient-card p-6 shadow-card">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-primary text-3xl font-bold text-primary-foreground shadow-glow">
          {email[0]?.toUpperCase()}
        </div>
        <div className="mt-3 flex items-center gap-1">
          <p className="font-semibold">{email}</p>
          <BadgeCheck className="h-4 w-4 text-primary" />
        </div>
        <p className="text-xs text-muted-foreground">{email}</p>
      </div>

      <div className="mt-6 space-y-2">
        <Row Icon={Mail} label="Correo" value={email} />
        <Row Icon={Shield} label="ID de cuenta" value={user?.uid ?? ""} />
      </div>

      <div className="mt-8 space-y-2">
        <PrimaryButton variant="ghost" onClick={logout}>
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </PrimaryButton>
      </div>
    </AppShell>
  );
}

function Row({ Icon, label, value }: { Icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/60 p-4">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{value}</span>
    </div>
  );
}
