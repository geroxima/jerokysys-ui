import { PagePlaceholder } from "@/components/page-placeholder";
import { requirePermission } from "@/lib/auth";

export const instant = false;

export default async function GuardiansPage() {
  await requirePermission("personas:read");

  return (
    <PagePlaceholder
      title="Responsables"
      description="Gestión de responsables y tutores."
    />
  );
}
