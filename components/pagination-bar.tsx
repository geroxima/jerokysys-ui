"use client";

import { useRouter } from "next/navigation";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

type PaginationBarProps = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  baseUrl: string;
  sort?: string;
  direction?: string;
};

const PAGE_SIZES = [10, 20, 50];

export function PaginationBar({
  page,
  size,
  totalElements,
  totalPages,
  baseUrl,
  sort,
  direction,
}: PaginationBarProps) {
  const router = useRouter();
  const hasPrevious = page > 0;
  const hasNext = page < totalPages - 1;

  const buildUrl = (p: number, s: number = size) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    params.set("size", String(s));
    if (sort) params.set("sort", sort);
    if (direction) params.set("direction", direction);
    return `${baseUrl}?${params.toString()}`;
  };

  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (page > 2) pages.push("ellipsis");
      const start = Math.max(1, page - 1);
      const end = Math.min(totalPages - 2, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 3) pages.push("ellipsis");
      pages.push(totalPages - 1);
    }
    return pages;
  };

  const from = totalElements === 0 ? 0 : page * size + 1;
  const to = Math.min((page + 1) * size, totalElements);

  const sizes = PAGE_SIZES.includes(size) ? PAGE_SIZES : [...PAGE_SIZES, size].sort((a, b) => a - b);

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        {totalElements === 0 ? (
          "Sin resultados"
        ) : (
          <>
            Mostrando <span className="font-medium">{from}</span>–
            <span className="font-medium">{to}</span> de{" "}
            <span className="font-medium">{totalElements}</span> resultados
          </>
        )}
      </p>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Por página
          <select
            value={size}
            onChange={(event) => router.push(buildUrl(0, Number(event.target.value)))}
            className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Resultados por página"
          >
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <Pagination className="w-fit">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={hasPrevious ? buildUrl(page - 1) : "#"}
                text="Anterior"
                aria-disabled={!hasPrevious}
                className={cn(!hasPrevious && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
            {getPageNumbers().map((p, i) =>
              p === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink href={buildUrl(p)} isActive={p === page}>
                    {p + 1}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                href={hasNext ? buildUrl(page + 1) : "#"}
                text="Siguiente"
                aria-disabled={!hasNext}
                className={cn(!hasNext && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
