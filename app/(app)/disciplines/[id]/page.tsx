"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { DetailCard } from "@/components/detail-card";
import { NotFoundPage } from "@/components/not-found-page";
import { RequirePermission } from "@/components/require-permission";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDiscipline } from "@/lib/query/disciplines";

export default function DisciplineDetailPage() {
  return (
    <RequirePermission permission="academic:read">
      <Suspense
        fallback={<div className="min-h-screen bg-slate-50 p-8 text-sm text-muted-foreground">Cargando…</div>}
      >
        <DisciplineDetailContent />
      </Suspense>
    </RequirePermission>
  );
}

function DisciplineDetailContent() {
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
        description="La disciplina que buscás no existe o fue eliminada."
        href="/disciplines"
        actionLabel="Volver a disciplinas"
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{data.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Detalle de la disciplina</p>
        </div>
        <Link
          href="/disciplines"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Volver
        </Link>
      </div>

      <DetailCard
        title="Información"
        items={[
          { label: "Nombre", value: data.name },
          { label: "Descripción", value: data.description },
        ]}
      />
    </div>
  );
}
