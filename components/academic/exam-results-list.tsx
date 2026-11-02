"use client";

import { QueryList } from "@/components/query-list";
import type { Column } from "@/components/data-table";
import { useExamResults } from "@/lib/query/exam-results";
import type { ExamResultDTO, PagedFilter } from "@/lib/academic/types";

const columns: Column<ExamResultDTO>[] = [
  { header: "ID Examen", accessorKey: "examId" },
  { header: "ID Alumno", accessorKey: "studentId" },
  { header: "Puntaje", accessorKey: "score", format: "strong", emptyText: "—" },
  { header: "Observaciones", accessorKey: "remarks", format: "muted", emptyText: "—" },
];

export function ExamResultsList({ filter }: { filter: PagedFilter }) {
  const { data, isLoading, isError, error, isFetching, refetch } =
    useExamResults(filter);

  return (
    <QueryList<ExamResultDTO>
      columns={columns}
      data={data?.content}
      isLoading={isLoading}
      isError={isError}
      error={error}
      isFetching={isFetching}
      refetch={refetch}
      page={data?.page ?? filter.page}
      totalPages={data?.totalPages ?? 0}
      baseUrl="/exam-results"
    />
  );
}
