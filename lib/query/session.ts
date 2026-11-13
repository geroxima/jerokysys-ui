"use client";

import { useQuery } from "@tanstack/react-query";

export type ClientSession = {
  username: string;
  role: string;
  expiresAt: number;
};

async function fetchSession(): Promise<ClientSession | null> {
  const response = await fetch("/api/auth/session", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("No se pudo leer la sesión.");
  }

  return (await response.json()) as ClientSession;
}

export const sessionKeys = {
  all: ["session"] as const,
};

export function useSession() {
  return useQuery({
    queryKey: sessionKeys.all,
    queryFn: fetchSession,
    staleTime: 60_000,
    retry: false,
  });
}
