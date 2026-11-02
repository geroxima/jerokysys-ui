import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";

import { ExamsList } from "@/components/academic/exams-list";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";

export const instant = false;

type Props = {
  searchParams: Promise<{
    page?: string;
    size?: string;
    sort?: string;
    direction?: string;
    name?: string;
  }>;
};

export default async function ExamsPage({ searchParams }: Props) {
  const params = await searchParams;
  const filter = {
    page: Number(params.page ?? 0),
    size: Number(params.size ?? 10),
    sort: params.sort ?? "examDate",
    direction: (params.direction ?? "DESC") as "ASC" | "DESC",
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Exámenes</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gestión de exámenes y evaluaciones
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <SearchBar placeholder="Buscar por nombre..." defaultValue={params.name} paramName="name" />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Link href="/exams" className="flex items-center gap-2">
              <RefreshCw className="size-4" />
              Actualizar
            </Link>
          </Button>
          <Button size="sm">
            <Link href="/exams/new" className="flex items-center gap-2">
              <Plus className="size-4" />
              Nuevo examen
            </Link>
          </Button>
        </div>
      </div>

      <ExamsList filter={filter} />
    </div>
  );
}
