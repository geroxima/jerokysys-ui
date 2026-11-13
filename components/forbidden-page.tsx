import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ForbiddenPage({
  title = "No tienes permiso",
  description = "No tienes acceso a esta página con tu rol actual.",
  href = "/dash",
  actionLabel = "Volver al panel",
}: {
  title?: string;
  description?: string;
  href?: string;
  actionLabel?: string;
}) {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <p className="text-sm font-semibold text-primary">403</p>
      <h1 className="mt-2 text-2xl font-bold">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      <Link href={href} className={cn(buttonVariants({ variant: "outline" }), "mt-6")}>
        {actionLabel}
      </Link>
    </section>
  );
}
