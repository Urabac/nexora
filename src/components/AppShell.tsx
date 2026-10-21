import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
  back?: boolean;
  action?: ReactNode;
}

export function AppShell({ title, children, back = true, action }: Props) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-hero text-foreground">
      <div className="mx-auto flex max-w-md flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-background/80 px-4 py-4 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            {back && (
              <button
                onClick={() => router.history.back()}
                className="rounded-full bg-card p-2 transition hover:bg-secondary"
                aria-label="Volver"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          </div>
          {action}
        </header>
        <main className="flex-1 px-4 pb-24 pt-6">{children}</main>
      </div>
    </div>
  );
}

export function PrimaryButton({
  children,
  to,
  onClick,
  type = "button",
  variant = "primary",
  full = true,
  disabled = false,
}: {
  children: ReactNode;
  to?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "ghost" | "success";
  full?: boolean;
  disabled?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all active:scale-[0.98]";
  const styles =
    variant === "primary"
      ? "bg-gradient-primary text-primary-foreground shadow-glow hover:brightness-110"
      : variant === "success"
      ? "bg-success text-success-foreground hover:brightness-110"
      : "bg-card text-foreground border border-border hover:bg-secondary";
  const cls = `${base} ${styles} ${full ? "w-full" : ""}`;
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled} className={`${cls} disabled:opacity-50 disabled:pointer-events-none`}>{children}</button>;
}
