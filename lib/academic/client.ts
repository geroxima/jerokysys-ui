import { apiGet, apiWrite, ApiError, buildPagedParams } from "@/lib/api-client";

export { ApiError, buildPagedParams };

/**
 * Wrappers finos sobre la capa unica de API. Se mantienen para que los modulos
 * de dominio (`exams.ts`, `classes.ts`, etc.) no tengan que cambiar.
 */
export function get<T>(path: string): Promise<T> {
  return apiGet<T>(path);
}

export function post<T>(path: string, body: unknown): Promise<T> {
  return apiWrite<T>(path, "POST", body);
}

export function put<T>(path: string, body: unknown): Promise<T> {
  return apiWrite<T>(path, "PUT", body);
}

export function del(path: string): Promise<void> {
  return apiWrite<void>(path, "DELETE");
}
