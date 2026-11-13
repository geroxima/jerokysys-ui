"use client";

import { useSearchParams } from "next/navigation";

import type { PagedFilter } from "@/lib/academic/types";

/**
 * Lee la paginacion desde la URL. Debe usarse dentro de un <Suspense> porque
 * `useSearchParams` suspende durante el prerender.
 */
export function usePagedFilter(
  defaultSort: string,
  defaultDirection: "ASC" | "DESC" = "ASC",
): PagedFilter {
  const params = useSearchParams();
  const page = Number(params.get("page") ?? 0);
  const size = Number(params.get("size") ?? 10);
  const direction = params.get("direction");

  return {
    page: Number.isInteger(page) && page > 0 ? page : 0,
    size: Number.isInteger(size) && size > 0 ? size : 10,
    sort: params.get("sort") ?? defaultSort,
    direction:
      direction === "DESC"
        ? "DESC"
        : direction === "ASC"
          ? "ASC"
          : defaultDirection,
  };
}
