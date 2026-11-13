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

export function useClasses(filter: PagedFilter) {
  return useQuery({
    queryKey: classKeys.list(filter),
    queryFn: () => fetchClasses(filter),
    placeholderData: keepPreviousData,
  });
}

export function useAllClasses() {
  return useQuery({
    queryKey: classKeys.all,
    queryFn: () => apiGet<DanceClassDTO[]>("/classes/all"),
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
