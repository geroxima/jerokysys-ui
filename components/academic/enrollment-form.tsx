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
import { classLabel, studentLabel } from "@/lib/academic/labels";
import { useAllClasses } from "@/lib/query/classes";
import { useAllStudents } from "@/lib/query/students";
import { useCreateEnrollment, useUpdateEnrollment } from "@/lib/query/enrollments";
import type { EnrollmentDTO } from "@/lib/academic/types";

const statuses = ["ACTIVE", "INACTIVE", "DROPPED", "COMPLETED"];
const statusLabels: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  DROPPED: "Abandonó",
  COMPLETED: "Completado",
};
const statusItems = statuses.map((s) => ({ value: s, label: statusLabels[s] }));

const EMPTY_FORM = {
  studentId: "",
  classId: "",
  enrollmentDate: "",
  agreedPrice: "",
  status: "ACTIVE",
};

export function EnrollmentForm({ initial }: { initial?: EnrollmentDTO }) {
  const router = useRouter();
  const isEditing = initial?.id != null;
  const createEnrollment = useCreateEnrollment();
  const updateEnrollment = useUpdateEnrollment();
  const { data: students = [], isLoading: isLoadingStudents } = useAllStudents();
  const { data: classes = [], isLoading: isLoadingClasses } = useAllClasses();
  const [form, setForm] = useState(
    initial
      ? {
          studentId: String(initial.studentId),
          classId: String(initial.classId),
          enrollmentDate: initial.enrollmentDate,
          agreedPrice: initial.agreedPrice != null ? String(initial.agreedPrice) : "",
          status: initial.status ?? "ACTIVE",
        }
      : EMPTY_FORM,
  );

  const pending = createEnrollment.isPending || updateEnrollment.isPending;

  const update = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dto = {
      studentId: Number(form.studentId),
      classId: Number(form.classId),
      enrollmentDate: form.enrollmentDate,
      agreedPrice: form.agreedPrice ? Number(form.agreedPrice) : null,
      status: form.status as EnrollmentDTO["status"],
    };

    try {
      if (isEditing) {
        await updateEnrollment.mutateAsync({ id: initial!.id as number, dto });
        toast.success("Inscripción actualizada");
      } else {
        await createEnrollment.mutateAsync(dto);
        toast.success("Inscripción creada");
        setForm(EMPTY_FORM);
      }
      router.push("/enrollments");
    } catch (err) {
      toast.error(`Error al ${isEditing ? "actualizar" : "crear"} la inscripción`, {
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditing ? "Editar Inscripción" : "Nueva Inscripción"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isEditing ? "Actualizar inscripción" : "Inscribir alumno en una clase"}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="classId">Clase</Label>
                <Select
                  value={form.classId}
                  onValueChange={(value) => update("classId", value ?? "")}
                  disabled={isLoadingClasses || classes.length === 0}
                >
                  <SelectTrigger id="classId">
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
                    {classes
                      .filter((danceClass) => danceClass.id !== null)
                      .map((danceClass) => (
                        <SelectItem key={danceClass.id} value={String(danceClass.id)}>
                          {classLabel(danceClass)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="enrollmentDate">Fecha</Label>
                <Input
                  id="enrollmentDate"
                  type="date"
                  value={form.enrollmentDate}
                  onChange={(e) => update("enrollmentDate", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={form.status ?? "ACTIVE"}
                  items={statusItems}
                  onValueChange={(v) => update("status", v ?? "ACTIVE")}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="agreedPrice">Precio acordado</Label>
                <Input
                  id="agreedPrice"
                  type="number"
                  step="0.01"
                  value={form.agreedPrice}
                  onChange={(e) => update("agreedPrice", e.target.value)}
                />
              </div>
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
              !form.studentId ||
              !form.classId ||
              isLoadingStudents ||
              isLoadingClasses
            }
          >
            {pending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear inscripción"}
          </Button>
        </div>
      </form>
    </div>
  );
}
