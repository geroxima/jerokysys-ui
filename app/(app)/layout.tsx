import { Suspense, type ReactNode } from "react";

import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { PermissionProvider } from "@/components/permission-provider";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { requireSession } from "@/lib/auth";

export const instant = false;

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();

  return (
    <QueryProvider>
      <PermissionProvider permissions={Array.from(session.permissions)}>
        <div className="flex min-h-screen bg-white">
          <AppSidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <Suspense fallback={<div className="h-16 border-b border-border" />}>
              <AppHeader />
            </Suspense>

            <main className="flex-1">{children}</main>
          </div>

          <Toaster />
        </div>
      </PermissionProvider>
    </QueryProvider>
  );
}
