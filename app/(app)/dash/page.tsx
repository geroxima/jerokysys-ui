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

type DashboardItem = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

const items: DashboardItem[] = [
  {
    label: "Clases",
    description: "Modalidades de danza por clase",
    href: "/classes",
    icon: BookOpen,
  },
  {
    label: "Disciplinas",
    description: "Gestión de modalidades de danza",
    href: "/disciplines",
    icon: GraduationCap,
  },
  {
    label: "Exámenes",
    description: "Evaluaciones y exámenes",
    href: "/exams",
    icon: ClipboardCheck,
  },
  {
    label: "Resultados",
    description: "Calificaciones de exámenes",
    href: "/exam-results",
    icon: ClipboardCheck,
  },
  {
    label: "Inscripciones",
    description: "Alumnos inscritos en clases",
    href: "/enrollments",
    icon: Users,
  },
  {
    label: "Facturas",
    description: "Gestión de facturación",
    href: "/invoices",
    icon: FileText,
  },
];

export default function AcademicPage() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Panel Académico</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sesión iniciada correctamente. Selecciona un módulo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
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
