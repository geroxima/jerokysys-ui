import { Suspense } from "react";
import { DataTable, type Column } from "./data-table";
import { PaginationBar } from "./pagination-bar";
import type { PagedFilter } from "@/lib/academic/types";

type TableSkeletonProps = {
  columns: number;
};

export function TableSkeleton({ columns }: TableSkeletonProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-4">
        <div className="flex items-center gap-4 mb-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={i}
              className="h-4 w-24 animate-pulse rounded bg-muted"
            />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            {Array.from({ length: columns }).map((_, j) => (
              <div
                key={j}
                className="h-3 w-20 animate-pulse rounded bg-muted"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

type SuspenseTableProps<T> = {
  columns: Column<T>[];
  fetcher: (filter: PagedFilter) => Promise<{
    content: T[];
    page: number;
    totalPages: number;
  }>;
  filter: PagedFilter;
  baseUrl: string;
  searchParams?: Record<string, string | undefined>;
  rowDoubleClickBaseUrl?: string;
  rowEditBaseUrl?: string;
};

async function DataTableSection<T extends { id: number | null }>({
  columns,
  fetcher,
  filter,
  baseUrl,
  searchParams = {},
  rowDoubleClickBaseUrl,
  rowEditBaseUrl,
}: Omit<SuspenseTableProps<T>, "sort" | "direction">) {
  const data = await fetcher(filter);

  // Filter out undefined values from searchParams
  const cleanSearchParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined) {
      cleanSearchParams[key] = value;
    }
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={data.content}
        sort={filter.sort}
        direction={filter.direction}
        rowDoubleClickBaseUrl={rowDoubleClickBaseUrl}
        rowEditBaseUrl={rowEditBaseUrl}
      />
      <PaginationBar
        page={data.page}
        totalPages={data.totalPages}
        baseUrl={baseUrl}
        searchParams={cleanSearchParams}
      />
    </>
  );
}

export function SuspenseTable<T extends { id: number | null }>(
  props: SuspenseTableProps<T>,
) {
  return (
    <Suspense fallback={<TableSkeleton columns={props.columns.length} />}>
      <DataTableSection {...props} />
    </Suspense>
  );
}
