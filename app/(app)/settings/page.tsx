import { PagePlaceholder } from "@/components/page-placeholder";
import { requirePermission } from "@/lib/auth";

export const instant = false;

export default async function SettingsPage() {
  await requirePermission("users:manage");

  return (
    <PagePlaceholder
      title="Ajustes"
      description="Configuración del sistema."
    />
  );
}
