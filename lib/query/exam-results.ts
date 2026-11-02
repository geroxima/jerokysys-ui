import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { apiGet, apiWrite, buildPagedParams } from "@/lib/api-client";
import type {
  ExamResultDTO,
  PageResult,
  PagedFilter,
} from "@/lib/academic/types";

export const examResultKeys = {
  all: ["exam-results"] as const,
  lists: () => [...examResultKeys.all, "list"] as const,
  list: (filter: PagedFilter) => [...examResultKeys.lists(), filter] as const,
  byExam: (examId: number) => [...examResultKeys.all, "by-exam", examId] as const,
};

export function fetchExamResults(filter: PagedFilter) {
  return apiGet<PageResult<ExamResultDTO>>(`/exam-results?${buildPagedParams(filter)}`);
}

export function useExamResults(filter: PagedFilter) {
  return useQuery({
    queryKey: examResultKeys.list(filter),
    queryFn: () => fetchExamResults(filter),
    placeholderData: keepPreviousData,
  });
}

export function useCreateExamResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<ExamResultDTO, "id">) =>
      apiWrite<ExamResultDTO>("/exam-results", "POST", dto),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: examResultKeys.all }),
  });
}
