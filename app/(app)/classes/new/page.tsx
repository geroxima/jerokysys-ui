"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { useAllDisciplines } from "@/lib/query/disciplines";
import { useCreateClass } from "@/lib/query/classes";
import type { DanceClassDTO } from "@/lib/academic/types";

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const statuses = ["ACTIVE", "INACTIVE", "CANCELLED", "SUSPENDED"];
const statusLabels: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  CANCELLED: "Cancelado",
  SUSPENDED: "Suspendido",
};
const statusItems = statuses.map((s) => ({ value: s, label: statusLabels[s] }));
const dayItems = days.map((d) => ({ value: d, label: d }));

export default function NewClassPage() {
  const router = useRouter();
  const createClass = useCreateClass();
  const {
    data: disciplines = [],
    isLoading: isLoadingDisciplines,
    error: disciplinesError,
  } = useAllDisciplines();
  const [form, setForm] = useState({
    disciplineId: "",
    level: "",
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    maxCapacity: "",
    monthlyPrice: "",
    status: "ACTIVE",
  });

  const disciplineItems = disciplines
    .filter((discipline) => discipline.id !== null)
    .map((discipline) => ({
      value: String(discipline.id),
      label: `${discipline.name} (ID ${discipline.id})`,
    }));

  useEffect(() => {
    if (disciplinesError) {
      toast.error("No se pudieron cargar las disciplinas", {
        description:
          disciplinesError instanceof Error ? disciplinesError.message : "Error desconocido",
      });
    }
  }, [disciplinesError]);

  const update = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createClass.mutateAsync({
        disciplineId: Number(form.disciplineId),
        level: form.level,
        dayOfWeek: form.dayOfWeek,
        startTime: form.startTime,
        endTime: form.endTime,
        maxCapacity: Number(form.maxCapacity),
        monthlyPrice: Number(form.monthlyPrice),
        status: form.status as DanceClassDTO["status"],
      });
      toast.success("Clase creada");
      router.push("/classes");
    } catch (err) {
      toast.error("Error al crear la clase", {
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Nueva Clase</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Crear una nueva clase de danza
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
                <Label htmlFor="disciplineId">Disciplina</Label>
                <Select
                  value={form.disciplineId}
                  items={disciplineItems}
                  onValueChange={(value) => update("disciplineId", value ?? "")}
                  disabled={isLoadingDisciplines || disciplines.length === 0}
                >
                  <SelectTrigger id="disciplineId" className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingDisciplines
                          ? "Cargando disciplinas..."
                          : disciplines.length === 0
                            ? "No hay disciplinas disponibles"
                            : "Seleccionar disciplina"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {disciplines
                        .filter((discipline) => discipline.id !== null)
                        .map((discipline) => (
                          <SelectItem key={discipline.id} value={String(discipline.id)}>
                            {discipline.name} (ID {discipline.id})
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level">Nivel</Label>
                <Input
                  id="level"
                  value={form.level}
                  onChange={(e) => update("level", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dayOfWeek">Día</Label>
                <Select value={form.dayOfWeek ?? ""} items={dayItems} onValueChange={(v) => update("dayOfWeek", v ?? "")}>
                  <SelectTrigger id="dayOfWeek">
                    <SelectValue placeholder="Seleccionar día" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={form.status} items={statusItems} onValueChange={(v) => update("status", v ?? "ACTIVE")}>
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
                <Label htmlFor="startTime">Hora inicio</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => update("startTime", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">Hora fin</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => update("endTime", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="maxCapacity">Capacidad</Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  value={form.maxCapacity}
                  onChange={(e) => update("maxCapacity", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="monthlyPrice">Precio mensual</Label>
                <Input
                  id="monthlyPrice"
                  type="number"
                  step="0.01"
                  value={form.monthlyPrice}
                  onChange={(e) => update("monthlyPrice", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createClass.isPending}>
            {createClass.isPending ? "Guardando..." : "Crear clase"}
          </Button>
        </div>
      </form>
    </div>
  );
}
