import { del, get, post, put, buildPagedParams } from "./client";
import type {
  DanceClassDTO,
  PageResult,
  PagedFilter,
} from "./types";

export function listClasses(filter: PagedFilter) {
  return get<PageResult<DanceClassDTO>>(`/classes?${buildPagedParams(filter)}`);
}

export function getClassById(id: number) {
  return get<DanceClassDTO>(`/classes/${id}`);
}

export function createClass(dto: Omit<DanceClassDTO, "id">) {
  return post<DanceClassDTO>("/classes", dto);
}

export function updateClass(id: number, dto: Omit<DanceClassDTO, "id">) {
  return put<DanceClassDTO>(`/classes/${id}`, dto);
}

export function deleteClass(id: number) {
  return del(`/classes/${id}`);
}

export function getAllClasses() {
  return get<DanceClassDTO[]>("/classes/all");
}

export function getClassesByStatus(status: string) {
  return get<DanceClassDTO[]>(`/classes/by-status?status=${encodeURIComponent(status)}`);
}

export function getClassesByDiscipline(disciplineId: number) {
  return get<DanceClassDTO[]>(`/classes/by-discipline/${disciplineId}`);
}
