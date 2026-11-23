import type { DanceClassDTO, ExamDTO, StudentDTO } from "@/lib/academic/types";

/**
 * Etiquetas legibles para mostrar entidades relacionadas en lugar de sus IDs.
 */

export function studentLabel(student: StudentDTO): string {
  return [student.firstName, student.lastName].filter(Boolean).join(" ").trim();
}

/** Valores del enum de días del backend → etiquetas con tilde. */
export const dayLabels: Record<string, string> = {
  Lunes: "Lunes",
  Martes: "Martes",
  Miercoles: "Miércoles",
  Jueves: "Jueves",
  Viernes: "Viernes",
  Sabado: "Sábado",
  Domingo: "Domingo",
};

export function dayLabel(dayOfWeek: string): string {
  return dayLabels[dayOfWeek] ?? dayOfWeek;
}

export function classLabel(danceClass: DanceClassDTO, disciplineName?: string): string {
  return [
    disciplineName,
    danceClass.level,
    `${dayLabel(danceClass.dayOfWeek)} ${danceClass.startTime}-${danceClass.endTime}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function examLabel(exam: ExamDTO): string {
  return [exam.examName, exam.examDate].filter(Boolean).join(" · ");
}

export const enrollmentStatusLabels: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  DROPPED: "Abandonó",
  COMPLETED: "Completado",
};

export const danceClassStatusLabels: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  CANCELLED: "Cancelado",
  SUSPENDED: "Suspendido",
};

/** Construye un mapa id → etiqueta para resolver relaciones en listas. */
export function toNameMap<T extends { id: number | null }>(
  rows: T[],
  label: (row: T) => string,
): Map<number, string> {
  return new Map(
    rows
      .filter((row) => row.id != null)
      .map((row) => [row.id as number, label(row)]),
  );
}
