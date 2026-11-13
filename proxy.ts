import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE } from "@/lib/auth-cookie";
import { decodeJwt, isJwtExpired } from "@/lib/jwt";
import { permissionsFor, requiredPermission } from "@/lib/permissions";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const payload = token ? decodeJwt(token) : null;
  const hasValidSession = token && payload ? !isJwtExpired(token) : false;
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(hasValidSession ? "/dash" : "/login", request.url),
    );
  }

  if (pathname === "/login") {
    if (hasValidSession) {
      return NextResponse.redirect(new URL("/dash", request.url));
    }

    return NextResponse.next();
  }

  if (!hasValidSession) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(AUTH_COOKIE);
    return response;
  }

  // Página de "sin permiso": siempre accesible con sesion.
  if (pathname === "/403") {
    return NextResponse.next();
  }

  // Verificación de permisos por ruta. Solo UX: el gateway es la barrera real.
  const permission = requiredPermission(pathname);
  if (permission) {
    const permissions = permissionsFor(payload?.role, payload?.permissions);
    if (!permissions.has(permission)) {
      return NextResponse.redirect(new URL("/403", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff|woff2)$).*)",
  ],
};
