"use client";

import { useQuery } from "@tanstack/react-query";

import { getClientToken } from "@/lib/client-token";
import { decodeJwt, isJwtExpired } from "@/lib/jwt";

export type ClientSession = {
  username: string;
  role: string;
  expiresAt: number;
};

function readSession(): ClientSession | null {
  const token = getClientToken();

  if (!token || isJwtExpired(token)) {
    return null;
  }

  const payload = decodeJwt(token);
  if (!payload) {
    return null;
  }

  return {
    username: payload.username ?? "",
    role: payload.role ?? "",
    expiresAt: (payload.exp ?? 0) * 1000,
  };
}

export const sessionKeys = {
  all: ["session"] as const,
};

export function useSession() {
  return useQuery({
    queryKey: sessionKeys.all,
    queryFn: readSession,
    staleTime: 60_000,
    retry: false,
  });
}
