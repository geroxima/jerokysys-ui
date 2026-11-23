"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { examLabel, studentLabel } from "@/lib/academic/labels";
import { useAllExams } from "@/lib/query/exams";
import { useAllStudents } from "@/lib/query/students";
import { useCreateExamResult, useUpdateExamResult } from "@/lib/query/exam-results";
import type { ExamResultDTO } from "@/lib/academic/types";

const EMPTY_FORM = {
  examId: "",
  studentId: "",
  score: "",
  remarks: "",
};

export function ExamResultForm({ initial }: { initial?: ExamResultDTO }) {
  const router = useRouter();
  const isEditing = initial?.id != null;
  const createExamResult = useCreateExamResult();
  const updateExamResult = useUpdateExamResult();
  const { data: exams = [], isLoading: isLoadingExams } = useAllExams();
  const { data: students = [], isLoading: isLoadingStudents } = useAllStudents();
  const [form, setForm] = useState(
    initial
      ? {
          examId: initial.examId != null ? String(initial.examId) : "",
          studentId: initial.studentId != null ? String(initial.studentId) : "",
          score: initial.score != null ? String(initial.score) : "",
          remarks: initial.remarks ?? "",
        }
      : EMPTY_FORM,
  );

  const pending = createExamResult.isPending || updateExamResult.isPending;

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const dto = {
      examId: Number(form.examId),
      studentId: Number(form.studentId),
      score: form.score || null,
      remarks: form.remarks || null,
    };

    try {
      if (isEditing) {
        await updateExamResult.mutateAsync({ id: initial!.id as number, dto });
        toast.success("Resultado actualizado");
      } else {
        await createExamResult.mutateAsync(dto);
        toast.success("Resultado creado");
        setForm(EMPTY_FORM);
      }
      router.push("/exam-results");
    } catch (error) {
      toast.error(`Error al ${isEditing ? "actualizar" : "crear"} el resultado`, {
        description: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditing ? "Editar Resultado" : "Nuevo Resultado"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isEditing ? "Actualizar resultado de examen" : "Registrar resultado de examen"}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Información</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="examId">Examen</Label>
              <Select
                value={form.examId}
                onValueChange={(value) => update("examId", value ?? "")}
                disabled={isLoadingExams || exams.length === 0}
              >
                <SelectTrigger id="examId">
                  <SelectValue
                    placeholder={
                      isLoadingExams
                        ? "Cargando exámenes..."
                        : exams.length === 0
                          ? "No hay exámenes disponibles"
                          : "Seleccionar examen"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {exams
                    .filter((exam) => exam.id !== null)
                    .map((exam) => (
                      <SelectItem key={exam.id} value={String(exam.id)}>
                        {examLabel(exam)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="studentId">Alumno</Label>
              <Select
                value={form.studentId}
                onValueChange={(value) => update("studentId", value ?? "")}
                disabled={isLoadingStudents || students.length === 0}
              >
                <SelectTrigger id="studentId">
                  <SelectValue
                    placeholder={
                      isLoadingStudents
                        ? "Cargando alumnos..."
                        : students.length === 0
                          ? "No hay alumnos disponibles"
                          : "Seleccionar alumno"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {students
                    .filter((student) => student.id !== null)
                    .map((student) => (
                      <SelectItem key={student.id} value={String(student.id)}>
                        {studentLabel(student)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="score">Puntaje</Label>
              <Input
                id="score"
                type="number"
                step="0.01"
                value={form.score}
                onChange={(event) => update("score", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="remarks">Observaciones</Label>
              <Input
                id="remarks"
                value={form.remarks}
                onChange={(event) => update("remarks", event.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={
              pending ||
              !form.examId ||
              !form.studentId ||
              isLoadingExams ||
              isLoadingStudents
            }
          >
            {pending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear resultado"}
          </Button>
        </div>
      </form>
    </div>
  );
}
