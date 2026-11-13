/**
 * Permisos de la aplicacion. La fuente de verdad es el claim `permissions` del
 * JWT (emitido por `jerokysys-auth`). Este modulo solo lo consume y, como
 * respaldo transitorio mientras existan tokens viejos sin el claim, deriva los
 * permisos del rol.
 */

export const PERMISSIONS = [
  "users:manage",
  "academic:read",
  "academic:write",
  "invoices:read",
  "invoices:write",
  "personas:read",
  "personas:write",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

// Respaldo transitorio: si el token no trae `permissions`, se deriva del rol.
// Eliminar una vez que todos los tokens emitidos antes del despliegue expiren.
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: [
    "users:manage",
    "academic:read",
    "academic:write",
    "invoices:read",
    "invoices:write",
    "personas:read",
    "personas:write",
  ],
  PROFESSOR: ["academic:read", "academic:write"],
  SECRETARY: [
    "academic:read",
    "invoices:read",
    "invoices:write",
    "personas:read",
    "personas:write",
  ],
};

function isPermission(value: string): value is Permission {
  return (PERMISSIONS as readonly string[]).includes(value);
}

export function permissionsFor(
  role?: string,
  claimed?: string[],
): Set<Permission> {
  const source =
    claimed && claimed.length > 0
      ? claimed
      : ROLE_PERMISSIONS[(role ?? "").toUpperCase()] ?? [];

  return new Set(source.filter(isPermission));
}

export function can(
  permissions: ReadonlySet<Permission>,
  permission: Permission,
): boolean {
  return permissions.has(permission);
}

export type RoutePermission = {
  read: Permission;
  write?: Permission;
};

type Route = RoutePermission & { prefix: string };

const ROUTES: Route[] = [
  { prefix: "/classes", read: "academic:read", write: "academic:write" },
  { prefix: "/disciplines", read: "academic:read", write: "academic:write" },
  { prefix: "/exams", read: "academic:read", write: "academic:write" },
  { prefix: "/exam-results", read: "academic:read", write: "academic:write" },
  { prefix: "/enrollments", read: "academic:read", write: "academic:write" },
  { prefix: "/invoices", read: "invoices:read", write: "invoices:write" },
  { prefix: "/students", read: "personas:read", write: "personas:write" },
  { prefix: "/guardians", read: "personas:read", write: "personas:write" },
  { prefix: "/instructors", read: "personas:read", write: "personas:write" },
  { prefix: "/settings", read: "users:manage" },
];

function isWritePath(pathname: string): boolean {
  return pathname.endsWith("/new") || pathname.includes("/edit");
}

/** Permiso (read o write) exigido para una ruta concreta; `null` si no aplica. */
export function requiredPermission(pathname: string): Permission | null {
  for (const route of ROUTES) {
    if (pathname === route.prefix || pathname.startsWith(`${route.prefix}/`)) {
      if (isWritePath(pathname) && route.write) {
        return route.write;
      }
      return route.read;
    }
  }
  return null;
}
