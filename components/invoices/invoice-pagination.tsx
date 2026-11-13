import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { invoiceHref } from "@/lib/invoices/query";
import type { InvoiceQuery } from "@/lib/invoices/types";
import { cn } from "@/lib/utils";

export function InvoicePagination({
  query,
  page,
  totalPages,
}: {
  query: InvoiceQuery;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const hasPrevious = page > 0;
  const hasNext = page + 1 < totalPages;

  return (
    <nav
      aria-label="Paginación de facturas"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-3 py-3"
    >
      <p className="text-xs text-muted-foreground">
        Página {page + 1} de {totalPages}
      </p>

      <div className="flex items-center gap-2">
        {hasPrevious ? (
          <Link
            href={invoiceHref({ ...query, page: page - 1 })}
            rel="prev"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8 bg-background",
            )}
          >
            <ChevronLeft aria-hidden="true" />
            Anterior
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8 cursor-not-allowed bg-background opacity-50",
            )}
          >
            <ChevronLeft aria-hidden="true" />
            Anterior
          </span>
        )}

        {hasNext ? (
          <Link
            href={invoiceHref({ ...query, page: page + 1 })}
            rel="next"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8 bg-background",
            )}
          >
            Siguiente
            <ChevronRight aria-hidden="true" />
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8 cursor-not-allowed bg-background opacity-50",
            )}
          >
            Siguiente
            <ChevronRight aria-hidden="true" />
          </span>
        )}
      </div>
    </nav>
  );
}
