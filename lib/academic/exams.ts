import { del, get, post, put, buildPagedParams } from "./client";
import type {
  ExamDTO,
  PageResult,
  PagedFilter,
} from "./types";

export function listExams(filter: PagedFilter) {
  return get<PageResult<ExamDTO>>(`/exams?${buildPagedParams(filter)}`);
}

export function getExamById(id: number) {
  return get<ExamDTO>(`/exams/${id}`);
}

export function createExam(dto: Omit<ExamDTO, "id">) {
  return post<ExamDTO>("/exams", dto);
}

export function updateExam(id: number, dto: Omit<ExamDTO, "id">) {
  return put<ExamDTO>(`/exams/${id}`, dto);
}

export function deleteExam(id: number) {
  return del(`/exams/${id}`);
}

export function getAllExams() {
  return get<ExamDTO[]>("/exams/all");
}

export function searchExamsByName(name: string) {
  return get<ExamDTO[]>(`/exams/search-by-name?name=${encodeURIComponent(name)}`);
}

export function getExamsByName(name: string) {
  return get<ExamDTO[]>(`/exams/by-name?name=${encodeURIComponent(name)}`);
}

export function getExamsByDate(date: string) {
  return get<ExamDTO[]>(`/exams/by-date?date=${encodeURIComponent(date)}`);
}

export function getExamsByClass(classId: number) {
  return get<ExamDTO[]>(`/exams/by-class/${classId}`);
}
