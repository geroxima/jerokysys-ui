import type { PagedFilter, ResponseWrapper } from "@/lib/academic/types";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1"
).replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  code: string | null;

  constructor(status: number, code: string | null, message: string | null) {
    super(message ?? `API error ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** Alias histórico para no romper imports existentes. */
export const ApiClientError = ApiError;

export function isUnauthorized(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 401;
}

export function isForbidden(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 403;
}

export function isNotFound(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 404;
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

let handlingUnauthorized = false;

/**
 * La cookie es httpOnly: el cliente no puede borrarla. Cuando el gateway
 * responde 401, limpiamos la sesión por el endpoint de logout y volvemos al
 * login. El flag evita varios redirects si hay llamadas en paralelo.
 */
async function handleUnauthorized() {
  if (typeof window === "undefined" || handlingUnauthorized) {
    return;
  }

  handlingUnauthorized = true;

  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
  } catch {
    // Si el logout falla igual mandamos al login; proxy.ts limpia la cookie
    // vencida en la próxima navegación.
  }

  window.location.replace("/login");
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
    throw new ApiError(
      response.status,
      envelope?.code ?? null,
      envelope?.message ?? text ?? `Error HTTP ${response.status}`,
    );
  }

  if (!envelope) {
    return undefined as T;
  }

  if (envelope.success === false) {
    throw new ApiError(
      envelope.status || response.status,
      envelope.code,
      envelope.message,
    );
  }

  return envelope.data;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`,
      {
        ...init,
        headers,
        credentials: "include",
        cache: "no-store",
      },
    );
  } catch {
    throw new ApiError(
      0,
      null,
      "No se pudo conectar con el servidor. Verificá que la API esté en línea.",
    );
  }

  if (response.status === 401) {
    await handleUnauthorized();
  }

  return unwrap<T>(response);
}

export function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: "GET" });
}

export function apiWrite<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  return apiRequest<T>(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
