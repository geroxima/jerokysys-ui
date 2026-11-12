import "server-only";

import { authFetch } from "@/lib/api";
import type { PagedFilter, ResponseWrapper } from "./types";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string | null,
    message: string | null,
  ) {
    super(message ?? `API error ${status}`);
    this.name = "ApiError";
  }
}

export function buildPagedParams(filter: PagedFilter): string {
  const params = new URLSearchParams({
    page: String(filter.page),
    size: String(filter.size),
  });
  if (filter.sort) params.set("sort", filter.sort);
  if (filter.direction) params.set("direction", filter.direction);
  return params.toString();
}

async function unwrap<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new ApiError(response.status, null, text || `Request failed: ${response.statusText}`);
  }

  const envelope: ResponseWrapper<T> = await response.json();

  if (!envelope.success) {
    throw new ApiError(
      envelope.status || response.status,
      envelope.code,
      envelope.message,
    );
  }

  return envelope.data;
}

export async function get<T>(path: string): Promise<T> {
  const response = await authFetch(path);
  return unwrap<T>(response);
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await authFetch(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return unwrap<T>(response);
}

export async function put<T>(path: string, body: unknown): Promise<T> {
  const response = await authFetch(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return unwrap<T>(response);
}

export async function del(path: string): Promise<void> {
  const response = await authFetch(path, { method: "DELETE" });
  if (response.status === 204) return;
  return unwrap<void>(response);
}
