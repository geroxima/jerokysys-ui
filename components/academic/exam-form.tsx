"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useAllClasses } from "@/lib/query/classes";
import { useSaveExam } from "@/lib/query/exams";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  DanceClassDTO,
  ExamDTO,
  ExamResultDTO,
} from "@/lib/academic";

type ResultRow = {
  id?: number;
  studentId: string;
  score: string;
  remarks: string;
};

function classLabel(danceClass: DanceClassDTO) {
  return `Clase #${danceClass.id} · ${danceClass.level} · ${danceClass.dayOfWeek} ${danceClass.startTime}-${danceClass.endTime}`;
}

export function ExamForm({
  initialExam,
  initialResults = [],
}: {
  initialExam?: ExamDTO;
  initialResults?: ExamResultDTO[];
}) {
  const router = useRouter();
  const isEditing = initialExam?.id != null;
  const saveExam = useSaveExam();
  const {
    data: classes = [],
    isLoading: isLoadingClasses,
    error: classesError,
  } = useAllClasses();
  const [examName, setExamName] = useState(initialExam?.examName ?? "");
  const [examDate, setExamDate] = useState(initialExam?.examDate ?? "");
  const [danceClassId, setDanceClassId] = useState(
    initialExam ? String(initialExam.danceClassId) : "",
  );
  const [results, setResults] = useState<ResultRow[]>(() =>
    initialResults.map((result) => ({
      ...(result.id == null ? {} : { id: result.id }),
      studentId: result.studentId == null ? "" : String(result.studentId),
      score: result.score == null ? "" : String(result.score),
      remarks: result.remarks ?? "",
    })),
  );
  const classOptions = classes
    .filter((danceClass) => danceClass.id !== null)
    .map((danceClass) => ({
      value: String(danceClass.id),
      label: classLabel(danceClass),
    }));

  useEffect(() => {
    if (classesError) {
      toast.error("No se pudieron cargar las clases", {
        description:
          classesError instanceof Error ? classesError.message : "Error desconocido",
      });
    }
  }, [classesError]);

  const updateResultRow = (
    index: number,
    field: keyof ResultRow,
    value: string,
  ) => {
    setResults((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!danceClassId) {
      toast.error("Selecciona una clase");
      return;
    }

    try {
      const result = await saveExam.mutateAsync({
        examId: initialExam?.id ?? undefined,
        exam: {
          danceClassId: Number(danceClassId),
          examName,
          examDate,
        },
        results: results
          .filter((row) => row.studentId.trim())
          .map((row) => ({
            id: row.id,
            studentId: Number(row.studentId),
            score: row.score || null,
            remarks: row.remarks || null,
          })),
      });

      if (result.resultsFailed.length > 0) {
        toast.warning(
          `Examen ${isEditing ? "actualizado" : "creado"}, pero ${result.resultsFailed.length} resultado(s) fallaron`,
          {
            description: result.resultsFailed
              .map((failure) => `Alumno ${failure.studentId}: ${failure.error}`)
              .join(", "),
          },
        );
      } else {
        toast.success(isEditing ? "Examen actualizado" : "Examen creado");
      }

      router.push(
        isEditing && result.exam.id
          ? `/exams/${result.exam.id}`
          : "/exams",
      );
    } catch (error) {
      toast.error(`Error al ${isEditing ? "actualizar" : "crear"} el examen`, {
        description:
          error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditing ? "Editar Examen" : "Nuevo Examen"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isEditing
            ? "Actualizar examen y registrar resultados de alumnos"
            : "Crear examen; puedes agregar resultados ahora o más tarde"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Examen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="examName">Nombre</Label>
                <Input
                  id="examName"
                  value={examName}
                  onChange={(event) => setExamName(event.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="examDate">Fecha</Label>
                <Input
                  id="examDate"
                  type="date"
                  value={examDate}
                  onChange={(event) => setExamDate(event.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="danceClassId">Clase</Label>
                <Select
                  value={danceClassId}
                  items={classOptions}
                  onValueChange={(value) => setDanceClassId(value ?? "")}
                  disabled={isLoadingClasses || classes.length === 0}
                >
                  <SelectTrigger id="danceClassId" className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingClasses
                          ? "Cargando clases..."
                          : classes.length === 0
                            ? "No hay clases disponibles"
                            : "Seleccionar clase"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {classes
                        .filter((danceClass) => danceClass.id !== null)
                        .map((danceClass) => (
                          <SelectItem
                            key={danceClass.id}
                            value={String(danceClass.id)}
                          >
                            {classLabel(danceClass)}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Resultados de Alumnos</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setResults((current) => [
                  ...current,
                  { studentId: "", score: "", remarks: "" },
                ])
              }
            >
              <Plus className="mr-2 size-4" />
              Agregar alumno
            </Button>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin resultados. Puedes registrar notas después.
              </p>
            ) : (
              <div className="space-y-3">
                {results.map((row, index) => (
                  <div key={row.id ?? `new-${index}`} className="grid grid-cols-4 items-end gap-3">
                    <div>
                      <Label htmlFor={`studentId-${index}`}>ID Alumno</Label>
                      <Input
                        id={`studentId-${index}`}
                        type="number"
                        min="1"
                        value={row.studentId}
                        onChange={(event) =>
                          updateResultRow(index, "studentId", event.target.value)
                        }
                        required={row.id !== undefined}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`score-${index}`}>Puntaje</Label>
                      <Input
                        id={`score-${index}`}
                        type="number"
                        step="0.01"
                        value={row.score}
                        onChange={(event) =>
                          updateResultRow(index, "score", event.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`remarks-${index}`}>Observaciones</Label>
                      <Input
                        id={`remarks-${index}`}
                        value={row.remarks}
                        onChange={(event) =>
                          updateResultRow(index, "remarks", event.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label="Quitar resultado"
                        onClick={() =>
                          setResults((current) =>
                            current.filter((_, rowIndex) => rowIndex !== index),
                          )
                        }
                        disabled={row.id !== undefined}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saveExam.isPending || isLoadingClasses || classes.length === 0}
          >
            {saveExam.isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear examen"}
          </Button>
        </div>
      </form>
    </div>
  );
}
