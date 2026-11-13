import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { AUTH_COOKIE } from "@/lib/auth-cookie";
import { decodeJwt, isJwtExpired, jwtMaxAge } from "@/lib/jwt";

export type Session = {
  token: string;
  username: string;
  role: string;
  expiresAt: number;
};

export async function saveSession(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: jwtMaxAge(token),
    ...(process.env.AUTH_COOKIE_DOMAIN
      ? { domain: process.env.AUTH_COOKIE_DOMAIN }
      : {}),
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}

export async function getSession(): Promise<Session | null> {
  await connection();

  const token = (await cookies()).get(AUTH_COOKIE)?.value;

  if (!token || isJwtExpired(token)) {
    return null;
  }

  const payload = decodeJwt(token);
  if (!payload) {
    return null;
  }

  return {
    token,
    username: payload.username ?? "",
    role: payload.role ?? "",
    expiresAt: (payload.exp ?? 0) * 1000,
  };
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
