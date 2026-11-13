"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RotateCw } from "lucide-react";

import { NotFoundPage } from "@/components/not-found-page";
import { TableSkeleton } from "@/components/suspense-table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isNotFound } from "@/lib/api-client";
import { useClass } from "@/lib/query/classes";
import { useExam } from "@/lib/query/exams";
import { useExamResultsByExam } from "@/lib/query/exam-results";
import { cn } from "@/lib/utils";

export default function ExamPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 p-8">
          <TableSkeleton columns={3} />
        </div>
      }
    >
      <ExamPreviewContent />
    </Suspense>
  );
}

function ExamPreviewContent() {
  const params = useParams<{ id: string }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const examId = Number(rawId);

  const examQuery = useExam(examId);
  const resultsQuery = useExamResultsByExam(examId);
  const classQuery = useClass(examQuery.data?.danceClassId);

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
          description="El examen que buscás no existe o ya no está disponible."
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
        description="El examen que buscás no existe o ya no está disponible."
        href="/exams"
        actionLabel="Volver a exámenes"
      />
    );
  }

  const exam = examQuery.data;
  const results = resultsQuery.data ?? [];
  const danceClass = classQuery.data ?? null;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{exam.examName}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Vista previa del examen
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/exams"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Volver
          </Link>
          <Link
            href={`/exams/${examId}/edit`}
            className={cn(buttonVariants({ size: "default" }))}
          >
            Editar / agregar notas
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información del Examen</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Fecha</p>
            <p className="font-medium">{exam.examDate}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Clase</p>
            <p className="font-medium">
              {danceClass
                ? `${danceClass.level} · ${danceClass.dayOfWeek} ${danceClass.startTime}-${danceClass.endTime}`
                : `Clase #${exam.danceClassId}`}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Alumnos evaluados</p>
            <p className="font-medium">{results.length}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alumnos y calificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alumno</TableHead>
                <TableHead>Calificación</TableHead>
                <TableHead>Observaciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No hay alumnos registrados en este examen.
                  </TableCell>
                </TableRow>
              ) : (
                results.map((result, index) => (
                  <TableRow key={result.id ?? `${result.studentId}-${index}`}>
                    <TableCell className="font-medium">
                      {result.studentId == null
                        ? "Alumno sin ID"
                        : `Alumno #${result.studentId}`}
                    </TableCell>
                    <TableCell>{result.score ?? "—"}</TableCell>
                    <TableCell>{result.remarks || "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
