import { del, get, post, put, buildPagedParams } from "./client";
import type {
  EnrollmentDTO,
  PageResult,
  PagedFilter,
} from "./types";

export function listEnrollments(filter: PagedFilter) {
  return get<PageResult<EnrollmentDTO>>(`/enrollments?${buildPagedParams(filter)}`);
}

export function getEnrollmentById(id: number) {
  return get<EnrollmentDTO>(`/enrollments/${id}`);
}

export function createEnrollment(dto: Omit<EnrollmentDTO, "id">) {
  return post<EnrollmentDTO>("/enrollments", dto);
}

export function updateEnrollment(id: number, dto: Omit<EnrollmentDTO, "id">) {
  return put<EnrollmentDTO>(`/enrollments/${id}`, dto);
}

export function deleteEnrollment(id: number) {
  return del(`/enrollments/${id}`);
}

export function getAllEnrollments() {
  return get<EnrollmentDTO[]>("/enrollments/all");
}

export function getEnrollmentsByStudent(studentId: number) {
  return get<EnrollmentDTO[]>(`/enrollments/by-student/${studentId}`);
}

export function getEnrollmentsByStatus(status: string) {
  return get<EnrollmentDTO[]>(`/enrollments/by-status?status=${encodeURIComponent(status)}`);
}

export function getEnrollmentsByDate(date: string) {
  return get<EnrollmentDTO[]>(`/enrollments/by-date?date=${encodeURIComponent(date)}`);
}

export function getEnrollmentsByClass(classId: number) {
  return get<EnrollmentDTO[]>(`/enrollments/by-class/${classId}`);
}
