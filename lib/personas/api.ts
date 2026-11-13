import { apiGet, apiWrite } from "@/lib/api-client";
import type { Guardian, Student } from "./types";

type RawPerson = {
  id?: number | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  ruc?: string | null;
  address?: string | null;
};

type RawStudent = RawPerson & {
  birthDate?: string | null;
  guardianId?: number | null;
};

type RawGuardian = RawPerson & {
  relationship?: string | null;
};

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeStudent(raw: RawStudent): Student {
  return {
    id: toNumber(raw.id) ?? 0,
    firstName: raw.firstName ?? "",
    lastName: raw.lastName ?? "",
    phone: raw.phone ?? null,
    email: raw.email ?? null,
    ruc: raw.ruc ?? null,
    address: raw.address ?? null,
    birthDate: raw.birthDate ?? "",
    guardianId: toNumber(raw.guardianId),
  };
}

function normalizeGuardian(raw: RawGuardian): Guardian {
  return {
    id: toNumber(raw.id) ?? 0,
    firstName: raw.firstName ?? "",
    lastName: raw.lastName ?? "",
    phone: raw.phone ?? null,
    email: raw.email ?? null,
    ruc: raw.ruc ?? null,
    address: raw.address ?? null,
    relationship: raw.relationship ?? null,
  };
}

export async function searchStudents(query: string): Promise<Student[]> {
  const raw = await apiGet<RawStudent[]>(
    `/students/search?q=${encodeURIComponent(query.trim())}`,
  );
  return (raw ?? []).map(normalizeStudent);
}

export async function getStudent(id: number): Promise<Student> {
  const raw = await apiGet<RawStudent>(`/students/${id}`);
  return normalizeStudent(raw);
}

export async function searchGuardians(query: string): Promise<Guardian[]> {
  const raw = await apiGet<RawGuardian[]>(
    `/guardians/search?q=${encodeURIComponent(query.trim())}`,
  );
  return (raw ?? []).map(normalizeGuardian);
}

export async function getGuardian(id: number): Promise<Guardian> {
  const raw = await apiGet<RawGuardian>(`/guardians/${id}`);
  return normalizeGuardian(raw);
}

export async function patchStudentRuc(
  id: number,
  ruc: string,
): Promise<Student> {
  const raw = await apiWrite<RawStudent>(`/students/${id}`, "PATCH", { ruc });
  return normalizeStudent(raw);
}

export async function patchGuardianRuc(
  id: number,
  ruc: string,
): Promise<Guardian> {
  const raw = await apiWrite<RawGuardian>(`/guardians/${id}`, "PATCH", { ruc });
  return normalizeGuardian(raw);
}
