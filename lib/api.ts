import "server-only";

import { getSession } from "@/lib/auth";

export const API_BASE_URL = (
  process.env.API_BASE_URL ?? "http://localhost:8080/api/v1"
).replace(/\/+$/, "");

export async function authFetch(path: string, init: RequestInit = {}) {
  const session = await getSession();
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (session) {
    headers.set("Authorization", `Bearer ${session.token}`);
  }

  return fetch(
    `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`,
    {
      ...init,
      headers,
      cache: "no-store",
    },
  );
}
