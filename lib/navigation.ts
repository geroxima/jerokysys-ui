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
      },
      {
        label: "Disciplinas",
        href: "/disciplines",
        icon: GraduationCap,
      },
      {
        label: "Exámenes",
        href: "/exams",
        icon: ClipboardCheck,
      },
      {
        label: "Inscripciones",
        href: "/enrollments",
        icon: Users,
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
