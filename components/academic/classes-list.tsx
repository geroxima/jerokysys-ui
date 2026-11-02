"use client";

import { QueryList } from "@/components/query-list";
import type { Column } from "@/components/data-table";
import { useClasses } from "@/lib/query/classes";
import type { DanceClassDTO, PagedFilter } from "@/lib/academic/types";

const statusLabels: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  CANCELLED: "Cancelado",
  SUSPENDED: "Suspendido",
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
  SUSPENDED: "bg-yellow-100 text-yellow-800",
};

const columns: Column<DanceClassDTO>[] = [
  { header: "Nivel", accessorKey: "level", sortable: true, format: "strong" },
  { header: "Día", accessorKey: "dayOfWeek", sortable: true },
  {
    header: "Horario",
    accessorKey: "startTime",
    format: { kind: "timeRange", endKey: "endTime" },
  },
  { header: "Capacidad", accessorKey: "maxCapacity" },
  { header: "Precio", accessorKey: "monthlyPrice", format: "currency" },
  {
    header: "Estado",
    accessorKey: "status",
    sortable: true,
    format: { kind: "badge", labels: statusLabels, colors: statusColors },
  },
];

export function ClassesList({ filter }: { filter: PagedFilter }) {
  const { data, isLoading, isError, error, isFetching, refetch } =
    useClasses(filter);

  return (
    <QueryList<DanceClassDTO>
      columns={columns}
      data={data?.content}
      isLoading={isLoading}
      isError={isError}
      error={error}
      isFetching={isFetching}
      refetch={refetch}
      page={data?.page ?? filter.page}
      totalPages={data?.totalPages ?? 0}
      baseUrl="/classes"
    />
  );
}
