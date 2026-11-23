"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateInstructor } from "@/lib/query/instructors";
import { useCreateUser, type UserRole } from "@/lib/query/users";

const roleItems: { value: UserRole; label: string }[] = [
  { value: "ADMIN", label: "Administrador" },
  { value: "PROFESSOR", label: "Profesor" },
  { value: "SECRETARY", label: "Secretaría" },
];

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  PROFESSOR: "Profesor",
  SECRETARY: "Secretaría",
};

const EMPTY_FORM = {
  username: "",
  password: "",
  confirmPassword: "",
  role: "" as UserRole | "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

export function UserForm() {
  const router = useRouter();
  const createUser = useCreateUser();
  const createInstructor = useCreateInstructor();
  const [form, setForm] = useState(EMPTY_FORM);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const pending = createUser.isPending || createInstructor.isPending;
  const isProfessor = form.role === "PROFESSOR";

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (field === "password" || field === "confirmPassword") {
      setPasswordError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.role) {
      toast.error("Seleccioná un rol");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    let user;
    try {
      user = await createUser.mutateAsync({
        username: form.username.trim(),
        password: form.password,
        role: form.role,
      });
    } catch (error) {
      toast.error("No se pudo crear el usuario", {
        description: error instanceof Error ? error.message : "Error desconocido",
      });
      return;
    }

    if (form.role === "PROFESSOR") {
      try {
        await createInstructor.mutateAsync({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
        });
        toast.success(`Usuario "${user.username}" creado como profesor`);
      } catch (error) {
        toast.warning(`Usuario "${user.username}" creado, pero no se guardaron los datos del profesor`, {
          description: error instanceof Error ? error.message : "Error desconocido",
        });
      }
    } else {
      toast.success(`Usuario "${user.username}" creado`);
    }

    setForm(EMPTY_FORM);
    router.push("/settings");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Nuevo Usuario</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Crear una cuenta de acceso y asignarle un rol
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cuenta</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                value={form.username}
                onChange={(event) => update("username", event.target.value)}
                minLength={3}
                maxLength={100}
                autoComplete="off"
                required
              />
            </div>
            <div>
              <Label htmlFor="role">Rol</Label>
              <Select
                value={form.role}
                onValueChange={(value) => update("role", value ?? "")}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Seleccionar rol">
                    {form.role ? roleLabels[form.role] : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {roleItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(event) => update("password", event.target.value)}
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                aria-invalid={passwordError ? true : undefined}
                aria-describedby="password-hint"
                required
              />
              <p id="password-hint" className="mt-1 text-xs text-muted-foreground">
                Entre 8 y 72 caracteres.
              </p>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Repetir contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(event) => update("confirmPassword", event.target.value)}
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                aria-invalid={passwordError ? true : undefined}
                aria-describedby={passwordError ? "password-error" : undefined}
                required
              />
              {passwordError ? (
                <p id="password-error" role="alert" className="mt-1 text-xs text-destructive">
                  {passwordError}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {isProfessor ? (
          <Card>
            <CardHeader>
              <CardTitle>Datos del profesor</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(event) => update("firstName", event.target.value)}
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(event) => update("lastName", event.target.value)}
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  maxLength={20}
                />
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending || !form.role}>
            {pending ? "Guardando..." : "Crear usuario"}
          </Button>
        </div>
      </form>
    </div>
  );
}
