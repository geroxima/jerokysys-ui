"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import { AccessDenied } from "@/components/access-denied";
import { InvoiceEmptyState } from "@/components/invoices/invoice-empty-state";
import { InvoiceFilters } from "@/components/invoices/invoice-filters";
import { InvoiceLoadError } from "@/components/invoices/invoice-load-error";
import { InvoicePagination } from "@/components/invoices/invoice-pagination";
import { InvoiceSummaryCards } from "@/components/invoices/invoice-summary-cards";
import { InvoicesSkeleton } from "@/components/invoices/invoices-skeleton";
import { InvoicesTable } from "@/components/invoices/invoices-table";
import { buttonVariants } from "@/components/ui/button";
import { pluralize } from "@/lib/invoices/format";
import { canAccessInvoices } from "@/lib/invoices/permissions";
import {
  describeFilter,
  invoiceHref,
  isFiltered,
  parseInvoiceQuery,
} from "@/lib/invoices/query";
import { useInvoiceStats, useInvoices } from "@/lib/query/invoices";
import { useSession } from "@/lib/query/session";
import { cn } from "@/lib/utils";

function InvoicesContent() {
  const searchParams = useSearchParams();
  const sessionQuery = useSession();
  const query = parseInvoiceQuery(Object.fromEntries(searchParams.entries()));
  const listQuery = useInvoices(query);
  const statsQuery = useInvoiceStats();

  if (sessionQuery.isLoading) {
    return <InvoicesSkeleton />;
  }

  if (!canAccessInvoices(sessionQuery.data?.role)) {
    return <AccessDenied />;
  }

  const header = (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Facturas</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Emisión, cobro y seguimiento de facturas.
        </p>
      </div>

      <Link
        href="/invoices/new"
        className={cn(buttonVariants({ size: "lg" }), "h-9")}
      >
        <Plus aria-hidden="true" />
        Nueva factura
      </Link>
    </header>
  );

  if (listQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <InvoicesSkeleton />
      </div>
    );
  }

  if (listQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <InvoiceLoadError
          message={
            listQuery.error instanceof Error
              ? listQuery.error.message
              : "No se pudieron cargar las facturas."
          }
          onRetry={() => {
            void listQuery.refetch();
            void statsQuery.refetch();
          }}
        />
      </div>
    );
  }

  const result = listQuery.data;

  if (!result) {
    return null;
  }

  const stats = statsQuery.data ?? null;
  const filtered = isFiltered(query);
  const activeDescription = describeFilter(query.filter);

  return (
    <div className="flex flex-col gap-6">
      {header}

      {stats ? <InvoiceSummaryCards stats={stats} /> : null}

      <InvoiceFilters
        key={invoiceHref(query)}
        query={query}
        stats={stats}
      />

      <section
        aria-label="Listado de facturas"
        className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {filtered
              ? `${result.total} ${pluralize(result.total, "resultado", "resultados")}`
              : result.pagination
                ? `Mostrando ${result.items.length} de ${result.pagination.totalElements} facturas`
                : `${result.total} ${pluralize(result.total, "factura", "facturas")}`}
          </p>
          {activeDescription ? (
            <Link
              href={invoiceHref({
                filter: { type: "none" },
                sort: "issueDate",
                direction: "DESC",
                page: 0,
              })}
              className="text-xs font-medium text-primary hover:underline"
            >
              Quitar filtro
            </Link>
          ) : null}
        </div>

        {result.items.length === 0 ? (
          <div className="p-4">
            <InvoiceEmptyState
              title={
                filtered
                  ? "No hay facturas con ese filtro"
                  : "Todavía no hay facturas"
              }
              description={
                filtered
                  ? "Probá con otro criterio o quitá el filtro para ver todas las facturas."
                  : "Registrá la primera factura para empezar a seguir su cobro."
              }
              action={
                filtered ? (
                  <Link
                    href="/invoices"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "h-9 bg-background",
                    )}
                  >
                    Ver todas
                  </Link>
                ) : (
                  <Link
                    href="/invoices/new"
                    className={cn(buttonVariants({ size: "lg" }), "h-9")}
                  >
                    <Plus aria-hidden="true" />
                    Nueva factura
                  </Link>
                )
              }
            />
          </div>
        ) : (
          <InvoicesTable
            invoices={result.items}
            query={query}
            sortable={!filtered}
          />
        )}

        {result.pagination ? (
          <InvoicePagination
            query={query}
            page={result.pagination.page}
            totalPages={result.pagination.totalPages}
          />
        ) : null}
      </section>
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-8 py-10">
      <Suspense fallback={<InvoicesSkeleton />}>
        <InvoicesContent />
      </Suspense>
    </div>
  );
}
