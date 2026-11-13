"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, RotateCw } from "lucide-react";

import { AccessDenied } from "@/components/access-denied";
import { InvoiceActions } from "@/components/invoices/invoice-actions";
import { InvoiceDetailSkeleton } from "@/components/invoices/invoice-skeletons";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { InvoiceTotals } from "@/components/invoices/invoice-totals";
import { NotFoundPage } from "@/components/not-found-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { isNotFound } from "@/lib/api-client";
import {
  formatCurrency,
  formatDate,
  formatLongDate,
  formatMonth,
  lineSubtotal,
  vatTypeLabel,
} from "@/lib/invoices/format";
import { SALE_CONDITION_LABELS } from "@/lib/invoices/labels";
import { canAccessInvoices } from "@/lib/invoices/permissions";
import type { InvoiceLine } from "@/lib/invoices/types";
import { useInvoice } from "@/lib/query/invoices";
import { useSession } from "@/lib/query/session";

export default function InvoiceDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-7xl px-8 py-10">
          <InvoiceDetailSkeleton />
        </div>
      }
    >
      <InvoiceDetailContent />
    </Suspense>
  );
}

function InvoiceDetailContent() {
  const params = useParams<{ id: string }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(rawId);
  const validId = Number.isInteger(id) && id > 0;

  const sessionQuery = useSession();
  const invoiceQuery = useInvoice(validId ? id : null);

  if (sessionQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-8 py-10">
        <InvoiceDetailSkeleton />
      </div>
    );
  }

  if (!canAccessInvoices(sessionQuery.data?.role)) {
    return (
      <div className="mx-auto w-full max-w-7xl px-8 py-10">
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
      <div className="mx-auto w-full max-w-7xl px-8 py-10">
        <InvoiceDetailSkeleton />
      </div>
    );
  }

  if (invoiceQuery.isError) {
    if (isNotFound(invoiceQuery.error)) {
      return (
        <NotFoundPage
          title="Factura no encontrada"
          description="La factura que buscás no existe o fue eliminada."
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

  return (
    <div className="mx-auto w-full max-w-7xl px-8 py-10">
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
              {invoice.customerName} · RUC {invoice.customerRuc}
            </p>
            <p className="text-xs text-muted-foreground">
              Alumno #{invoice.studentId ?? "—"} · Timbrado{" "}
              {invoice.stampNumber} · Establecimiento{" "}
              {invoice.establishmentCode}-{invoice.expeditionPoint}
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
                  Información fiscal de la cabecera, del cliente y del emisor.
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
                  <DataItem label="Vencimiento">
                    {invoice.dueDate ? formatDate(invoice.dueDate) : "—"}
                  </DataItem>
                  <DataItem label="Alumno">
                    {invoice.studentId ? `#${invoice.studentId}` : "—"}
                  </DataItem>
                  <DataItem label="Timbrado">
                    {invoice.stampNumber}
                  </DataItem>
                  <DataItem label="Vigencia del timbrado">
                    {formatDate(invoice.stampValidFrom)} al{" "}
                    {formatDate(invoice.stampValidUntil)}
                  </DataItem>
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
                <CardTitle>Emisor</CardTitle>
                <CardDescription>
                  Datos guardados al momento de emitir la factura.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <DataItem label="Razón social">{invoice.issuerName}</DataItem>
                  <DataItem label="RUC">{invoice.issuerRuc}</DataItem>
                  <DataItem label="Actividad">{invoice.issuerActivity}</DataItem>
                  <DataItem label="Dirección">{invoice.issuerAddress}</DataItem>
                  <DataItem label="Teléfono">
                    {invoice.issuerPhone ?? "—"}
                  </DataItem>
                  <DataItem label="Email">
                    {invoice.issuerEmail ?? "—"}
                  </DataItem>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Líneas de detalle</CardTitle>
                <CardDescription>
                  Los valores de venta incluyen IVA. El IVA se liquida sobre
                  cada tratamiento.
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
                          Cant.
                        </TableHead>
                        <TableHead className="px-2 text-right text-xs tracking-wide text-muted-foreground uppercase">
                          Precio unit.
                        </TableHead>
                        <TableHead className="px-2 text-right text-xs tracking-wide text-muted-foreground uppercase">
                          IVA
                        </TableHead>
                        <TableHead className="px-2 text-right text-xs tracking-wide text-muted-foreground uppercase">
                          Valor de venta
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
                <InvoiceTotals
                  totals={{
                    exemptAmount: invoice.exemptAmount,
                    sales5Amount: invoice.sales5Amount,
                    sales10Amount: invoice.sales10Amount,
                    iva5Amount: invoice.iva5Amount,
                    iva10Amount: invoice.iva10Amount,
                    totalAmount: invoice.totalAmount,
                    totalIva: invoice.totalIva,
                  }}
                />
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
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Timbrado</span>
                  <span className="tabular-nums">{invoice.stampNumber}</span>
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
  return (
    <TableRow>
      <TableCell className="max-w-[360px] px-2 py-2.5 whitespace-normal">
        <div className="flex flex-col items-start gap-1">
          <span>{line.description}</span>
          {line.conceptType ? (
            <Badge variant="secondary" className="h-5 font-normal">
              {line.conceptType === "CUOTA"
                ? "Cuota"
                : line.conceptType === "MATRICULA"
                  ? "Matrícula"
                  : line.conceptType === "EXAMEN"
                    ? "Examen"
                    : "Otro"}
              {line.conceptId ? ` #${line.conceptId}` : ""}
            </Badge>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="px-2 py-2.5 text-muted-foreground">
        {formatMonth(line.correspondingMonth)}
      </TableCell>
      <TableCell className="px-2 py-2.5 text-right tabular-nums">
        {line.quantity}
      </TableCell>
      <TableCell className="px-2 py-2.5 text-right tabular-nums">
        {formatCurrency(line.unitPrice)}
      </TableCell>
      <TableCell className="px-2 py-2.5 text-right text-muted-foreground">
        {vatTypeLabel(line.vatType)}
      </TableCell>
      <TableCell className="px-2 py-2.5 text-right font-medium tabular-nums">
        {formatCurrency(line.subtotal || lineSubtotal(line))}
      </TableCell>
    </TableRow>
  );
}
