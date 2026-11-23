"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { DetailCard } from "@/components/detail-card";
import { NotFoundPage } from "@/components/not-found-page";
import { RequirePermission } from "@/components/require-permission";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  classLabel,
  enrollmentStatusLabels,
  studentLabel,
  toNameMap,
} from "@/lib/academic/labels";
import { cn } from "@/lib/utils";
import { useAllClasses } from "@/lib/query/classes";
import { useAllStudents } from "@/lib/query/students";
import { useEnrollment } from "@/lib/query/enrollments";

export default function EnrollmentDetailPage() {
  return (
    <RequirePermission permission="academic:read">
      <Suspense
        fallback={<div className="min-h-screen bg-slate-50 p-8 text-sm text-muted-foreground">Cargando…</div>}
      >
        <EnrollmentDetailContent />
      </Suspense>
    </RequirePermission>
  );
}

function EnrollmentDetailContent() {
  const params = useParams<{ id: string }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(rawId);
  const { data, isLoading, isError } = useEnrollment(id);
  const { data: students = [] } = useAllStudents();
  const { data: classes = [] } = useAllClasses();

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 p-8 text-sm text-muted-foreground">Cargando…</div>;
  }

  if (isError || !data) {
    return (
      <NotFoundPage
        title="Inscripción no encontrada"
        description="La inscripción que buscás no existe o fue eliminada."
        href="/enrollments"
        actionLabel="Volver a inscripciones"
      />
    );
  }

  const studentMap = toNameMap(students, studentLabel);
  const classMap = toNameMap(classes, classLabel);
  const status = data.status ?? "";

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {studentMap.get(data.studentId) ?? "Inscripción"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Detalle de la inscripción</p>
        </div>
        <Link
          href="/enrollments"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Volver
        </Link>
      </div>

      <DetailCard
        title="Información"
        items={[
          { label: "Alumno", value: studentMap.get(data.studentId) ?? "—" },
          { label: "Clase", value: classMap.get(data.classId) ?? "—" },
          { label: "Fecha", value: data.enrollmentDate },
          { label: "Precio acordado", value: data.agreedPrice != null ? `$${data.agreedPrice}` : "—" },
          {
            label: "Estado",
            value: (
              <Badge variant="secondary">
                {enrollmentStatusLabels[status] ?? (status || "—")}
              </Badge>
            ),
          },
        ]}
      />
    </div>
  );
}
