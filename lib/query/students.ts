"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getStudent, searchStudents } from "@/lib/personas/api";

export const studentKeys = {
  all: ["students"] as const,
  search: (query: string) => [...studentKeys.all, "search", query] as const,
  detail: (id: number) => [...studentKeys.all, "detail", id] as const,
};

export function useStudentSearch(query: string) {
  return useQuery({
    queryKey: studentKeys.search(query),
    queryFn: () => searchStudents(query),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function useStudent(id: number | null | undefined) {
  return useQuery({
    queryKey: studentKeys.detail(id ?? 0),
    queryFn: () => getStudent(id as number),
    enabled: id != null && Number.isInteger(id) && id > 0,
    staleTime: 30_000,
  });
}
