import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";

import { ClassesList } from "@/components/academic/classes-list";
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

export default async function ClassesPage({ searchParams }: Props) {
  const params = await searchParams;
  const filter = {
    page: Number(params.page ?? 0),
    size: Number(params.size ?? 10),
    sort: params.sort ?? "level",
    direction: (params.direction ?? "ASC") as "ASC" | "DESC",
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Clases</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Agrupación de modalidades de danza por clase
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <SearchBar placeholder="Buscar..." />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Link href="/classes" className="flex items-center gap-2">
              <RefreshCw className="size-4" />
              Actualizar
            </Link>
          </Button>
          <Button size="sm">
            <Link href="/classes/new" className="flex items-center gap-2">
              <Plus className="size-4" />
              Nueva clase
            </Link>
          </Button>
        </div>
      </div>

      <ClassesList filter={filter} />
    </div>
  );
}
