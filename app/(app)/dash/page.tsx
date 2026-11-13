import Link from "next/link";
import {
  BookOpen,
  ClipboardCheck,
  Users,
  GraduationCap,
  FileText,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireSession } from "@/lib/auth";
import type { Permission } from "@/lib/permissions";

export const instant = false;

type DashboardItem = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
};

const items: DashboardItem[] = [
  {
    label: "Clases",
    description: "Modalidades de danza por clase",
    href: "/classes",
    icon: BookOpen,
    permission: "academic:read",
  },
  {
    label: "Disciplinas",
    description: "Gestión de modalidades de danza",
    href: "/disciplines",
    icon: GraduationCap,
    permission: "academic:read",
  },
  {
    label: "Exámenes",
    description: "Evaluaciones y exámenes",
    href: "/exams",
    icon: ClipboardCheck,
    permission: "academic:read",
  },
  {
    label: "Resultados",
    description: "Calificaciones de exámenes",
    href: "/exam-results",
    icon: ClipboardCheck,
    permission: "academic:read",
  },
  {
    label: "Inscripciones",
    description: "Alumnos inscritos en clases",
    href: "/enrollments",
    icon: Users,
    permission: "academic:read",
  },
  {
    label: "Facturas",
    description: "Gestión de facturación",
    href: "/invoices",
    icon: FileText,
    permission: "invoices:read",
  },
];

export default async function AcademicPage() {
  const session = await requireSession();
  const visibleItems = items.filter((item) =>
    session.permissions.has(item.permission),
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Panel Académico</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sesión iniciada correctamente. Selecciona un módulo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Icon className="size-5 text-primary" />
                    <CardTitle className="text-lg">{item.label}</CardTitle>
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
