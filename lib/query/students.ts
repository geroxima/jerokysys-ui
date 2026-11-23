import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api-client";
import type { StudentDTO } from "@/lib/academic/types";

export const studentKeys = {
  all: ["students"] as const,
  details: () => [...studentKeys.all, "detail"] as const,
  detail: (id: number) => [...studentKeys.details(), id] as const,
};

export function useAllStudents() {
  return useQuery({
    queryKey: studentKeys.all,
    queryFn: () => apiGet<StudentDTO[]>("/students/all"),
  });
}

export function useStudent(id: number | null | undefined) {
  return useQuery({
    queryKey: studentKeys.detail(id ?? 0),
    queryFn: () => apiGet<StudentDTO>(`/students/${id}`),
    enabled: id != null && Number.isInteger(id) && id > 0,
  });
}
