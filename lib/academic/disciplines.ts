import { del, get, post, put, buildPagedParams } from "./client";
import type {
  DisciplineDTO,
  PageResult,
  PagedFilter,
} from "./types";

export function listDisciplines(filter: PagedFilter) {
  return get<PageResult<DisciplineDTO>>(`/disciplines?${buildPagedParams(filter)}`);
}

export function getDisciplineById(id: number) {
  return get<DisciplineDTO>(`/disciplines/${id}`);
}

export function createDiscipline(dto: Omit<DisciplineDTO, "id">) {
  return post<DisciplineDTO>("/disciplines", dto);
}

export function updateDiscipline(id: number, dto: Omit<DisciplineDTO, "id">) {
  return put<DisciplineDTO>(`/disciplines/${id}`, dto);
}

export function deleteDiscipline(id: number) {
  return del(`/disciplines/${id}`);
}

export function getAllDisciplines() {
  return get<DisciplineDTO[]>("/disciplines/all");
}

export function searchDisciplinesByName(name: string) {
  return get<DisciplineDTO[]>(`/disciplines/search-by-name?name=${encodeURIComponent(name)}`);
}

export function getDisciplineByName(name: string) {
  return get<DisciplineDTO[]>(`/disciplines/by-name?name=${encodeURIComponent(name)}`);
}
