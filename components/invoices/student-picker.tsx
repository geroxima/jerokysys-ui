"use client";

import { useDeferredValue, useState } from "react";
import { Check, Search, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fullName, type Student } from "@/lib/personas";
import { useStudentSearch } from "@/lib/query/students";
import { cn } from "@/lib/utils";

export function StudentPicker({
  value,
  selected,
  onChange,
  error,
}: {
  value: string;
  selected: Student | null;
  onChange: (student: Student | null) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const studentsQuery = useStudentSearch(deferredQuery);
  const students = studentsQuery.data ?? [];

  return (
    <div className="flex flex-col gap-1">
      <Label className="text-[11px] tracking-wide text-muted-foreground uppercase">
        Alumno
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full justify-start gap-2 px-2.5 text-left font-normal"
              aria-invalid={Boolean(error)}
            />
          }
        >
          <UserRound aria-hidden="true" className="text-muted-foreground" />
          {selected ? (
            <span className="flex min-w-0 flex-col items-start">
              <span className="truncate text-sm">{fullName(selected)}</span>
              <span className="truncate text-[11px] text-muted-foreground">
                #{selected.id}
                {selected.ruc ? ` · RUC ${selected.ruc}` : " · sin RUC"}
              </span>
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              Buscar alumno por nombre o RUC
            </span>
          )}
        </PopoverTrigger>

        <PopoverContent align="start" className="w-96 gap-1 p-2">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nombre, apellido o RUC"
              className="h-8 pl-7"
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {studentsQuery.isLoading ? (
              <p className="px-2 py-3 text-xs text-muted-foreground">
                Buscando alumnos…
              </p>
            ) : students.length === 0 ? (
              <p className="px-2 py-3 text-xs text-muted-foreground">
                No se encontraron alumnos.
              </p>
            ) : (
              <ul className="flex flex-col">
                {students.map((student) => {
                  const active = String(student.id) === value;
                  return (
                    <li key={student.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onChange(student);
                          setOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                          active && "bg-muted",
                        )}
                      >
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate">{fullName(student)}</span>
                          <span className="text-[11px] text-muted-foreground">
                            #{student.id}
                            {student.ruc ? ` · RUC ${student.ruc}` : " · sin RUC"}
                          </span>
                        </span>
                        {active ? (
                          <Check
                            aria-hidden="true"
                            className="size-4 text-primary"
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
