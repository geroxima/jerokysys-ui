"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";

import { ClassForm } from "@/components/academic/class-form";
import { NotFoundPage } from "@/components/not-found-page";
import { RequirePermission } from "@/components/require-permission";
import { useClass } from "@/lib/query/classes";

export default function EditClassPage() {
  return (
    <RequirePermission permission="academic:write">
      <Suspense
        fallback={<div className="min-h-screen bg-slate-50 p-8 text-sm text-muted-foreground">Cargando…</div>}
      >
        <EditClassContent />
      </Suspense>
    </RequirePermission>
  );
}

function EditClassContent() {
  const params = useParams<{ id: string }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(rawId);
  const { data, isLoading, isError } = useClass(id);

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 p-8 text-sm text-muted-foreground">Cargando…</div>;
  }

  if (isError || !data) {
    return (
      <NotFoundPage
        title="Clase no encontrada"
        description="La clase que querés editar no existe o fue eliminada."
        href="/classes"
        actionLabel="Volver a clases"
      />
    );
  }

  return <ClassForm initial={data} />;
}
