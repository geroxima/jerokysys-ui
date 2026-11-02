import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AccessDenied } from "@/components/access-denied";
import { InvoiceActions } from "@/components/invoices/invoice-actions";
import { InvoiceDetailSkeleton } from "@/components/invoices/invoice-skeletons";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { InvoiceTotals } from "@/components/invoices/invoice-totals";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireSession } from "@/lib/auth";
import {
  getInvoice,
  isNotFound,
  isUnauthorized,
} from "@/lib/invoices/api";
import {
  formatCurrency,
  formatDate,
  formatLongDate,
  formatMonth,
  lineTotal,
  lineVat,
  parseConceptToken,
  stripConceptToken,
} from "@/lib/invoices/format";
import { SALE_CONDITION_LABELS } from "@/lib/invoices/labels";
import { canAccessInvoices } from "@/lib/invoices/permissions";
import type { Invoice, InvoiceLine } from "@/lib/invoices/types";

export const metadata: Metadata = {
  title: "Detalle de factura — JerokySys",
};

type InvoiceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-8 py-10">
      <Suspense fallback={<InvoiceDetailSkeleton />}>
        <InvoiceDetailContent params={params} />
      </Suspense>
    </div>
  );
}

async function InvoiceDetailContent({ params }: InvoiceDetailPageProps) {
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

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/invoices"
        className="inline-flex w-fit items-center gap-1.5 rounded text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver a facturas
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight tabular-nums">
              {invoice.invoiceNumber}
            </h1>
            <InvoiceStatusBadge
              status={invoice.paymentStatus}
              className="h-6 px-2.5"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {invoice.businessName} · RUC {invoice.taxId}
          </p>
        </div>

        <InvoiceActions
          variant="buttons"
          invoiceId={invoice.id}
          invoiceNumber={invoice.invoiceNumber}
          status={invoice.paymentStatus}
        />
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos de la factura</CardTitle>
              <CardDescription>
                Información fiscal de la cabecera y del cliente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DataItem label="Emisión">
                  {formatLongDate(invoice.issueDate)}
                </DataItem>
                <DataItem label="Condición de venta">
                  {SALE_CONDITION_LABELS[invoice.saleCondition]}
                </DataItem>
                <DataItem label="Timbrado">{invoice.timbrado}</DataItem>
                <DataItem label="Alumno">#{invoice.studentId}</DataItem>
                <DataItem label="Estado del cobro">
                  <InvoiceStatusBadge status={invoice.paymentStatus} />
                </DataItem>
                <DataItem label="Líneas">
                  {invoice.details.length}{" "}
                  {invoice.details.length === 1 ? "línea" : "líneas"}
                </DataItem>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Líneas de detalle</CardTitle>
              <CardDescription>
                El IVA de cada línea se calcula como monto × tasa / 100.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invoice.details.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  La factura no tiene líneas registradas.
                </p>
              ) : (
                <Table>
                  <TableCaption className="sr-only">
                    Líneas de la factura {invoice.invoiceNumber}.
                  </TableCaption>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-2 text-xs tracking-wide text-muted-foreground uppercase">
                        Concepto
                      </TableHead>
                      <TableHead className="px-2 text-xs tracking-wide text-muted-foreground uppercase">
                        Mes
                      </TableHead>
                      <TableHead className="px-2 text-right text-xs tracking-wide text-muted-foreground uppercase">
                        Monto
                      </TableHead>
                      <TableHead className="px-2 text-right text-xs tracking-wide text-muted-foreground uppercase">
                        IVA
                      </TableHead>
                      <TableHead className="px-2 text-right text-xs tracking-wide text-muted-foreground uppercase">
                        Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.details.map((line, index) => (
                      <InvoiceLineRow
                        key={line.id ?? `${invoice.id}-${index}`}
                        line={line}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-20">
          <Card>
            <CardHeader>
              <CardTitle>Totales</CardTitle>
              <CardDescription>
                Calculados por el servidor a partir de las líneas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceTotals lines={invoice.details} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seguimiento</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Estado</span>
                <InvoiceStatusBadge status={invoice.paymentStatus} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Emisión</span>
                <span className="tabular-nums">
                  {formatDate(invoice.issueDate)}
                </span>
              </div>
              <p className="pt-1 text-xs text-muted-foreground">
                {invoice.paymentStatus === "PENDING"
                  ? "Mientras esté pendiente podés editar la factura, marcarla como pagada o anularla."
                  : invoice.paymentStatus === "PAID"
                    ? "La factura está pagada. El estado es final y los datos quedan bloqueados."
                    : "La factura está anulada. El estado es final y los datos quedan bloqueados."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DataItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

function InvoiceLineRow({ line }: { line: InvoiceLine }) {
  const token = parseConceptToken(line.description);
  const description = stripConceptToken(line.description) || line.description;

  return (
    <TableRow>
      <TableCell className="max-w-[360px] px-2 py-2.5 whitespace-normal">
        <div className="flex flex-col items-start gap-1">
          <span>{description}</span>
          {token ? (
            <Badge variant="secondary" className="h-5 font-normal">
              {token.label} #{token.id}
            </Badge>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="px-2 py-2.5 text-muted-foreground">
        {formatMonth(line.correspondingMonth)}
      </TableCell>
      <TableCell className="px-2 py-2.5 text-right tabular-nums">
        {formatCurrency(line.amount)}
      </TableCell>
      <TableCell className="px-2 py-2.5 text-right tabular-nums">
        <span className="block">{formatCurrency(lineVat(line))}</span>
        <span className="text-xs text-muted-foreground">
          {line.vatRate === 0 ? "Exento" : `${line.vatRate}%`}
        </span>
      </TableCell>
      <TableCell className="px-2 py-2.5 text-right font-medium tabular-nums">
        {formatCurrency(lineTotal(line))}
      </TableCell>
    </TableRow>
  );
}
