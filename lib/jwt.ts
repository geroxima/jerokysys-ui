export type JwtPayload = {
  username?: string;
  role?: string;
  sub?: string;
  iat?: number;
  exp?: number;
};

export function decodeJwt(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as JwtPayload;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 <= Date.now();
}

export function jwtMaxAge(token: string): number {
  const payload = decodeJwt(token);
  if (!payload?.exp) {
    return 0;
  }

  return Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
}
