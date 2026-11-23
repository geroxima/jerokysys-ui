"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { DetailCard } from "@/components/detail-card";
import { NotFoundPage } from "@/components/not-found-page";
import { RequirePermission } from "@/components/require-permission";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { dayLabel, danceClassStatusLabels, toNameMap } from "@/lib/academic/labels";
import { cn } from "@/lib/utils";
import { useClass } from "@/lib/query/classes";
import { useAllDisciplines } from "@/lib/query/disciplines";

export default function ClassDetailPage() {
  return (
    <RequirePermission permission="academic:read">
      <Suspense
        fallback={<div className="min-h-screen bg-slate-50 p-8 text-sm text-muted-foreground">Cargando…</div>}
      >
        <ClassDetailContent />
      </Suspense>
    </RequirePermission>
  );
}

function ClassDetailContent() {
  const params = useParams<{ id: string }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(rawId);
  const { data, isLoading, isError } = useClass(id);
  const { data: disciplines = [] } = useAllDisciplines();

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 p-8 text-sm text-muted-foreground">Cargando…</div>;
  }

  if (isError || !data) {
    return (
      <NotFoundPage
        title="Clase no encontrada"
        description="La clase que buscás no existe o fue eliminada."
        href="/classes"
        actionLabel="Volver a clases"
      />
    );
  }

  const disciplineMap = toNameMap(disciplines, (discipline) => discipline.name);
  const status = data.status ?? "";

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{data.level}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Detalle de la clase</p>
        </div>
        <Link
          href="/classes"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Volver
        </Link>
      </div>

      <DetailCard
        title="Información"
        items={[
          { label: "Disciplina", value: disciplineMap.get(data.disciplineId) ?? "—" },
          { label: "Nivel", value: data.level },
          { label: "Día", value: dayLabel(data.dayOfWeek) },
          { label: "Horario", value: `${data.startTime} - ${data.endTime}` },
          { label: "Capacidad", value: data.maxCapacity },
          { label: "Precio mensual", value: `$${data.monthlyPrice}` },
          {
            label: "Estado",
            value: (
              <Badge variant="secondary">
                {danceClassStatusLabels[status] ?? (status || "—")}
              </Badge>
            ),
          },
        ]}
      />
    </div>
  );
}
