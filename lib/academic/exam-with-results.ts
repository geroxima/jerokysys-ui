import { createExam } from "./exams";
import { createExamResult } from "./exam-results";
import type { ExamDTO, ExamResultDTO } from "./types";
import { ApiError } from "./client";

export type ExamWithResults = {
  exam: Omit<ExamDTO, "id">;
  results: Array<{
    studentId: number;
    score: string | number | null;
    remarks: string | null;
  }>;
};

export type ExamCreateResult = {
  exam: ExamDTO;
  resultsCreated: ExamResultDTO[];
  resultsFailed: Array<{
    studentId: number;
    error: string;
  }>;
};

/**
 * Creates an exam first, then creates one exam-result per student.
 * The exam is kept even if some results fail. Failed rows are returned
 * so the caller can retry them.
 */
export async function createExamWithResults(
  input: ExamWithResults,
): Promise<ExamCreateResult> {
  const exam = await createExam(input.exam);

  const resultsCreated: ExamResultDTO[] = [];
  const resultsFailed: Array<{ studentId: number; error: string }> = [];

  for (const row of input.results) {
    try {
      const result = await createExamResult({
        examId: exam.id!,
        studentId: row.studentId,
        score: row.score,
        remarks: row.remarks,
      });
      resultsCreated.push(result);
    } catch (err) {
      resultsFailed.push({
        studentId: row.studentId,
        error: err instanceof ApiError ? err.message ?? String(err) : String(err),
      });
    }
  }

  return { exam, resultsCreated, resultsFailed };
}
