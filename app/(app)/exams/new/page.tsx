import { ExamForm } from "@/components/academic/exam-form";
import { requirePermission } from "@/lib/auth";

export const instant = false;

export default async function NewExamPage() {
  await requirePermission("academic:write");

  return <ExamForm />;
}
