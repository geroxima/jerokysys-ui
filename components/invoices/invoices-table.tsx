import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { InvoiceActions } from "@/components/invoices/invoice-actions";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCurrency,
  formatDate,
  invoiceTotal,
} from "@/lib/invoices/format";
import { SALE_CONDITION_LABELS } from "@/lib/invoices/labels";
import { invoiceHref } from "@/lib/invoices/query";
import type {
  Invoice,
  InvoiceQuery,
  InvoiceSortField,
} from "@/lib/invoices/types";
import { cn } from "@/lib/utils";

function SortHeader({
  field,
  label,
  query,
  sortable,
  align = "left",
}: {
  field: InvoiceSortField;
  label: string;
  query: InvoiceQuery;
  sortable: boolean;
  align?: "left" | "right";
}) {
  const className = cn(
    "h-9 px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase",
    align === "right" && "text-right",
  );

  if (!sortable) {
    return <TableHead className={className}>{label}</TableHead>;
  }

  const active = query.sort === field;
  const nextDirection =
    active && query.direction === "ASC" ? "DESC" : "ASC";
  const href = invoiceHref({
    ...query,
    sort: field,
    direction: nextDirection,
    page: 0,
  });
  const Icon = !active ? ArrowUpDown : query.direction === "ASC" ? ArrowUp : ArrowDown;

  return (
    <TableHead className={className}>
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-1 rounded transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
          align === "right" && "flex-row-reverse",
          active && "text-foreground",
        )}
        aria-label={`Ordenar por ${label.toLowerCase()}`}
      >
        {label}
        <Icon className="size-3.5" aria-hidden="true" />
      </Link>
    </TableHead>
  );
}

export function InvoicesTable({
  invoices,
  query,
  sortable,
}: {
  invoices: Invoice[];
  query: InvoiceQuery;
  sortable: boolean;
}) {
  return (
    <Table>
      <TableCaption className="sr-only">
        Listado de facturas con cliente, emisión, importe y estado de pago.
      </TableCaption>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <SortHeader
            field="invoiceNumber"
            label="Factura"
            query={query}
            sortable={sortable}
          />
          <SortHeader
            field="customerName"
            label="Cliente"
            query={query}
            sortable={sortable}
          />
          <TableHead className="h-9 px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Condición
          </TableHead>
          <SortHeader
            field="totalAmount"
            label="Total"
            query={query}
            sortable={sortable}
            align="right"
          />
          <SortHeader
            field="paymentStatus"
            label="Estado"
            query={query}
            sortable={sortable}
          />
          <TableHead className="h-9 px-3 text-right text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Acciones
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="px-3 py-2.5">
              <Link
                href={`/invoices/${invoice.id}`}
                className="font-medium hover:underline"
              >
                {invoice.invoiceNumber}
              </Link>
              <p className="text-xs text-muted-foreground">
                {formatDate(invoice.issueDate)}
              </p>
            </TableCell>

            <TableCell className="max-w-[240px] px-3 py-2.5 whitespace-normal">
              <p className="truncate font-medium">{invoice.customerName}</p>
              <p className="truncate text-xs text-muted-foreground">
                RUC {invoice.customerRuc}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Alumno {invoice.studentId ? `#${invoice.studentId}` : "—"}
              </p>
            </TableCell>

            <TableCell className="px-3 py-2.5">
              <Badge variant="outline" className="font-normal">
                {SALE_CONDITION_LABELS[invoice.saleCondition]}
              </Badge>
            </TableCell>

            <TableCell className="px-3 py-2.5 text-right tabular-nums">
              <p className="font-medium">{formatCurrency(invoiceTotal(invoice))}</p>
              <p className="text-xs text-muted-foreground">
                IVA {formatCurrency(invoice.totalIva)}
              </p>
            </TableCell>

            <TableCell className="px-3 py-2.5">
              <InvoiceStatusBadge status={invoice.paymentStatus} />
            </TableCell>

            <TableCell className="px-3 py-2.5 text-right">
              <div className="flex justify-end">
                <InvoiceActions
                  invoiceId={invoice.id}
                  invoiceNumber={invoice.invoiceNumber}
                  status={invoice.paymentStatus}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
