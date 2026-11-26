import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function InvoiceNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 px-8 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <FileQuestion className="size-6" aria-hidden="true" />
      </span>
      <h1 className="text-xl font-semibold tracking-tight">
        Factura no encontrada
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        La factura que buscás no existe, fue eliminada o el enlace es
        incorrecto.
      </p>
      <Link
        href="/invoices"
        className={cn(buttonVariants({ size: "lg" }), "mt-1 h-9")}
      >
        Volver a facturas
      </Link>
    </div>
  );
}
