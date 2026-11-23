"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ForbiddenPage } from "@/components/forbidden-page";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { InvoiceFormSkeleton } from "@/components/invoices/invoice-skeletons";
import { usePermissions } from "@/components/permission-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { todayIsoDate } from "@/lib/invoices/format";
import { getIssuerConfig } from "@/lib/invoices/issuer";
import { emptyInvoiceFormValues } from "@/lib/invoices/validation";
import { useValidTaxStamps } from "@/lib/query/invoices";

export default function NewInvoicePage() {
  const { can } = usePermissions();
  const issuer = getIssuerConfig();
  const taxStampsQuery = useValidTaxStamps();
  const taxStamps = taxStampsQuery.data ?? [];
  const fallbackTaxStampId = taxStamps[0] ? String(taxStamps[0].id) : "";

  if (taxStampsQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-8 py-10">
        <InvoiceFormSkeleton />
      </div>
    );
  }

  if (!can("invoices:write")) {
    return (
      <div className="mx-auto w-full max-w-5xl px-8 py-10">
        <ForbiddenPage />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-8 py-10">
      <div className="flex flex-col gap-5">
        <Link
          href="/invoices"
          className="inline-flex w-fit items-center gap-1.5 rounded text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver a facturas
        </Link>

        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Nueva factura
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Elegí el alumno, los conceptos y el timbrado. El número se asigna
              al guardar.
            </p>
          </div>
        </header>

        {taxStamps.length === 0 ? (
          <Alert>
            <AlertTitle>No hay timbrados vigentes</AlertTitle>
            <AlertDescription>
              Cargá un timbrado vigente antes de emitir facturas.
            </AlertDescription>
          </Alert>
        ) : null}

        <InvoiceForm
          key="new"
          mode="create"
          initialValues={emptyInvoiceFormValues(
            todayIsoDate(),
            fallbackTaxStampId,
          )}
          cancelHref="/invoices"
          issuer={issuer}
          taxStamps={taxStamps}
        />
      </div>
    </div>
  );
}
