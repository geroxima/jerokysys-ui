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
  details: () => [...enrollmentKeys.all, "detail"] as const,
  detail: (id: number) => [...enrollmentKeys.details(), id] as const,
};

export function fetchEnrollments(filter: PagedFilter) {
  return apiGet<PageResult<EnrollmentDTO>>(`/enrollments?${buildPagedParams(filter)}`);
}

export function useEnrollments(filter: PagedFilter, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: enrollmentKeys.list(filter),
    queryFn: () => fetchEnrollments(filter),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

export function useAllEnrollments(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: enrollmentKeys.all,
    queryFn: () => apiGet<EnrollmentDTO[]>("/enrollments/all"),
    enabled: options.enabled ?? true,
  });
}

export function useEnrollment(id: number | null | undefined) {
  return useQuery({
    queryKey: enrollmentKeys.detail(id ?? 0),
    queryFn: () => apiGet<EnrollmentDTO>(`/enrollments/${id}`),
    enabled: id != null && Number.isInteger(id) && id > 0,
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

export function useUpdateEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Omit<EnrollmentDTO, "id"> }) =>
      apiWrite<EnrollmentDTO>(`/enrollments/${id}`, "PUT", dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: enrollmentKeys.all }),
  });
}
