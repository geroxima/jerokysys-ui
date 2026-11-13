"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";

import { DisciplinesList } from "@/components/academic/disciplines-list";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { usePagedFilter } from "@/lib/use-paged-filter";

function DisciplinesContent() {
  const params = useSearchParams();
  const filter = usePagedFilter("name", "ASC");

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Disciplinas</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gestión de modalidades de danza
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <SearchBar
          placeholder="Buscar por nombre..."
          defaultValue={params.get("name") ?? undefined}
          paramName="name"
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Link href="/disciplines" className="flex items-center gap-2">
              <RefreshCw className="size-4" />
              Actualizar
            </Link>
          </Button>
          <Button size="sm">
            <Link href="/disciplines/new" className="flex items-center gap-2">
              <Plus className="size-4" />
              Nueva disciplina
            </Link>
          </Button>
        </div>
      </div>

      <DisciplinesList filter={filter} />
    </div>
  );
}

export default function DisciplinesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8" />}>
      <DisciplinesContent />
    </Suspense>
  );
}
