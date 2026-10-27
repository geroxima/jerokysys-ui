import { LogOut } from "lucide-react";

import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth";

export async function AppHeader() {
  const session = await requireSession();
  const initial = session.username.trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="flex h-16 items-center justify-end gap-3 border-b border-border bg-white px-8">
      <div
        className="flex size-8 items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold text-sidebar-accent-foreground"
        aria-hidden="true"
      >
        {initial}
      </div>

      <div className="leading-tight">
        <p className="text-sm font-medium">{session.username}</p>
        <p className="text-xs text-muted-foreground">{session.role}</p>
      </div>

      <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />

      <form action={logout}>
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="h-9 text-muted-foreground hover:text-foreground"
        >
          <LogOut aria-hidden="true" />
          Cerrar sesión
        </Button>
      </form>
    </header>
  );
}
