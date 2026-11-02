import { del, get, post, put, buildPagedParams } from "./client";
import type {
  ExamResultDTO,
  PageResult,
  PagedFilter,
} from "./types";

export function listExamResults(filter: PagedFilter) {
  return get<PageResult<ExamResultDTO>>(`/exam-results?${buildPagedParams(filter)}`);
}

export function getExamResultById(id: number) {
  return get<ExamResultDTO>(`/exam-results/${id}`);
}

export function createExamResult(dto: Omit<ExamResultDTO, "id">) {
  return post<ExamResultDTO>("/exam-results", dto);
}

export function updateExamResult(id: number, dto: Omit<ExamResultDTO, "id">) {
  return put<ExamResultDTO>(`/exam-results/${id}`, dto);
}

export function deleteExamResult(id: number) {
  return del(`/exam-results/${id}`);
}

export function getAllExamResults() {
  return get<ExamResultDTO[]>("/exam-results/all");
}

export function getExamResultsByStudent(studentId: number) {
  return get<ExamResultDTO[]>(`/exam-results/by-student/${studentId}`);
}

export function getExamResultsByExam(examId: number) {
  return get<ExamResultDTO[]>(`/exam-results/by-exam/${examId}`);
}
