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
};

export function fetchDisciplines(filter: PagedFilter) {
  return apiGet<PageResult<DisciplineDTO>>(`/disciplines?${buildPagedParams(filter)}`);
}

export function useDisciplines(filter: PagedFilter) {
  return useQuery({
    queryKey: disciplineKeys.list(filter),
    queryFn: () => fetchDisciplines(filter),
    placeholderData: keepPreviousData,
  });
}

export function useAllDisciplines() {
  return useQuery({
    queryKey: disciplineKeys.all,
    queryFn: () => apiGet<DisciplineDTO[]>("/disciplines/all"),
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
