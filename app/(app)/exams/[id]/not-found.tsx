import { NotFoundPage } from "@/components/not-found-page";

export default function ExamNotFound() {
  return (
    <NotFoundPage
      title="Examen no encontrado"
      description="El examen no existe o ya fue eliminado."
      href="/exams"
      actionLabel="Volver a exámenes"
    />
  );
}
