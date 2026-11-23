"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { DetailCard } from "@/components/detail-card";
import { NotFoundPage } from "@/components/not-found-page";
import { RequirePermission } from "@/components/require-permission";
import { buttonVariants } from "@/components/ui/button";
import { examLabel, studentLabel, toNameMap } from "@/lib/academic/labels";
import { cn } from "@/lib/utils";
import { useAllExams } from "@/lib/query/exams";
import { useAllStudents } from "@/lib/query/students";
import { useExamResult } from "@/lib/query/exam-results";

export default function ExamResultDetailPage() {
  return (
    <RequirePermission permission="academic:read">
      <Suspense
        fallback={<div className="min-h-screen bg-slate-50 p-8 text-sm text-muted-foreground">Cargando…</div>}
      >
        <ExamResultDetailContent />
      </Suspense>
    </RequirePermission>
  );
}

function ExamResultDetailContent() {
  const params = useParams<{ id: string }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(rawId);
  const { data, isLoading, isError } = useExamResult(id);
  const { data: exams = [] } = useAllExams();
  const { data: students = [] } = useAllStudents();

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 p-8 text-sm text-muted-foreground">Cargando…</div>;
  }

  if (isError || !data) {
    return (
      <NotFoundPage
        title="Resultado no encontrado"
        description="El resultado que buscás no existe o fue eliminado."
        href="/exam-results"
        actionLabel="Volver a resultados"
      />
    );
  }

  const examMap = toNameMap(exams, examLabel);
  const studentMap = toNameMap(students, studentLabel);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {studentMap.get(data.studentId ?? 0) ?? "Resultado"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Detalle del resultado</p>
        </div>
        <Link
          href="/exam-results"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Volver
        </Link>
      </div>

      <DetailCard
        title="Información"
        items={[
          { label: "Examen", value: data.examId != null ? examMap.get(data.examId) ?? "—" : "—" },
          { label: "Alumno", value: data.studentId != null ? studentMap.get(data.studentId) ?? "—" : "—" },
          { label: "Puntaje", value: data.score ?? "—" },
          { label: "Observaciones", value: data.remarks },
        ]}
      />
    </div>
  );
}
