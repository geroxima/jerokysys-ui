"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";

import { ExamsList } from "@/components/academic/exams-list";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { usePagedFilter } from "@/lib/use-paged-filter";

function ExamsContent() {
  const params = useSearchParams();
  const filter = usePagedFilter("examDate", "DESC");

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Exámenes</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gestión de exámenes y evaluaciones
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

export default function ExamsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8" />}>
      <ExamsContent />
    </Suspense>
  );
}
