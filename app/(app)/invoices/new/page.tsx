import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AccessDenied } from "@/components/access-denied";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { InvoiceFormSkeleton } from "@/components/invoices/invoice-skeletons";
import { requireSession } from "@/lib/auth";
import { getNextInvoiceNumber } from "@/lib/invoices/api";
import { todayIsoDate } from "@/lib/invoices/format";
import { getIssuerConfig } from "@/lib/invoices/issuer";
import { canAccessInvoices } from "@/lib/invoices/permissions";
import { emptyInvoiceFormValues } from "@/lib/invoices/validation";

export const metadata: Metadata = {
  title: "Nueva factura — JerokySys",
};

export default function NewInvoicePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-8 py-10">
      <Suspense fallback={<InvoiceFormSkeleton />}>
        <NewInvoiceContent />
      </Suspense>
    </div>
  );
}

async function NewInvoiceContent() {
  const session = await requireSession();

  if (!canAccessInvoices(session.role)) {
    return <AccessDenied />;
  }

  const { issuer, timbrados } = getIssuerConfig();
  const fallback = timbrados[0];

  // La vista previa es best-effort: si la API no responde, el número se genera
  // igualmente al guardar.
  const previews = await Promise.all(
    timbrados.map(async (option) => {
      try {
        return [
          option.key,
          await getNextInvoiceNumber(option.timbrado, option.serie),
        ] as const;
      } catch {
        return null;
      }
    }),
  );

  const numberByTimbrado = Object.fromEntries(
    previews.filter((entry): entry is readonly [string, string] => entry !== null),
  );

  return (
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
          <h1 className="text-2xl font-semibold tracking-tight">Nueva factura</h1>
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
        numberByTimbrado={numberByTimbrado}
      />
    </div>
  );
}
