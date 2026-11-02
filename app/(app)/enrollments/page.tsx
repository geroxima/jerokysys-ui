import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";

import { EnrollmentsList } from "@/components/academic/enrollments-list";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";

export const instant = false;

type Props = {
  searchParams: Promise<{
    page?: string;
    size?: string;
    sort?: string;
    direction?: string;
  }>;
};

export default async function EnrollmentsPage({ searchParams }: Props) {
  const params = await searchParams;
  const filter = {
    page: Number(params.page ?? 0),
    size: Number(params.size ?? 10),
    sort: params.sort ?? "enrollmentDate",
    direction: (params.direction ?? "DESC") as "ASC" | "DESC",
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Inscripciones</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gestión de inscripciones de alumnos en clases
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <SearchBar placeholder="Buscar..." />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Link href="/enrollments" className="flex items-center gap-2">
              <RefreshCw className="size-4" />
              Actualizar
            </Link>
          </Button>
          <Button size="sm">
            <Link href="/enrollments/new" className="flex items-center gap-2">
              <Plus className="size-4" />
              Nueva inscripción
            </Link>
          </Button>
        </div>
      </div>

      <EnrollmentsList filter={filter} />
    </div>
  );
}
