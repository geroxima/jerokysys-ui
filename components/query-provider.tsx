"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, type ReactNode } from "react";

import { ApiClientError } from "@/lib/api-client";

type Router = ReturnType<typeof useRouter>;

export function QueryProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: (error) => handleGlobalError(error, router) }),
        mutationCache: new MutationCache({ onError: (error) => handleGlobalError(error, router) }),
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function handleGlobalError(error: unknown, router: Router) {
  if (!(error instanceof ApiClientError)) {
    return;
  }

  if (error.status === 401) {
    // Sesion vencida o inexistente: volver al login.
    router.replace("/login");
    return;
  }

  if (error.status === 403) {
    toast.error("No tienes permiso para esta acción");
  }
}
