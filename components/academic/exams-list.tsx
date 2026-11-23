"use client";

import { QueryList } from "@/components/query-list";
import type { Column } from "@/components/data-table";
import { usePermissions } from "@/components/permission-provider";
import { classLabel, toNameMap } from "@/lib/academic/labels";
import { searchedList, useSearchQuery } from "@/lib/client-search";
import { useAllClasses } from "@/lib/query/classes";
import { useAllExams, useExams } from "@/lib/query/exams";
import type { ExamDTO, PagedFilter } from "@/lib/academic/types";

export function ExamsList({ filter }: { filter: PagedFilter }) {
  const { can } = usePermissions();
  const query = useSearchQuery();
  const paged = useExams(filter, { enabled: !query });
  const all = useAllExams({ enabled: !!query });
  const { data: classes = [] } = useAllClasses();

  const classMap = toNameMap(classes, classLabel);

  const { data, isLoading, isError, error, isFetching, refetch } = searchedList(
    query,
    filter,
    paged,
    all,
    (exam) => [exam.examName, exam.examDate, classMap.get(exam.danceClassId)],
  );

  const columns: Column<ExamDTO>[] = [
    { header: "Nombre", accessorKey: "examName", sortable: true, format: "strong" },
    { header: "Fecha", accessorKey: "examDate", sortable: true },
    {
      header: "Clase",
      accessorKey: "danceClassId",
      format: { kind: "lookup", map: classMap, fallback: "—" },
    },
  ];

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
      totalElements={data?.totalElements ?? 0}
      size={data?.size ?? filter.size}
      sort={filter.sort}
      direction={filter.direction}
      baseUrl="/exams"
      rowDoubleClickBaseUrl="/exams"
      rowEditBaseUrl={can("academic:write") ? "/exams" : undefined}
    />
  );
}
