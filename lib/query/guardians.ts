"use client";

import { useQuery } from "@tanstack/react-query";

import { getGuardian, searchGuardians } from "@/lib/personas/api";

export const guardianKeys = {
  all: ["guardians"] as const,
  search: (query: string) => [...guardianKeys.all, "search", query] as const,
  detail: (id: number) => [...guardianKeys.all, "detail", id] as const,
};

export function useGuardianSearch(query: string) {
  return useQuery({
    queryKey: guardianKeys.search(query),
    queryFn: () => searchGuardians(query),
    staleTime: 15_000,
  });
}

export function useGuardian(id: number | null | undefined) {
  return useQuery({
    queryKey: guardianKeys.detail(id ?? 0),
    queryFn: () => getGuardian(id as number),
    enabled: id != null && Number.isInteger(id) && id > 0,
    staleTime: 30_000,
  });
}
