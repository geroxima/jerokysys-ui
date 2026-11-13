import { NextResponse } from "next/server";

import { API_BASE_URL } from "@/lib/api";
import { saveSession } from "@/lib/auth";

function formatWait(seconds: number) {
  if (seconds < 60) {
    return `${seconds} ${seconds === 1 ? "segundo" : "segundos"}`;
  }

  const minutes = Math.ceil(seconds / 60);
  return `${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
}

export async function POST(request: Request) {
  let body: { username?: unknown; password?: unknown };

  try {
    body = (await request.json()) as { username?: unknown; password?: unknown };
  } catch {
    return NextResponse.json(
      { error: "La solicitud no es válida." },
      { status: 400 },
    );
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Ingresá tu usuario y contraseña." },
      { status: 400 },
    );
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
    return NextResponse.json(
      {
        error:
          "No se pudo conectar con el servidor. Verificá que la API esté en línea.",
      },
      { status: 502 },
    );
  }

  if (response.status === 401) {
    return NextResponse.json(
      { error: "Usuario o contraseña incorrectos." },
      { status: 401 },
    );
  }

  if (response.status === 429) {
    const retryAfter = Number(response.headers.get("Retry-After") ?? 0);
    const message =
      retryAfter > 0
        ? `Demasiados intentos. Volvé a intentar en ${formatWait(Math.ceil(retryAfter))}.`
        : "Demasiados intentos. Esperá unos minutos y volvé a intentar.";

    return NextResponse.json({ error: message }, { status: 429 });
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: "Ocurrió un error inesperado. Intentá de nuevo." },
      { status: 502 },
    );
  }

  const token = (await response.text()).trim();

  if (token.split(".").length !== 3) {
    return NextResponse.json(
      { error: "La respuesta del servidor no es válida." },
      { status: 502 },
    );
  }

  await saveSession(token);

  return NextResponse.json({ ok: true });
}
