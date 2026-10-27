import {
  FileText,
  GraduationCap,
  LayoutGrid,
  Megaphone,
  Settings,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
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
        href: "/academic",
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
      },
      {
        label: "Responsables",
        href: "/guardians",
        icon: UsersRound,
      },
      {
        label: "Profesores",
        href: "/professors",
        icon: GraduationCap,
      },
    ],
  },
  {
    label: "Comunicación",
    items: [
      {
        label: "Campañas",
        href: "/campaigns",
        icon: Megaphone,
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
      },
    ],
  },
];
