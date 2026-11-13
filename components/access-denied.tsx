import { ShieldAlert } from "lucide-react";

export function AccessDenied({
  message = "No tenés permisos para acceder a esta sección. Pedile acceso a un administrador.",
}: {
  message?: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 rounded-xl border border-border bg-card px-8 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="size-6" aria-hidden="true" />
      </span>
      <h1 className="text-xl font-semibold tracking-tight">Sin permisos</h1>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
