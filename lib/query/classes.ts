import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { apiGet, apiWrite, buildPagedParams } from "@/lib/api-client";
import type {
  DanceClassDTO,
  PageResult,
  PagedFilter,
} from "@/lib/academic/types";

export const classKeys = {
  all: ["classes"] as const,
  lists: () => [...classKeys.all, "list"] as const,
  list: (filter: PagedFilter) => [...classKeys.lists(), filter] as const,
  details: () => [...classKeys.all, "detail"] as const,
  detail: (id: number) => [...classKeys.details(), id] as const,
};

export function fetchClasses(filter: PagedFilter) {
  return apiGet<PageResult<DanceClassDTO>>(`/classes?${buildPagedParams(filter)}`);
}

export function useClasses(filter: PagedFilter, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: classKeys.list(filter),
    queryFn: () => fetchClasses(filter),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

export function useAllClasses(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: classKeys.all,
    queryFn: () => apiGet<DanceClassDTO[]>("/classes/all"),
    enabled: options.enabled ?? true,
  });
}

export function useClass(id: number | null | undefined) {
  return useQuery({
    queryKey: classKeys.detail(id ?? 0),
    queryFn: () => apiGet<DanceClassDTO>(`/classes/${id}`),
    enabled: id != null && Number.isInteger(id) && id > 0,
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<DanceClassDTO, "id">) =>
      apiWrite<DanceClassDTO>("/classes", "POST", dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: classKeys.all }),
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Omit<DanceClassDTO, "id"> }) =>
      apiWrite<DanceClassDTO>(`/classes/${id}`, "PUT", dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: classKeys.all }),
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiWrite<void>(`/classes/${id}`, "DELETE"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: classKeys.all }),
  });
}
