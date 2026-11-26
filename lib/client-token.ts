/**
 * Token JWT del cliente. La UI es estática y la API vive en otro origen, así
 * que el navegador guarda el token en sessionStorage y lo envía como
 * `Authorization: Bearer`.
 *
 * Todo el acceso está envuelto en try/catch: el storage puede estar bloqueado
 * (modo privado, políticas del navegador) y el código también corre en SSR.
 */

const TOKEN_KEY = "jerokysys_token";
const TOKEN_EVENT = "jerokysys-token-change";

function notifyTokenChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(TOKEN_EVENT));
  }
}

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
    // Sin storage no hay sesión persistente que anunciar.
    return;
  }

  notifyTokenChange();
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

  notifyTokenChange();
}

/**
 * Suscripción al token para useSyncExternalStore. Escucha los cambios hechos
 * por esta pestaña y los de otras pestañas (evento storage).
 */
export function subscribeClientToken(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(TOKEN_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(TOKEN_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
