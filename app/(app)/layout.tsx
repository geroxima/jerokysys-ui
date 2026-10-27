import { Suspense, type ReactNode } from "react";

import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Suspense fallback={<div className="h-16 border-b border-border" />}>
          <AppHeader />
        </Suspense>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
