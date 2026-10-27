import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE } from "@/lib/auth-cookie";
import { isJwtExpired } from "@/lib/jwt";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const hasValidSession = token ? !isJwtExpired(token) : false;
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(hasValidSession ? "/academic" : "/login", request.url),
    );
  }

  if (pathname === "/login") {
    if (hasValidSession) {
      return NextResponse.redirect(new URL("/academic", request.url));
    }

    return NextResponse.next();
  }

  if (!hasValidSession) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(AUTH_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff|woff2)$).*)",
  ],
};
