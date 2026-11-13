"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { RotateCw } from "lucide-react";

import { ExamForm } from "@/components/academic/exam-form";
import { NotFoundPage } from "@/components/not-found-page";
import { TableSkeleton } from "@/components/suspense-table";
import { Button } from "@/components/ui/button";
import { isNotFound } from "@/lib/api-client";
import { useExam } from "@/lib/query/exams";
import { useExamResultsByExam } from "@/lib/query/exam-results";

export default function EditExamPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 p-8">
          <TableSkeleton columns={3} />
        </div>
      }
    >
      <EditExamContent />
    </Suspense>
  );
}

function EditExamContent() {
  const params = useParams<{ id: string }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const examId = Number(rawId);

  const examQuery = useExam(examId);
  const resultsQuery = useExamResultsByExam(examId);

  if (examQuery.isLoading || resultsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <TableSkeleton columns={3} />
      </div>
    );
  }

  if (examQuery.isError) {
    if (isNotFound(examQuery.error)) {
      return (
        <NotFoundPage
          title="Examen no encontrado"
          description="El examen que querés editar no existe o ya no está disponible."
          href="/exams"
          actionLabel="Volver a exámenes"
        />
      );
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 p-8 text-center">
        <p className="text-sm font-medium">No se pudo cargar el examen</p>
        <Button variant="outline" size="sm" onClick={() => examQuery.refetch()}>
          <RotateCw className="size-4" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (!examQuery.data) {
    return (
      <NotFoundPage
        title="Examen no encontrado"
        description="El examen que querés editar no existe o ya no está disponible."
        href="/exams"
        actionLabel="Volver a exámenes"
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <ExamForm
        initialExam={examQuery.data}
        initialResults={resultsQuery.data ?? []}
      />
    </div>
  );
}
