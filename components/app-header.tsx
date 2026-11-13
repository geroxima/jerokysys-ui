"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/query/session";

export function AppHeader() {
  const router = useRouter();
  const { data: session, isLoading } = useSession();
  const [pending, setPending] = useState(false);

  const initial = session?.username.trim().charAt(0).toUpperCase() || "?";

  async function handleLogout() {
    setPending(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <header className="flex h-16 items-center justify-end gap-3 border-b border-border bg-white px-8">
      {isLoading ? (
        <div className="flex items-center gap-3" aria-hidden="true">
          <div className="size-8 animate-pulse rounded-full bg-muted" />
          <div className="flex flex-col gap-1">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ) : (
        <>
          <div
            className="flex size-8 items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold text-sidebar-accent-foreground"
            aria-hidden="true"
          >
            {initial}
          </div>

          <div className="leading-tight">
            <p className="text-sm font-medium">{session?.username ?? "—"}</p>
            <p className="text-xs text-muted-foreground">
              {session?.role ?? ""}
            </p>
          </div>
        </>
      )}

      <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        disabled={pending}
        className="h-9 text-muted-foreground hover:text-foreground"
      >
        {pending ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <LogOut aria-hidden="true" />
        )}
        Cerrar sesión
      </Button>
    </header>
  );
}
