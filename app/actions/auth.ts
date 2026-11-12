"use server";

import { redirect } from "next/navigation";

import { API_BASE_URL } from "@/lib/api";
import { destroySession, saveSession } from "@/lib/auth";

export type LoginState = { error: string } | null;

function formatWait(seconds: number) {
  if (seconds < 60) {
    return `${seconds} ${seconds === 1 ? "segundo" : "segundos"}`;
  }

  const minutes = Math.ceil(seconds / 60);
  return `${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
}

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Ingresa tu usuario y contraseña." };
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return {
      error:
        "No se pudo conectar con el servidor. Verifica que la API esté en línea.",
    };
  }

  if (response.status === 401) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  if (response.status === 429) {
    const retryAfter = Number(response.headers.get("Retry-After") ?? 0);

    if (retryAfter > 0) {
      return {
        error: `Demasiados intentos. Vuelve a intentar en ${formatWait(Math.ceil(retryAfter))}.`,
      };
    }

    return {
      error: "Demasiados intentos. Espera unos minutos y vuelve a intentar.",
    };
  }

  if (!response.ok) {
    return { error: "Ocurrió un error inesperado. Intenta de nuevo." };
  }

  const token = (await response.text()).trim();

  if (token.split(".").length !== 3) {
    return { error: "La respuesta del servidor no es válida." };
  }

  await saveSession(token);
  redirect("/dash");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
