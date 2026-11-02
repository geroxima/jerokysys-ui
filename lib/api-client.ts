import type { PagedFilter, ResponseWrapper } from "@/lib/academic/types";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1"
).replace(/\/+$/, "");

export class ApiClientError extends Error {
  status: number;
  code: string | null;

  constructor(status: number, code: string | null, message: string | null) {
    super(message ?? `API error ${status}`);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
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

  const text = await response.text().catch(() => "");
  let envelope: ResponseWrapper<T> | null = null;
  if (text) {
    try {
      envelope = JSON.parse(text) as ResponseWrapper<T>;
    } catch {
      envelope = null;
    }
  }

  if (!response.ok) {
    throw new ApiClientError(
      response.status,
      envelope?.code ?? null,
      envelope?.message ?? text ?? `Request failed: ${response.statusText}`,
    );
  }

  if (!envelope) {
    return undefined as T;
  }

  if (!envelope.success) {
    throw new ApiClientError(
      envelope.status || response.status,
      envelope.code,
      envelope.message,
    );
  }

  return envelope.data;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  return unwrap<T>(response);
}

export async function apiWrite<T>(
  path: string,
  method: "POST" | "PUT" | "DELETE",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return unwrap<T>(response);
}
