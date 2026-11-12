"use client";

import { QueryList } from "@/components/query-list";
import type { Column } from "@/components/data-table";
import { useEnrollments } from "@/lib/query/enrollments";
import type { EnrollmentDTO, PagedFilter } from "@/lib/academic/types";

const statusLabels: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  DROPPED: "Abandonó",
  COMPLETED: "Completado",
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-gray-100 text-gray-800",
  DROPPED: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
};

const columns: Column<EnrollmentDTO>[] = [
  { header: "ID Alumno", accessorKey: "studentId" },
  { header: "ID Clase", accessorKey: "classId" },
  { header: "Fecha", accessorKey: "enrollmentDate", sortable: true },
  { header: "Precio", accessorKey: "agreedPrice", format: "currency", emptyText: "—" },
  {
    header: "Estado",
    accessorKey: "status",
    sortable: true,
    format: { kind: "badge", labels: statusLabels, colors: statusColors },
  },
];

export function EnrollmentsList({ filter }: { filter: PagedFilter }) {
  const { data, isLoading, isError, error, isFetching, refetch } =
    useEnrollments(filter);

  return (
    <QueryList<EnrollmentDTO>
      columns={columns}
      data={data?.content}
      isLoading={isLoading}
      isError={isError}
      error={error}
      isFetching={isFetching}
      refetch={refetch}
      page={data?.page ?? filter.page}
      totalPages={data?.totalPages ?? 0}
      baseUrl="/enrollments"
    />
  );
}
