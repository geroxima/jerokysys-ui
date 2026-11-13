"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, ServerCrash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const UNAVAILABLE_STATUSES = new Set(["502", "503", "504"]);

export function InvoiceLoadError({
  message,
  className,
  onRetry,
}: {
  message: string;
  className?: string;
  onRetry?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const status = /HTTP (\d{3})/.exec(message)?.[1];
  const unavailable = status ? UNAVAILABLE_STATUSES.has(status) : false;

  function retry() {
    startTransition(() => {
      if (onRetry) {
        onRetry();
        return;
      }
      router.refresh();
    });
  }

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-card px-6 py-12 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ServerCrash className="size-6" aria-hidden="true" />
      </span>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <h2 className="text-base font-medium">
          {unavailable
            ? "Servicio de facturación no disponible"
            : "No se pudieron cargar las facturas"}
        </h2>
        {status ? (
          <span className="rounded border border-destructive/30 px-1.5 py-0.5 font-mono text-[11px] text-destructive tabular-nums">
            HTTP {status}
          </span>
        ) : null}
      </div>

      <p className="max-w-md text-sm text-muted-foreground">{message}</p>

      {unavailable ? (
        <p className="max-w-md text-xs text-muted-foreground">
          El gateway no pudo comunicarse con el microservicio de facturación.
          Verificá que el servicio esté en línea y reintentá.
        </p>
      ) : null}

      <Button
        type="button"
        onClick={retry}
        disabled={pending}
        className="mt-1"
      >
        {pending ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <RefreshCw aria-hidden="true" />
        )}
        {pending ? "Reintentando…" : "Reintentar"}
      </Button>
    </div>
  );
}
