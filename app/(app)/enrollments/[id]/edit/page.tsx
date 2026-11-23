"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";

import { EnrollmentForm } from "@/components/academic/enrollment-form";
import { NotFoundPage } from "@/components/not-found-page";
import { RequirePermission } from "@/components/require-permission";
import { useEnrollment } from "@/lib/query/enrollments";

export default function EditEnrollmentPage() {
  return (
    <RequirePermission permission="academic:write">
      <Suspense
        fallback={<div className="min-h-screen bg-slate-50 p-8 text-sm text-muted-foreground">Cargando…</div>}
      >
        <EditEnrollmentContent />
      </Suspense>
    </RequirePermission>
  );
}

function EditEnrollmentContent() {
  const params = useParams<{ id: string }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(rawId);
  const { data, isLoading, isError } = useEnrollment(id);

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 p-8 text-sm text-muted-foreground">Cargando…</div>;
  }

  if (isError || !data) {
    return (
      <NotFoundPage
        title="Inscripción no encontrada"
        description="La inscripción que querés editar no existe o fue eliminada."
        href="/enrollments"
        actionLabel="Volver a inscripciones"
      />
    );
  }

  return <EnrollmentForm initial={data} />;
}
