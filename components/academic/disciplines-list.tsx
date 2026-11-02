"use client";

import { QueryList } from "@/components/query-list";
import type { Column } from "@/components/data-table";
import { useDisciplines } from "@/lib/query/disciplines";
import type { DisciplineDTO, PagedFilter } from "@/lib/academic/types";

const columns: Column<DisciplineDTO>[] = [
  { header: "Nombre", accessorKey: "name", sortable: true, format: "strong" },
  { header: "Descripción", accessorKey: "description", format: "muted", emptyText: "—" },
];

export function DisciplinesList({ filter }: { filter: PagedFilter }) {
  const { data, isLoading, isError, error, isFetching, refetch } =
    useDisciplines(filter);

  return (
    <QueryList<DisciplineDTO>
      columns={columns}
      data={data?.content}
      isLoading={isLoading}
      isError={isError}
      error={error}
      isFetching={isFetching}
      refetch={refetch}
      page={data?.page ?? filter.page}
      totalPages={data?.totalPages ?? 0}
      baseUrl="/disciplines"
    />
  );
}
