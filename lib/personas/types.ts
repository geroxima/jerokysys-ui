export type Person = {
  id: number;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  ruc: string | null;
  address: string | null;
};

export type Student = Person & {
  birthDate: string;
  guardianId: number | null;
};

export type Guardian = Person & {
  relationship: string | null;
};

export function fullName(person: Pick<Person, "firstName" | "lastName">): string {
  return `${person.firstName} ${person.lastName}`.trim();
}
