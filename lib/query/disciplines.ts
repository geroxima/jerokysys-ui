import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { apiGet, apiWrite, buildPagedParams } from "@/lib/api-client";
import type {
  DisciplineDTO,
  PageResult,
  PagedFilter,
} from "@/lib/academic/types";

export const disciplineKeys = {
  all: ["disciplines"] as const,
  lists: () => [...disciplineKeys.all, "list"] as const,
  list: (filter: PagedFilter) => [...disciplineKeys.lists(), filter] as const,
  details: () => [...disciplineKeys.all, "detail"] as const,
  detail: (id: number) => [...disciplineKeys.details(), id] as const,
};

export function fetchDisciplines(filter: PagedFilter) {
  return apiGet<PageResult<DisciplineDTO>>(`/disciplines?${buildPagedParams(filter)}`);
}

export function useDisciplines(filter: PagedFilter, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: disciplineKeys.list(filter),
    queryFn: () => fetchDisciplines(filter),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

export function useAllDisciplines(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: disciplineKeys.all,
    queryFn: () => apiGet<DisciplineDTO[]>("/disciplines/all"),
    enabled: options.enabled ?? true,
  });
}

export function useDiscipline(id: number | null | undefined) {
  return useQuery({
    queryKey: disciplineKeys.detail(id ?? 0),
    queryFn: () => apiGet<DisciplineDTO>(`/disciplines/${id}`),
    enabled: id != null && Number.isInteger(id) && id > 0,
  });
}

export function useCreateDiscipline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<DisciplineDTO, "id">) =>
      apiWrite<DisciplineDTO>("/disciplines", "POST", dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: disciplineKeys.all }),
  });
}

export function useUpdateDiscipline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Omit<DisciplineDTO, "id"> }) =>
      apiWrite<DisciplineDTO>(`/disciplines/${id}`, "PUT", dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: disciplineKeys.all }),
  });
}

export function useDeleteDiscipline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiWrite<void>(`/disciplines/${id}`, "DELETE"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: disciplineKeys.all }),
  });
}
