import { PagePlaceholder } from "@/components/page-placeholder";
import { requirePermission } from "@/lib/auth";

export const instant = false;

export default async function InstructorsPage() {
  await requirePermission("personas:read");

  return (
    <PagePlaceholder
      title="Profesores"
      description="Gestión de profesores."
    />
  );
}
