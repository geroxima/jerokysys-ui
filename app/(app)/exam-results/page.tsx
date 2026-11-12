import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";

import { ExamResultsList } from "@/components/academic/exam-results-list";
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

export default async function ExamResultsPage({ searchParams }: Props) {
  const params = await searchParams;
  const filter = {
    page: Number(params.page ?? 0),
    size: Number(params.size ?? 10),
    sort: params.sort ?? "id",
    direction: (params.direction ?? "DESC") as "ASC" | "DESC",
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Resultados de Exámenes</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Calificaciones y observaciones de exámenes
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <SearchBar placeholder="Buscar..." />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Link href="/exam-results" className="flex items-center gap-2">
              <RefreshCw className="size-4" />
              Actualizar
            </Link>
          </Button>
          <Button size="sm">
            <Link href="/exam-results/new" className="flex items-center gap-2">
              <Plus className="size-4" />
              Nuevo resultado
            </Link>
          </Button>
        </div>
      </div>

      <ExamResultsList filter={filter} />
    </div>
  );
}
