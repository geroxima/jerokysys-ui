import {
  FileText,
  GraduationCap,
  LayoutGrid,
  Settings,
  Users,
  UsersRound,
  ClipboardCheck,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

import type { Permission } from "@/lib/permissions";

export type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  /** Permiso requerido para ver el item; si no se define, es visible para todo usuario autenticado. */
  permission?: Permission;
};

export type SidebarSection = {
  label?: string;
  items: SidebarItem[];
};

export const sidebarSections: SidebarSection[] = [
  {
    items: [
      {
        label: "Inicio",
        href: "/dash",
        icon: LayoutGrid,
        exact: true,
      },
    ],
  },
  {
    label: "Gestión",
    items: [
      {
        label: "Facturas",
        href: "/invoices",
        icon: FileText,
        permission: "invoices:read",
      },
    ],
  },
  {
    label: "Académico",
    items: [
      {
        label: "Clases",
        href: "/classes",
        icon: BookOpen,
        permission: "academic:read",
      },
      {
        label: "Disciplinas",
        href: "/disciplines",
        icon: GraduationCap,
        permission: "academic:read",
      },
      {
        label: "Exámenes",
        href: "/exams",
        icon: ClipboardCheck,
        permission: "academic:read",
      },
      {
        label: "Inscripciones",
        href: "/enrollments",
        icon: Users,
        permission: "academic:read",
      },
    ],
  },
  {
    label: "Personas",
    items: [
      {
        label: "Alumnos",
        href: "/students",
        icon: Users,
        permission: "personas:read",
      },
      {
        label: "Responsables",
        href: "/guardians",
        icon: UsersRound,
        permission: "personas:read",
      },
      {
        label: "Profesores",
        href: "/instructors",
        icon: GraduationCap,
        permission: "personas:read",
      },
    ],
  },

  {
    label: "Sistema",
    items: [
      {
        label: "Ajustes",
        href: "/settings",
        icon: Settings,
        permission: "users:manage",
      },
    ],
  },
];

/**
 * Devuelve las secciones visibles para un conjunto de permisos, ocultando los
 * items sin permiso y las secciones que quedan vacias.
 */
export function visibleSections(
  permissions: ReadonlySet<Permission>,
): SidebarSection[] {
  return sidebarSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.permission || permissions.has(item.permission),
      ),
    }))
    .filter((section) => section.items.length > 0);
}
