"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateDiscipline, useUpdateDiscipline } from "@/lib/query/disciplines";
import type { DisciplineDTO } from "@/lib/academic/types";

export function DisciplineForm({ initial }: { initial?: DisciplineDTO }) {
  const router = useRouter();
  const isEditing = initial?.id != null;
  const createDiscipline = useCreateDiscipline();
  const updateDiscipline = useUpdateDiscipline();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  const pending = createDiscipline.isPending || updateDiscipline.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await updateDiscipline.mutateAsync({
          id: initial!.id as number,
          dto: { name, description: description || null },
        });
        toast.success("Disciplina actualizada");
      } else {
        await createDiscipline.mutateAsync({
          name,
          description: description || null,
        });
        toast.success("Disciplina creada");
        setName("");
        setDescription("");
      }
      router.push("/disciplines");
    } catch (err) {
      toast.error(`Error al ${isEditing ? "actualizar" : "crear"} la disciplina`, {
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditing ? "Editar Disciplina" : "Nueva Disciplina"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isEditing
            ? "Actualizar modalidad de danza"
            : "Crear una nueva modalidad de danza"}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear disciplina"}
          </Button>
        </div>
      </form>
    </div>
  );
}
