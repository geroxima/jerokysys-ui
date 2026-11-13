"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AccessDenied } from "@/components/access-denied";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { InvoiceFormSkeleton } from "@/components/invoices/invoice-skeletons";
import { todayIsoDate } from "@/lib/invoices/format";
import { getIssuerConfig } from "@/lib/invoices/issuer";
import { canAccessInvoices } from "@/lib/invoices/permissions";
import { emptyInvoiceFormValues } from "@/lib/invoices/validation";
import { useNextInvoiceNumbers } from "@/lib/query/invoices";
import { useSession } from "@/lib/query/session";

export default function NewInvoicePage() {
  const sessionQuery = useSession();
  const { issuer, timbrados } = getIssuerConfig();
  const fallback = timbrados[0];
  const previews = useNextInvoiceNumbers(timbrados);

  if (sessionQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-8 py-10">
        <InvoiceFormSkeleton />
      </div>
    );
  }

  if (!canAccessInvoices(sessionQuery.data?.role)) {
    return (
      <div className="mx-auto w-full max-w-5xl px-8 py-10">
        <AccessDenied />
      </div>
    );
  }

  if (previews.isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-8 py-10">
        <InvoiceFormSkeleton />
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
              El número se asigna automáticamente según el timbrado elegido.
            </p>
          </div>
        </header>

        <InvoiceForm
          key="new"
          mode="create"
          initialValues={emptyInvoiceFormValues(
            todayIsoDate(),
            fallback.timbrado,
            fallback.serie,
          )}
          cancelHref="/invoices"
          issuer={issuer}
          timbrados={timbrados}
          numberByTimbrado={previews.data ?? {}}
        />
      </div>
    </div>
  );
}
