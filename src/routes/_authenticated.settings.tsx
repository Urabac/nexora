import { pageHead } from "@/lib/page-head";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Bell, Globe, Lock, HelpCircle, FileText, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => pageHead('Ajustes', 'Preferencias de tu cuenta Nexora.'),
  component: Settings,
});

const items = [
  { Icon: Bell, label: "Notificaciones" },
  { Icon: Lock, label: "Seguridad y contraseña" },
  { Icon: Globe, label: "Idioma", value: "Español" },
  { Icon: FileText, label: "Términos y condiciones" },
  { Icon: HelpCircle, label: "Ayuda y soporte" },
];

function Settings() {
  return (
    <AppShell title="Ajustes">
      <div className="space-y-2">
        {items.map(({ Icon, label, value }) => (
          <button
            key={label}
            onClick={() => alert(`${label} — próximamente`)}
            className="flex w-full items-center justify-between rounded-2xl border border-border/60 bg-card/60 p-4 text-left transition hover:border-primary/40"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{label}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              {value && <span className="text-xs">{value}</span>}
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">Nexora v1.0.0</p>
    </AppShell>
  );
}
