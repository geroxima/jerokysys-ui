"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Info, RotateCw } from "lucide-react";

import { AccessDenied } from "@/components/access-denied";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { InvoiceFormSkeleton } from "@/components/invoices/invoice-skeletons";
import { NotFoundPage } from "@/components/not-found-page";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { isNotFound } from "@/lib/api-client";
import { invoiceToFormValues } from "@/lib/invoices/form-values";
import { INVOICE_STATUS_LABELS } from "@/lib/invoices/labels";
import { canAccessInvoices } from "@/lib/invoices/permissions";
import type { IssuerInfo, TaxStamp } from "@/lib/invoices/types";
import { useInvoice } from "@/lib/query/invoices";
import { useSession } from "@/lib/query/session";
import { cn } from "@/lib/utils";

export default function EditInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-5xl px-8 py-10">
          <InvoiceFormSkeleton />
        </div>
      }
    >
      <EditInvoiceContent />
    </Suspense>
  );
}

function EditInvoiceContent() {
  const params = useParams<{ id: string }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(rawId);
  const validId = Number.isInteger(id) && id > 0;

  const sessionQuery = useSession();
  const invoiceQuery = useInvoice(validId ? id : null);

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

  if (!validId) {
    return (
      <NotFoundPage
        title="Factura no encontrada"
        description="El identificador de la factura no es válido."
        href="/invoices"
        actionLabel="Volver a facturas"
      />
    );
  }

  if (invoiceQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-8 py-10">
        <InvoiceFormSkeleton />
      </div>
    );
  }

  if (invoiceQuery.isError) {
    if (isNotFound(invoiceQuery.error)) {
      return (
        <NotFoundPage
          title="Factura no encontrada"
          description="La factura que querés editar no existe o fue eliminada."
          href="/invoices"
          actionLabel="Volver a facturas"
        />
      );
    }

    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 px-8 py-16 text-center">
        <p className="text-sm font-medium">No se pudo cargar la factura</p>
        <p className="text-xs text-muted-foreground">
          {invoiceQuery.error instanceof Error
            ? invoiceQuery.error.message
            : "Intentá de nuevo."}
        </p>
        <Button variant="outline" size="sm" onClick={() => invoiceQuery.refetch()}>
          <RotateCw className="size-4" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (!invoiceQuery.data) {
    return (
      <NotFoundPage
        title="Factura no encontrada"
        description="La factura que buscás no existe o fue eliminada."
        href="/invoices"
        actionLabel="Volver a facturas"
      />
    );
  }

  const invoice = invoiceQuery.data;
  const backLink = (
    <Link
      href={`/invoices/${invoice.id}`}
      className="inline-flex w-fit items-center gap-1.5 rounded text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Volver al detalle
    </Link>
  );

  if (invoice.paymentStatus !== "PENDING") {
    return (
      <div className="mx-auto w-full max-w-5xl px-8 py-10">
        <div className="flex flex-col gap-6">
          {backLink}
          <header>
            <h1 className="text-2xl font-semibold tracking-tight">
              Editar factura
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {invoice.invoiceNumber}
            </p>
          </header>

          <Alert>
            <Info aria-hidden="true" />
            <AlertTitle>Esta factura no se puede editar</AlertTitle>
            <AlertDescription>
              Solo las facturas pendientes admiten cambios. La factura está{" "}
              {INVOICE_STATUS_LABELS[invoice.paymentStatus].toLowerCase()}.
            </AlertDescription>
          </Alert>

          <div>
            <Link
              href={`/invoices/${invoice.id}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-9 bg-background",
              )}
            >
              Ir al detalle
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const issuer: IssuerInfo = {
    name: invoice.issuerName,
    ruc: invoice.issuerRuc,
    activity: invoice.issuerActivity,
    phone: invoice.issuerPhone ?? "",
    address: invoice.issuerAddress,
    email: invoice.issuerEmail ?? "",
  };

  const taxStamps: TaxStamp[] = [
    {
      id: invoice.taxStampId,
      businessRuc: invoice.issuerRuc,
      stampNumber: invoice.stampNumber,
      establishmentCode: invoice.establishmentCode,
      expeditionPoint: invoice.expeditionPoint,
      validFrom: invoice.stampValidFrom,
      validUntil: invoice.stampValidUntil,
      active: true,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-8 py-10">
      <div className="flex flex-col gap-5">
        {backLink}

        <header>
          <h1 className="text-2xl font-semibold tracking-tight">
            Editar factura
          </h1>
          <p className="mt-2 text-sm text-muted-foreground tabular-nums">
            {invoice.invoiceNumber} · {invoice.customerName}
          </p>
        </header>

        <InvoiceForm
          key={invoice.id}
          mode="edit"
          invoiceId={invoice.id}
          initialValues={invoiceToFormValues(invoice)}
          cancelHref={`/invoices/${invoice.id}`}
          issuer={issuer}
          taxStamps={taxStamps}
          fixedInvoiceNumber={invoice.invoiceNumber}
          status={invoice.paymentStatus}
        />
      </div>
    </div>
  );
}
