import { notFound } from "next/navigation";

import { ExamForm } from "@/components/academic/exam-form";
import { getExamById, getExamResultsByExam } from "@/lib/academic";
import { notFoundOn404 } from "@/lib/not-found";

export const instant = false;

export default async function EditExamPage({
  params,
}: PageProps<"/exams/[id]/edit">) {
  const { id } = await params;
  const examId = Number(id);
  if (!Number.isInteger(examId) || examId < 1) notFound();

  const exam = await notFoundOn404(getExamById(examId));
  const results = await getExamResultsByExam(examId);

  return <ExamForm initialExam={exam} initialResults={results} />;
}
