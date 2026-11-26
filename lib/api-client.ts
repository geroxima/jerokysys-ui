import type { PagedFilter, ResponseWrapper } from "@/lib/academic/types";
import { API_BASE_URL } from "@/lib/api-base";
import { clearClientToken, getClientToken } from "@/lib/client-token";

export { API_BASE_URL };

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
 * Cuando el gateway responde 401, limpiamos el token local y volvemos al
 * login. El flag evita varios redirects si hay llamadas en paralelo.
 */
function handleUnauthorized() {
  if (typeof window === "undefined" || handlingUnauthorized) {
    return;
  }

  handlingUnauthorized = true;
  clearClientToken();
  window.location.replace("/login/");
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

  // La API vive en otro origen, así que el navegador adjunta el token que
  // guardó al iniciar sesión como Authorization: Bearer.
  const token = getClientToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

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
        credentials: "omit",
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
    handleUnauthorized();
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
