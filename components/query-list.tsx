"use client";

import { AlertTriangle, RotateCw } from "lucide-react";

import { DataTable, type Column } from "@/components/data-table";
import { PaginationBar } from "@/components/pagination-bar";
import { TableSkeleton } from "@/components/suspense-table";
import { Button } from "@/components/ui/button";

type QueryListProps<T extends { id: number | null }> = {
  columns: Column<T>[];
  data: T[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isFetching: boolean;
  refetch: () => void;
  page: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string>;
  rowDoubleClickBaseUrl?: string;
  rowEditBaseUrl?: string;
};

export function QueryList<T extends { id: number | null }>({
  columns,
  data,
  isLoading,
  isError,
  error,
  isFetching,
  refetch,
  page,
  totalPages,
  baseUrl,
  searchParams,
  rowDoubleClickBaseUrl,
  rowEditBaseUrl,
}: QueryListProps<T>) {
  if (isLoading) {
    return <TableSkeleton columns={columns.length} />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card p-10 text-center">
        <AlertTriangle className="size-8 text-destructive" />
        <p className="text-sm font-medium">No se pudieron cargar los datos</p>
        {error instanceof Error ? (
          <p className="max-w-md text-xs text-muted-foreground">{error.message}</p>
        ) : null}
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RotateCw className="size-4" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div>
      {isFetching ? (
        <div className="mb-2 flex items-center justify-end gap-1 text-xs text-muted-foreground">
          <RotateCw className="size-3 animate-spin" />
          Actualizando…
        </div>
      ) : null}
      <DataTable
        columns={columns}
        data={data ?? []}
        rowDoubleClickBaseUrl={rowDoubleClickBaseUrl}
        rowEditBaseUrl={rowEditBaseUrl}
      />
      <PaginationBar
        page={page}
        totalPages={totalPages}
        baseUrl={baseUrl}
        searchParams={searchParams ?? {}}
      />
    </div>
  );
}
