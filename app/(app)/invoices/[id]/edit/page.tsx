import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";

import { AccessDenied } from "@/components/access-denied";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { InvoiceFormSkeleton } from "@/components/invoices/invoice-skeletons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { requireSession } from "@/lib/auth";
import { getInvoice, isNotFound, isUnauthorized } from "@/lib/invoices/api";
import { invoiceToFormValues } from "@/lib/invoices/form-values";
import { getIssuerConfig } from "@/lib/invoices/issuer";
import { INVOICE_STATUS_LABELS } from "@/lib/invoices/labels";
import { canAccessInvoices } from "@/lib/invoices/permissions";
import type { Invoice, InvoiceTimbrado } from "@/lib/invoices/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Editar factura — JerokySys",
};

type EditInvoicePageProps = {
  params: Promise<{ id: string }>;
};

export default function EditInvoicePage({ params }: EditInvoicePageProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-8 py-10">
      <Suspense fallback={<InvoiceFormSkeleton />}>
        <EditInvoiceContent params={params} />
      </Suspense>
    </div>
  );
}

async function EditInvoiceContent({ params }: EditInvoicePageProps) {
  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  const session = await requireSession();

  if (!canAccessInvoices(session.role)) {
    return <AccessDenied />;
  }

  let invoice: Invoice;
  try {
    invoice = await getInvoice(id);
  } catch (error) {
    if (isNotFound(error)) {
      notFound();
    }
    if (isUnauthorized(error)) {
      redirect("/login");
    }
    throw error;
  }

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
    );
  }

  const initialValues = invoiceToFormValues(invoice);
  const { issuer, timbrados } = getIssuerConfig();
  const currentKey = `${initialValues.timbrado}-${initialValues.serie}`;

  // Si el timbrado de la factura ya no está configurado, lo agregamos como
  // opción sintética para que el encabezado muestre el dato real.
  const options: InvoiceTimbrado[] = timbrados.some(
    (option) => option.key === currentKey,
  )
    ? timbrados
    : [
        {
          timbrado: initialValues.timbrado,
          serie: initialValues.serie,
          label: "Timbrado de la factura",
          address: "",
          key: currentKey,
        },
        ...timbrados,
      ];

  return (
    <div className="flex flex-col gap-5">
      {backLink}

      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Editar factura
        </h1>
        <p className="mt-2 text-sm text-muted-foreground tabular-nums">
          {invoice.invoiceNumber} · {invoice.businessName}
        </p>
      </header>

      <InvoiceForm
        key={invoice.id}
        mode="edit"
        invoiceId={invoice.id}
        initialValues={initialValues}
        cancelHref={`/invoices/${invoice.id}`}
        issuer={issuer}
        timbrados={options}
        numberByTimbrado={{}}
        fixedInvoiceNumber={invoice.invoiceNumber}
        status={invoice.paymentStatus}
      />
    </div>
  );
}
