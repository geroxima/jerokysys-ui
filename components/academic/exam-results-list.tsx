"use client";

import { QueryList } from "@/components/query-list";
import type { Column } from "@/components/data-table";
import { usePermissions } from "@/components/permission-provider";
import { examLabel, studentLabel, toNameMap } from "@/lib/academic/labels";
import { useExamResults } from "@/lib/query/exam-results";
import { useAllExams } from "@/lib/query/exams";
import { useAllStudents } from "@/lib/query/students";
import type { ExamResultDTO, PagedFilter } from "@/lib/academic/types";

export function ExamResultsList({ filter }: { filter: PagedFilter }) {
  const { can } = usePermissions();
  const { data, isLoading, isError, error, isFetching, refetch } =
    useExamResults(filter);
  const { data: exams = [] } = useAllExams();
  const { data: students = [] } = useAllStudents();

  const examMap = toNameMap(exams, examLabel);
  const studentMap = toNameMap(students, studentLabel);

  const columns: Column<ExamResultDTO>[] = [
    {
      header: "Examen",
      accessorKey: "examId",
      format: { kind: "lookup", map: examMap, fallback: "—" },
    },
    {
      header: "Alumno",
      accessorKey: "studentId",
      format: { kind: "lookup", map: studentMap, fallback: "—" },
    },
    { header: "Puntaje", accessorKey: "score", format: "strong", emptyText: "—" },
    { header: "Observaciones", accessorKey: "remarks", format: "muted", emptyText: "—" },
  ];

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
      totalElements={data?.totalElements ?? 0}
      size={data?.size ?? filter.size}
      sort={filter.sort}
      direction={filter.direction}
      baseUrl="/exam-results"
      rowDoubleClickBaseUrl="/exam-results"
      rowEditBaseUrl={can("academic:write") ? "/exam-results" : undefined}
    />
  );
}
