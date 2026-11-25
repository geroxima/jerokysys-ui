/**
 * Copia del JWT para el cliente. La cookie httpOnly no se puede leer desde
 * JavaScript ni se envía a otro origen, así que el navegador guarda el token
 * en sessionStorage y lo manda como `Authorization: Bearer` cuando la API vive
 * en un dominio distinto al de la UI.
 *
 * Todo el acceso está envuelto en try/catch: el storage puede estar bloqueado
 * (modo privado, políticas del navegador) y el código también corre en SSR.
 */

const TOKEN_KEY = "jerokysys_token";

export function getClientToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setClientToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Sin storage el cliente seguirá dependiendo de la cookie del mismo origen.
  }
}

export function clearClientToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nada que limpiar si el storage no está disponible.
  }
}
