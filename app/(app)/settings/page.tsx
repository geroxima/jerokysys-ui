import Link from "next/link";

import { PagePlaceholder } from "@/components/page-placeholder";
import { buttonVariants } from "@/components/ui/button";
import { requirePermission } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const instant = false;

export default async function SettingsPage() {
  await requirePermission("users:manage");

  return (
    <>
      <PagePlaceholder
        title="Ajustes"
        description="Configuración del sistema."
      />
      <div className="px-8">
        <Link href="/settings/users/new" className={cn(buttonVariants({ size: "lg" }), "h-9")}>
          Nuevo usuario
        </Link>
      </div>
    </>
  );
}
