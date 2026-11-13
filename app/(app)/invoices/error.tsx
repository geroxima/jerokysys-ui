"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, ServerCrash } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const UNAVAILABLE_STATUSES = new Set(["502", "503", "504"]);

export default function InvoicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const status = /HTTP (\d{3})/.exec(error.message)?.[1];
  const unavailable = status ? UNAVAILABLE_STATUSES.has(status) : false;
  const Icon = unavailable ? ServerCrash : AlertCircle;

  return (
    <div className="mx-auto w-full max-w-2xl px-8 py-16">
      <Alert variant="destructive">
        <Icon aria-hidden="true" />
        <AlertTitle className="flex flex-wrap items-center gap-2">
          {unavailable
            ? "Servicio de facturación no disponible"
            : "No se pudo cargar la facturación"}
          {status ? (
            <span className="rounded border border-destructive/30 px-1.5 py-0.5 font-mono text-[11px] font-normal tabular-nums">
              HTTP {status}
            </span>
          ) : null}
        </AlertTitle>
        <AlertDescription>
          {error.message ||
            "Ocurrió un error inesperado al consultar las facturas."}
          {unavailable ? (
            <span className="mt-2 block text-xs">
              El gateway no pudo comunicarse con el microservicio de
              facturación. Verificá que el servicio esté en línea y reintentá.
            </span>
          ) : null}
        </AlertDescription>
      </Alert>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={reset}>
          <RotateCcw aria-hidden="true" />
          Reintentar
        </Button>
        <Link
          href="/invoices"
          className={cn(
            buttonVariants({ variant: "outline", size: "default" }),
            "bg-background",
          )}
        >
          Volver al listado
        </Link>
      </div>
    </div>
  );
}
