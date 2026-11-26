"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  clearClientToken,
  getClientToken,
  subscribeClientToken,
} from "@/lib/client-token";
import { isJwtExpired } from "@/lib/jwt";

function getSnapshot(): boolean {
  const token = getClientToken();
  return Boolean(token && !isJwtExpired(token));
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(callback: () => void): () => void {
  return subscribeClientToken(callback);
}

const subscribeNoop = () => () => {};

function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const authenticated = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!authenticated) {
      clearClientToken();
      router.replace("/login/");
    }
  }, [authenticated, hydrated, pathname, router]);

  if (!authenticated) {
    return <div className="min-h-screen bg-white" aria-hidden="true" />;
  }

  return <>{children}</>;
}
