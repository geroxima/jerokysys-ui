import { PagePlaceholder } from "@/components/page-placeholder";
import { requirePermission } from "@/lib/auth";

export const instant = false;

export default async function StudentsPage() {
  await requirePermission("personas:read");

  return (
    <PagePlaceholder
      title="Alumnos"
      description="Gestión de alumnos."
    />
  );
}
