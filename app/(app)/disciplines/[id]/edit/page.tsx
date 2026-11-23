"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";

import { DisciplineForm } from "@/components/academic/discipline-form";
import { NotFoundPage } from "@/components/not-found-page";
import { RequirePermission } from "@/components/require-permission";
import { useDiscipline } from "@/lib/query/disciplines";

export default function EditDisciplinePage() {
  return (
    <RequirePermission permission="academic:write">
      <Suspense
        fallback={<div className="min-h-screen bg-slate-50 p-8 text-sm text-muted-foreground">Cargando…</div>}
      >
        <EditDisciplineContent />
      </Suspense>
    </RequirePermission>
  );
}

function EditDisciplineContent() {
  const params = useParams<{ id: string }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(rawId);
  const { data, isLoading, isError } = useDiscipline(id);

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 p-8 text-sm text-muted-foreground">Cargando…</div>;
  }

  if (isError || !data) {
    return (
      <NotFoundPage
        title="Disciplina no encontrada"
        description="La disciplina que querés editar no existe o fue eliminada."
        href="/disciplines"
        actionLabel="Volver a disciplinas"
      />
    );
  }

  return <DisciplineForm initial={data} />;
}
