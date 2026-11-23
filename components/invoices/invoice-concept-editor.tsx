"use client";

import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatCurrency,
  lineSubtotal,
  parseAmountInput,
  todayIsoDate,
} from "@/lib/invoices/format";
import {
  CONCEPT_TYPE_OPTIONS,
  VAT_OPTIONS,
} from "@/lib/invoices/labels";
import { emptyLineValues } from "@/lib/invoices/validation";
import type {
  FieldErrors,
  InvoiceConceptType,
  InvoiceLineValues,
} from "@/lib/invoices/types";
import { useAllClasses } from "@/lib/query/classes";
import { useAllDisciplines } from "@/lib/query/disciplines";
import { useEnrollmentsByStudent } from "@/lib/query/enrollments";
import { cn } from "@/lib/utils";

type BillingOption = {
  enrollmentId: number;
  label: string;
  amount: number;
};

export function InvoiceConceptEditor({
  studentId,
  studentName,
  lines,
  errors,
  onChange,
}: {
  studentId: number | null;
  studentName: string;
  lines: InvoiceLineValues[];
  errors: FieldErrors;
  onChange: (lines: InvoiceLineValues[]) => void;
}) {
  const enrollmentsQuery = useEnrollmentsByStudent(studentId);
  const classesQuery = useAllClasses();
  const disciplinesQuery = useAllDisciplines();
  const billingLoading =
    enrollmentsQuery.isLoading ||
    classesQuery.isLoading ||
    disciplinesQuery.isLoading;

  const options = useMemo<BillingOption[]>(() => {
    const classes = new Map(
      (classesQuery.data ?? []).map((item) => [item.id, item]),
    );
    const disciplines = new Map(
      (disciplinesQuery.data ?? []).map((item) => [item.id, item]),
    );

    return (enrollmentsQuery.data ?? [])
      .filter((enrollment) => enrollment.status === "ACTIVE")
      .map((enrollment) => {
        const danceClass = classes.get(enrollment.classId);
        const discipline = danceClass
          ? disciplines.get(danceClass.disciplineId)
          : undefined;
        const label = danceClass
          ? `${discipline?.name ?? "Clase"} · ${danceClass.level}`
          : `Inscripción #${enrollment.id}`;
        const amount =
          enrollment.agreedPrice ?? danceClass?.monthlyPrice ?? 0;
        return {
          enrollmentId: enrollment.id ?? 0,
          label,
          amount,
        };
      })
      .filter((option) => option.enrollmentId > 0);
  }, [classesQuery.data, disciplinesQuery.data, enrollmentsQuery.data]);

  const optionById = useMemo(
    () => new Map(options.map((option) => [String(option.enrollmentId), option])),
    [options],
  );

  function updateLine(index: number, patch: Partial<InvoiceLineValues>) {
    onChange(
      lines.map((line, current) =>
        current === index ? { ...line, ...patch } : line,
      ),
    );
  }

  function removeLine(index: number) {
    onChange(lines.filter((_, current) => current !== index));
  }

  function addLine() {
    onChange([...lines, emptyLineValues()]);
  }

  function buildDescription(
    conceptType: InvoiceConceptType,
    month: string,
    option: BillingOption | undefined,
  ): string {
    const student = studentName.trim();
    if (conceptType === "CUOTA") {
      const parts = ["Cuota"];
      if (month) {
        parts.push(month);
      }
      if (option) {
        parts.push(option.label);
      }
      if (student) {
        parts.push(student);
      }
      return parts.join(" - ");
    }
    if (conceptType === "MATRICULA") {
      return `Matrícula ${todayIsoDate().slice(0, 4)}${student ? ` - ${student}` : ""}`;
    }
    return student ? `Concepto - ${student}` : "Concepto";
  }

  function changeConcept(index: number, value: string) {
    const conceptType = value as InvoiceConceptType;
    if (conceptType === "CUOTA") {
      const first = options[0];
      const month = todayIsoDate().slice(0, 7);
      updateLine(index, {
        conceptType,
        conceptId: first ? String(first.enrollmentId) : "",
        correspondingMonth: month,
        unitPrice: first ? String(first.amount) : "",
        description: buildDescription(conceptType, month, first),
      });
      return;
    }

    updateLine(index, {
      conceptType,
      conceptId: "",
      correspondingMonth: "",
      unitPrice: "",
      description: buildDescription(conceptType, "", undefined),
    });
  }

  function changeEnrollment(index: number, value: string) {
    const option = optionById.get(value);
    const line = lines[index];
    const month = line.correspondingMonth || todayIsoDate().slice(0, 7);
    updateLine(index, {
      conceptId: value,
      correspondingMonth: month,
      unitPrice: option ? String(option.amount) : line.unitPrice,
      description: buildDescription("CUOTA", month, option),
    });
  }

  function changeMonth(index: number, value: string) {
    const line = lines[index];
    const option = optionById.get(line.conceptId);
    updateLine(index, {
      correspondingMonth: value,
      description: buildDescription("CUOTA", value, option),
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {studentId == null ? (
        <p className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
          Elegí un alumno para cargar sus inscripciones y calcular la cuota.
        </p>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] border-collapse text-sm">
          <caption className="sr-only">
            Conceptos de la factura: matrícula o cuota.
          </caption>
          <thead>
            <tr className="border-y border-border text-[11px] tracking-wide text-muted-foreground uppercase">
              <th scope="col" className="w-8 px-2 py-2 text-left font-medium">
                #
              </th>
              <th scope="col" className="w-28 px-2 py-2 text-left font-medium">
                Concepto
              </th>
              <th scope="col" className="w-48 px-2 py-2 text-left font-medium">
                Inscripción
              </th>
              <th scope="col" className="w-28 px-2 py-2 text-left font-medium">
                Mes
              </th>
              <th scope="col" className="px-2 py-2 text-left font-medium">
                Descripción
              </th>
              <th scope="col" className="w-20 px-2 py-2 text-right font-medium">
                Cant.
              </th>
              <th scope="col" className="w-32 px-2 py-2 text-right font-medium">
                Precio unit.
              </th>
              <th scope="col" className="w-28 px-2 py-2 text-left font-medium">
                IVA
              </th>
              <th scope="col" className="w-32 px-2 py-2 text-right font-medium">
                Valor de venta
              </th>
              <th scope="col" className="w-9 px-1 py-2">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => {
              const prefix = `details.${index}`;
              const quantity = parseAmountInput(line.quantity) ?? 0;
              const unitPrice = parseAmountInput(line.unitPrice) ?? 0;
              const subtotal = lineSubtotal({ quantity, unitPrice });
              const isCuota = line.conceptType === "CUOTA";
              const enrollmentItems = options.map((option) => ({
                value: String(option.enrollmentId),
                label: `${option.label} · ${formatCurrency(option.amount)}`,
              }));
              const currentEnrollment =
                line.conceptId &&
                !enrollmentItems.some((item) => item.value === line.conceptId)
                  ? [
                      {
                        value: line.conceptId,
                        label: `Inscripción #${line.conceptId}`,
                      },
                      ...enrollmentItems,
                    ]
                  : enrollmentItems;

              return (
                <tr
                  key={index}
                  className="border-b border-border align-top last:border-b-0"
                >
                  <td className="px-2 py-2 text-xs text-muted-foreground tabular-nums">
                    {index + 1}
                  </td>

                  <td className="px-1 py-1.5">
                    <Select
                      items={CONCEPT_TYPE_OPTIONS}
                      value={line.conceptType}
                      onValueChange={(value) =>
                        changeConcept(index, String(value))
                      }
                    >
                      <SelectTrigger
                        size="sm"
                        className="w-full border-0 bg-transparent shadow-none"
                        aria-label={`Concepto de la línea ${index + 1}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONCEPT_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>

                  <td className="px-1 py-1.5">
                    {isCuota ? (
                      billingLoading ? (
                        <p className="px-1.5 py-1 text-xs text-muted-foreground">
                          Cargando inscripciones…
                        </p>
                      ) : currentEnrollment.length === 0 ? (
                        <p className="px-1.5 py-1 text-xs text-muted-foreground">
                          Sin inscripciones activas
                        </p>
                      ) : (
                        <Select
                          items={currentEnrollment}
                          value={line.conceptId}
                          onValueChange={(value) =>
                            changeEnrollment(index, String(value))
                          }
                        >
                          <SelectTrigger
                            size="sm"
                            className={cn(
                              "w-full border-0 bg-transparent shadow-none",
                              errors[`${prefix}.conceptId`] &&
                                "ring-1 ring-destructive",
                            )}
                            aria-label={`Inscripción de la línea ${index + 1}`}
                          >
                            <SelectValue placeholder="Elegí una inscripción" />
                          </SelectTrigger>
                          <SelectContent>
                            {currentEnrollment.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )
                    ) : (
                      <span className="block px-1.5 py-1 text-xs text-muted-foreground">
                        Monto manual
                      </span>
                    )}
                    {errors[`${prefix}.conceptId`] ? (
                      <p role="alert" className="px-1.5 pt-0.5 text-xs text-destructive">
                        {errors[`${prefix}.conceptId`]}
                      </p>
                    ) : null}
                  </td>

                  <td className="px-1 py-1.5">
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="AAAA-MM"
                      value={line.correspondingMonth}
                      onChange={(event) =>
                        changeMonth(index, event.target.value)
                      }
                      maxLength={7}
                      disabled={!isCuota}
                      aria-label={`Mes de la línea ${index + 1}`}
                      aria-invalid={Boolean(errors[`${prefix}.correspondingMonth`])}
                      className="h-8 rounded-none border-0 bg-transparent px-1.5 shadow-none focus-visible:ring-1 focus-visible:ring-inset disabled:opacity-50"
                    />
                    {errors[`${prefix}.correspondingMonth`] ? (
                      <p role="alert" className="px-1.5 pt-0.5 text-xs text-destructive">
                        {errors[`${prefix}.correspondingMonth`]}
                      </p>
                    ) : null}
                  </td>

                  <td className="px-1 py-1.5">
                    <Input
                      value={line.description}
                      onChange={(event) =>
                        updateLine(index, { description: event.target.value })
                      }
                      placeholder="Descripción del concepto"
                      maxLength={255}
                      aria-label={`Descripción de la línea ${index + 1}`}
                      aria-invalid={Boolean(errors[`${prefix}.description`])}
                      className="h-8 rounded-none border-0 bg-transparent px-1.5 shadow-none focus-visible:ring-1 focus-visible:ring-inset"
                    />
                    {errors[`${prefix}.description`] ? (
                      <p role="alert" className="px-1.5 pt-0.5 text-xs text-destructive">
                        {errors[`${prefix}.description`]}
                      </p>
                    ) : null}
                  </td>

                  <td className="px-1 py-1.5">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={line.quantity}
                      onChange={(event) =>
                        updateLine(index, { quantity: event.target.value })
                      }
                      aria-label={`Cantidad de la línea ${index + 1}`}
                      aria-invalid={Boolean(errors[`${prefix}.quantity`])}
                      className="h-8 rounded-none border-0 bg-transparent px-1.5 text-right shadow-none focus-visible:ring-1 focus-visible:ring-inset"
                    />
                    {errors[`${prefix}.quantity`] ? (
                      <p role="alert" className="px-1.5 pt-0.5 text-right text-xs text-destructive">
                        {errors[`${prefix}.quantity`]}
                      </p>
                    ) : null}
                  </td>

                  <td className="px-1 py-1.5">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={line.unitPrice}
                      onChange={(event) =>
                        updateLine(index, { unitPrice: event.target.value })
                      }
                      placeholder="0"
                      aria-label={`Precio unitario de la línea ${index + 1}`}
                      aria-invalid={Boolean(errors[`${prefix}.unitPrice`])}
                      className="h-8 rounded-none border-0 bg-transparent px-1.5 text-right tabular-nums shadow-none focus-visible:ring-1 focus-visible:ring-inset"
                    />
                    {errors[`${prefix}.unitPrice`] ? (
                      <p role="alert" className="px-1.5 pt-0.5 text-right text-xs text-destructive">
                        {errors[`${prefix}.unitPrice`]}
                      </p>
                    ) : null}
                  </td>

                  <td className="px-1 py-1.5">
                    <Select
                      items={VAT_OPTIONS}
                      value={line.vatType}
                      onValueChange={(value) =>
                        updateLine(index, {
                          vatType: value as InvoiceLineValues["vatType"],
                        })
                      }
                    >
                      <SelectTrigger
                        size="sm"
                        className="w-full border-0 bg-transparent shadow-none"
                        aria-label={`IVA de la línea ${index + 1}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VAT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>

                  <td className="px-2 py-2 text-right font-medium tabular-nums">
                    {formatCurrency(subtotal)}
                  </td>

                  <td className="px-1 py-1.5 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeLine(index)}
                      disabled={lines.length === 1}
                      aria-label={`Quitar línea ${index + 1}`}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {errors.details ? (
        <p role="alert" className="text-sm text-destructive">
          {errors.details}
        </p>
      ) : null}

      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-primary hover:bg-primary/5"
          onClick={addLine}
        >
          <Plus aria-hidden="true" />
          Agregar concepto
        </Button>
      </div>
    </div>
  );
}
