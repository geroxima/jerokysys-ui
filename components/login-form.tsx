"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.error ?? "No se pudo iniciar sesión.");
        return;
      }

      router.replace("/dash");
      router.refresh();
    } catch {
      setError(
        "No se pudo conectar con el servidor. Verificá que la API esté en línea.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-80 flex-col gap-3">
      <div className="relative">
        <Label htmlFor="username" className="sr-only">
          Usuario
        </Label>
        <UserRound
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="Usuario"
          autoComplete="username"
          required
          disabled={pending}
          className="h-10 rounded-md bg-white pl-9 text-sm"
        />
      </div>

      <div className="relative">
        <Label htmlFor="password" className="sr-only">
          Contraseña
        </Label>
        <KeyRound
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Contraseña"
          autoComplete="current-password"
          required
          disabled={pending}
          className="h-10 rounded-md bg-white pl-9 text-sm"
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="mt-2 h-10 w-full bg-brand-accent text-sm font-medium text-white hover:bg-brand-primary"
      >
        {pending ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            Ingresando...
          </>
        ) : (
          "Ingresar"
        )}
      </Button>
    </form>
  );
}
