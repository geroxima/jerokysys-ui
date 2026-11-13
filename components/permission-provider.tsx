"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import type { Permission } from "@/lib/permissions";

type PermissionContextValue = {
  permissions: ReadonlySet<Permission>;
  can: (permission: Permission) => boolean;
};

const PermissionContext = createContext<PermissionContextValue | null>(null);

export function PermissionProvider({
  permissions,
  children,
}: {
  permissions: Permission[];
  children: ReactNode;
}) {
  const value = useMemo(() => {
    const set = new Set(permissions);
    return {
      permissions: set,
      can: (permission: Permission) => set.has(permission),
    };
  }, [permissions]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions(): PermissionContextValue {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissions debe usarse dentro de un PermissionProvider");
  }
  return context;
}
