import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getClassById,
  getExamById,
  getExamResultsByExam,
} from "@/lib/academic";
import { cn } from "@/lib/utils";
import { notFoundOn404 } from "@/lib/not-found";

export const instant = false;

export default async function ExamPreviewPage({
  params,
}: PageProps<"/exams/[id]">) {
  const { id } = await params;
  const examId = Number(id);
  if (!Number.isInteger(examId) || examId < 1) notFound();

  const exam = await notFoundOn404(getExamById(examId));
  const [results, danceClass] = await Promise.all([
    getExamResultsByExam(examId),
    getClassById(exam.danceClassId).catch(() => null),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{exam.examName}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Vista previa del examen</p>
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
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    No hay alumnos registrados en este examen.
                  </TableCell>
                </TableRow>
              ) : (
                results.map((result, index) => (
                  <TableRow key={result.id ?? `${result.studentId}-${index}`}>
                    <TableCell className="font-medium">
                      {result.studentId == null ? "Alumno sin ID" : `Alumno #${result.studentId}`}
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
