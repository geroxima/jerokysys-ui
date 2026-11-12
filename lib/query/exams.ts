import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { apiGet, apiWrite, buildPagedParams } from "@/lib/api-client";
import type {
  ExamDTO,
  ExamResultDTO,
  PageResult,
  PagedFilter,
} from "@/lib/academic/types";
import { examResultKeys } from "@/lib/query/exam-results";

export const examKeys = {
  all: ["exams"] as const,
  lists: () => [...examKeys.all, "list"] as const,
  list: (filter: PagedFilter) => [...examKeys.lists(), filter] as const,
  details: () => [...examKeys.all, "detail"] as const,
  detail: (id: number) => [...examKeys.details(), id] as const,
};

export function fetchExams(filter: PagedFilter) {
  return apiGet<PageResult<ExamDTO>>(`/exams?${buildPagedParams(filter)}`);
}

export function useExams(filter: PagedFilter) {
  return useQuery({
    queryKey: examKeys.list(filter),
    queryFn: () => fetchExams(filter),
    placeholderData: keepPreviousData,
  });
}

export type ExamResultRowInput = {
  id?: number;
  studentId: number;
  score: string | number | null;
  remarks: string | null;
};

export type ExamRecordInput = {
  examId?: number;
  exam: Omit<ExamDTO, "id">;
  results: ExamResultRowInput[];
};

export type ExamRecordResult = {
  exam: ExamDTO;
  resultsCreated: ExamResultDTO[];
  resultsFailed: Array<{ studentId: number; error: string }>;
};

export async function saveExamRecord(
  input: ExamRecordInput,
): Promise<ExamRecordResult> {
  const resultsCreated: ExamResultDTO[] = [];
  const resultsFailed: Array<{ studentId: number; error: string }> = [];

  if (!input.examId) {
    const exam = await apiWrite<ExamDTO>("/exams", "POST", input.exam);
    for (const row of input.results) {
      try {
        resultsCreated.push(
          await apiWrite<ExamResultDTO>("/exam-results", "POST", {
            examId: exam.id,
            studentId: row.studentId,
            score: row.score,
            remarks: row.remarks,
          }),
        );
      } catch (error) {
        resultsFailed.push({
          studentId: row.studentId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    return { exam, resultsCreated, resultsFailed };
  }

  const exam = await apiWrite<ExamDTO>(`/exams/${input.examId}`, "PUT", input.exam);
  for (const row of input.results) {
    try {
      const dto = {
        examId: input.examId,
        studentId: row.studentId,
        score: row.score,
        remarks: row.remarks,
      };
      resultsCreated.push(
        row.id
          ? await apiWrite<ExamResultDTO>(`/exam-results/${row.id}`, "PUT", dto)
          : await apiWrite<ExamResultDTO>("/exam-results", "POST", dto),
      );
    } catch (error) {
      resultsFailed.push({
        studentId: row.studentId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { exam, resultsCreated, resultsFailed };
}

export function useSaveExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveExamRecord,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: examKeys.all });
      queryClient.invalidateQueries({ queryKey: examResultKeys.all });
      if (result.exam.id != null) {
        queryClient.invalidateQueries({ queryKey: examKeys.detail(result.exam.id) });
        queryClient.invalidateQueries({ queryKey: examResultKeys.byExam(result.exam.id) });
      }
    },
  });
}
