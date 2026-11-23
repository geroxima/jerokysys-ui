"use client";

import { QueryList } from "@/components/query-list";
import type { Column } from "@/components/data-table";
import { usePermissions } from "@/components/permission-provider";
import { classLabel, studentLabel, toNameMap } from "@/lib/academic/labels";
import { searchedList, useSearchQuery } from "@/lib/client-search";
import { useAllEnrollments, useEnrollments } from "@/lib/query/enrollments";
import { useAllClasses } from "@/lib/query/classes";
import { useAllStudents } from "@/lib/query/students";
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

export function EnrollmentsList({ filter }: { filter: PagedFilter }) {
  const { can } = usePermissions();
  const query = useSearchQuery();
  const paged = useEnrollments(filter, { enabled: !query });
  const all = useAllEnrollments({ enabled: !!query });
  const { data: students = [] } = useAllStudents();
  const { data: classes = [] } = useAllClasses();

  const studentMap = toNameMap(students, studentLabel);
  const classMap = toNameMap(classes, classLabel);

  const { data, isLoading, isError, error, isFetching, refetch } = searchedList(
    query,
    filter,
    paged,
    all,
    (enrollment) => [
      studentMap.get(enrollment.studentId),
      classMap.get(enrollment.classId),
      statusLabels[enrollment.status ?? ""],
    ],
  );

  const columns: Column<EnrollmentDTO>[] = [
    {
      header: "Alumno",
      accessorKey: "studentId",
      format: { kind: "lookup", map: studentMap, fallback: "—" },
    },
    {
      header: "Clase",
      accessorKey: "classId",
      format: { kind: "lookup", map: classMap, fallback: "—" },
    },
    { header: "Fecha", accessorKey: "enrollmentDate", sortable: true },
    { header: "Precio", accessorKey: "agreedPrice", format: "currency", emptyText: "—" },
    {
      header: "Estado",
      accessorKey: "status",
      sortable: true,
      format: { kind: "badge", labels: statusLabels, colors: statusColors },
    },
  ];

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
      totalElements={data?.totalElements ?? 0}
      size={data?.size ?? filter.size}
      sort={filter.sort}
      direction={filter.direction}
      baseUrl="/enrollments"
      rowDoubleClickBaseUrl="/enrollments"
      rowEditBaseUrl={can("academic:write") ? "/enrollments" : undefined}
    />
  );
}
