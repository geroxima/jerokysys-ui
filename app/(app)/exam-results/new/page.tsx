"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateExamResult } from "@/lib/query/exam-results";

export default function NewExamResultPage() {
  const router = useRouter();
  const createExamResult = useCreateExamResult();
  const [form, setForm] = useState({ examId: "", studentId: "", score: "", remarks: "" });

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await createExamResult.mutateAsync({
        examId: Number(form.examId),
        studentId: Number(form.studentId),
        score: form.score || null,
        remarks: form.remarks || null,
      });
      toast.success("Resultado creado");
      router.push("/exam-results");
    } catch (error) {
      toast.error("Error al crear el resultado", {
        description: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Nuevo Resultado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Registrar resultado de examen</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Información</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="examId">ID Examen</Label>
              <Input id="examId" type="number" min="1" required value={form.examId} onChange={(event) => update("examId", event.target.value)} />
            </div>
            <div>
              <Label htmlFor="studentId">ID Alumno</Label>
              <Input id="studentId" type="number" min="1" required value={form.studentId} onChange={(event) => update("studentId", event.target.value)} />
            </div>
            <div>
              <Label htmlFor="score">Puntaje</Label>
              <Input id="score" type="number" step="0.01" value={form.score} onChange={(event) => update("score", event.target.value)} />
            </div>
            <div>
              <Label htmlFor="remarks">Observaciones</Label>
              <Input id="remarks" value={form.remarks} onChange={(event) => update("remarks", event.target.value)} />
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createExamResult.isPending}>
            {createExamResult.isPending ? "Guardando..." : "Crear resultado"}
          </Button>
        </div>
      </form>
    </div>
  );
}
