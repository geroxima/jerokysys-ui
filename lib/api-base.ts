/**
 * URL base de la API. En el build estático se resuelve en tiempo de
 * compilación a partir de NEXT_PUBLIC_API_BASE_URL.
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1"
).replace(/\/+$/, "");
