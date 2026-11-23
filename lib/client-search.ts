"use client";

import { useSearchParams } from "next/navigation";

import type { PageResult, PagedFilter } from "@/lib/academic/types";

type ListState<T> = {
  data: PageResult<T> | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isFetching: boolean;
  refetch: () => void;
};

type AllState<T> = Omit<ListState<T>, "data"> & { data: T[] | undefined };

/** Lee el texto de búsqueda desde `?q=`. Debe usarse dentro de un <Suspense>. */
export function useSearchQuery(): string {
  const params = useSearchParams();
  return (params.get("q") ?? "").trim();
}

function normalize(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "es", { numeric: true });
}

/** Filtra, ordena y pagina en memoria una lista completa. */
export function searchPage<T extends object>(
  rows: T[],
  query: string,
  filter: PagedFilter,
  fields: (row: T) => Array<string | null | undefined>,
): PageResult<T> {
  const needle = normalize(query);
  const matched = rows.filter((row) =>
    fields(row).some((value) => value != null && normalize(value).includes(needle)),
  );

  if (filter.sort) {
    const key = filter.sort as keyof T;
    const sign = filter.direction === "DESC" ? -1 : 1;
    matched.sort((a, b) => sign * compareValues(a[key], b[key]));
  }

  const size = filter.size;
  const totalPages = Math.ceil(matched.length / size);
  const page = Math.min(filter.page, Math.max(totalPages - 1, 0));

  return {
    content: matched.slice(page * size, page * size + size),
    totalElements: matched.length,
    totalPages,
    page,
    size,
  };
}

/**
 * Sin búsqueda usa la página del servidor; con búsqueda usa la lista completa
 * filtrada en el cliente.
 */
export function searchedList<T extends object>(
  query: string,
  filter: PagedFilter,
  paged: ListState<T>,
  all: AllState<T>,
  fields: (row: T) => Array<string | null | undefined>,
): ListState<T> {
  if (!query) return paged;
  return {
    ...all,
    data: all.data ? searchPage(all.data, query, filter, fields) : undefined,
  };
}
