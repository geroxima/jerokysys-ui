import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { apiGet, apiWrite, buildPagedParams } from "@/lib/api-client";
import type {
  EnrollmentDTO,
  PageResult,
  PagedFilter,
} from "@/lib/academic/types";

export const enrollmentKeys = {
  all: ["enrollments"] as const,
  lists: () => [...enrollmentKeys.all, "list"] as const,
  list: (filter: PagedFilter) => [...enrollmentKeys.lists(), filter] as const,
};

export function fetchEnrollments(filter: PagedFilter) {
  return apiGet<PageResult<EnrollmentDTO>>(`/enrollments?${buildPagedParams(filter)}`);
}

export function useEnrollments(filter: PagedFilter) {
  return useQuery({
    queryKey: enrollmentKeys.list(filter),
    queryFn: () => fetchEnrollments(filter),
    placeholderData: keepPreviousData,
  });
}

export function useCreateEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<EnrollmentDTO, "id">) =>
      apiWrite<EnrollmentDTO>("/enrollments", "POST", dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: enrollmentKeys.all }),
  });
}
