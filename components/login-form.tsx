"use client";

import { useActionState } from "react";
import { KeyRound, Loader2, UserRound } from "lucide-react";

import { login, type LoginState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    null,
  );

  return (
    <form action={formAction} className="flex w-80 flex-col gap-3">
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

      {state?.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
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
