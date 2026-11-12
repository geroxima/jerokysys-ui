"use client";

import { QueryList } from "@/components/query-list";
import type { Column } from "@/components/data-table";
import { useExams } from "@/lib/query/exams";
import type { ExamDTO, PagedFilter } from "@/lib/academic/types";

const columns: Column<ExamDTO>[] = [
  { header: "Nombre", accessorKey: "examName", sortable: true, format: "strong" },
  { header: "Fecha", accessorKey: "examDate", sortable: true },
  { header: "Clase ID", accessorKey: "danceClassId" },
];

export function ExamsList({ filter }: { filter: PagedFilter }) {
  const { data, isLoading, isError, error, isFetching, refetch } =
    useExams(filter);

  return (
    <QueryList<ExamDTO>
      columns={columns}
      data={data?.content}
      isLoading={isLoading}
      isError={isError}
      error={error}
      isFetching={isFetching}
      refetch={refetch}
      page={data?.page ?? filter.page}
      totalPages={data?.totalPages ?? 0}
      baseUrl="/exams"
      rowDoubleClickBaseUrl="/exams"
      rowEditBaseUrl="/exams"
    />
  );
}
