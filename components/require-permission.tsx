"use client";

import { type ReactNode } from "react";

import { ForbiddenPage } from "@/components/forbidden-page";
import { usePermissions } from "@/components/permission-provider";
import type { Permission } from "@/lib/permissions";

export function RequirePermission({
  permission,
  children,
}: {
  permission: Permission;
  children: ReactNode;
}) {
  const { can } = usePermissions();

  if (!can(permission)) {
    return <ForbiddenPage />;
  }

  return <>{children}</>;
}
