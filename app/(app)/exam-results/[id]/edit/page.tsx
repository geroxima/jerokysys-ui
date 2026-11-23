"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";

import { ExamResultForm } from "@/components/academic/exam-result-form";
import { NotFoundPage } from "@/components/not-found-page";
import { RequirePermission } from "@/components/require-permission";
import { useExamResult } from "@/lib/query/exam-results";

export default function EditExamResultPage() {
  return (
    <RequirePermission permission="academic:write">
      <Suspense
        fallback={<div className="min-h-screen bg-slate-50 p-8 text-sm text-muted-foreground">Cargando…</div>}
      >
        <EditExamResultContent />
      </Suspense>
    </RequirePermission>
  );
}

function EditExamResultContent() {
  const params = useParams<{ id: string }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(rawId);
  const { data, isLoading, isError } = useExamResult(id);

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 p-8 text-sm text-muted-foreground">Cargando…</div>;
  }

  if (isError || !data) {
    return (
      <NotFoundPage
        title="Resultado no encontrado"
        description="El resultado que querés editar no existe o fue eliminado."
        href="/exam-results"
        actionLabel="Volver a resultados"
      />
    );
  }

  return <ExamResultForm initial={data} />;
}
