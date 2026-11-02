"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateEnrollment } from "@/lib/query/enrollments";
import type { EnrollmentDTO } from "@/lib/academic/types";

const statuses = ["ACTIVE", "INACTIVE", "DROPPED", "COMPLETED"];
const statusLabels: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  DROPPED: "Abandonó",
  COMPLETED: "Completado",
};
const statusItems = statuses.map((s) => ({ value: s, label: statusLabels[s] }));

export default function NewEnrollmentPage() {
  const router = useRouter();
  const createEnrollment = useCreateEnrollment();
  const [form, setForm] = useState({
    studentId: "",
    classId: "",
    enrollmentDate: "",
    agreedPrice: "",
    status: "ACTIVE",
  });

  const update = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createEnrollment.mutateAsync({
        studentId: Number(form.studentId),
        classId: Number(form.classId),
        enrollmentDate: form.enrollmentDate,
        agreedPrice: form.agreedPrice ? Number(form.agreedPrice) : null,
        status: form.status as EnrollmentDTO["status"],
      });
      toast.success("Inscripción creada");
      router.push("/enrollments");
    } catch (err) {
      toast.error("Error al crear la inscripción", {
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Nueva Inscripción</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Inscribir alumno en una clase
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
                <Label htmlFor="studentId">ID Alumno</Label>
                <Input
                  id="studentId"
                  type="number"
                  value={form.studentId}
                  onChange={(e) => update("studentId", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="classId">ID Clase</Label>
                <Input
                  id="classId"
                  type="number"
                  value={form.classId}
                  onChange={(e) => update("classId", e.target.value)}
                  required
                />
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
                <Select value={form.status ?? "ACTIVE"} items={statusItems} onValueChange={(v) => update("status", v ?? "ACTIVE")}>
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
          <Button type="submit" disabled={createEnrollment.isPending}>
            {createEnrollment.isPending ? "Guardando..." : "Crear inscripción"}
          </Button>
        </div>
      </form>
    </div>
  );
}
