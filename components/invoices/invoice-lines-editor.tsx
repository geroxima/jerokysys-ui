"use client";

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
  lineTotal,
  parseAmountInput,
  roundCurrency,
} from "@/lib/invoices/format";
import { VAT_OPTIONS } from "@/lib/invoices/labels";
import type { FieldErrors, InvoiceLineValues } from "@/lib/invoices/types";
import { cn } from "@/lib/utils";

const cellInput =
  "h-8 rounded-none border-0 bg-transparent px-1.5 shadow-none focus-visible:ring-1 focus-visible:ring-inset";

export function InvoiceLinesEditor({
  lines,
  errors,
  onChange,
}: {
  lines: InvoiceLineValues[];
  errors: FieldErrors;
  onChange: (lines: InvoiceLineValues[]) => void;
}) {
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
    onChange([
      ...lines,
      {
        description: "",
        amount: "",
        vatRate: 10,
        correspondingMonth: "",
      },
    ]);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <caption className="sr-only">
            Detalle de conceptos de la factura.
          </caption>
          <thead>
            <tr className="border-y border-border text-[11px] tracking-wide text-muted-foreground uppercase">
              <th scope="col" className="w-8 px-2 py-2 text-left font-medium">
                #
              </th>
              <th scope="col" className="px-2 py-2 text-left font-medium">
                Concepto
              </th>
              <th scope="col" className="w-28 px-2 py-2 text-left font-medium">
                Mes
              </th>
              <th scope="col" className="w-32 px-2 py-2 text-right font-medium">
                Monto
              </th>
              <th scope="col" className="w-28 px-2 py-2 text-left font-medium">
                IVA
              </th>
              <th scope="col" className="w-32 px-2 py-2 text-right font-medium">
                Total
              </th>
              <th scope="col" className="w-9 px-1 py-2">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => {
              const prefix = `details.${index}`;
              const amount = parseAmountInput(line.amount) ?? 0;
              const total = roundCurrency(
                lineTotal({ amount, vatRate: line.vatRate }),
              );
              const descriptionError = errors[`${prefix}.description`];
              const amountError = errors[`${prefix}.amount`];
              const vatError = errors[`${prefix}.vatRate`];
              const monthError = errors[`${prefix}.correspondingMonth`];

              return (
                <tr
                  key={index}
                  className="border-b border-border align-top last:border-b-0"
                >
                  <td className="px-2 py-2 text-xs text-muted-foreground tabular-nums">
                    {index + 1}
                  </td>

                  <td className="px-1 py-1.5">
                    <Input
                      id={`${prefix}.description`}
                      value={line.description}
                      onChange={(event) =>
                        updateLine(index, { description: event.target.value })
                      }
                      placeholder="Ej. Mensualidad marzo [MATRICULA#12]"
                      maxLength={255}
                      aria-label={`Concepto de la línea ${index + 1}`}
                      aria-invalid={Boolean(descriptionError)}
                      aria-describedby={
                        descriptionError
                          ? `${prefix}.description-error`
                          : undefined
                      }
                      className={cellInput}
                    />
                    {descriptionError ? (
                      <p
                        id={`${prefix}.description-error`}
                        role="alert"
                        className="px-1.5 pt-0.5 text-xs text-destructive"
                      >
                        {descriptionError}
                      </p>
                    ) : null}
                  </td>

                  <td className="px-1 py-1.5">
                    <Input
                      id={`${prefix}.correspondingMonth`}
                      type="text"
                      inputMode="numeric"
                      placeholder="AAAA-MM"
                      value={line.correspondingMonth}
                      onChange={(event) =>
                        updateLine(index, {
                          correspondingMonth: event.target.value,
                        })
                      }
                      maxLength={7}
                      aria-label={`Mes imputado de la línea ${index + 1}`}
                      aria-invalid={Boolean(monthError)}
                      aria-describedby={
                        monthError ? `${prefix}.month-error` : undefined
                      }
                      className={cellInput}
                    />
                    {monthError ? (
                      <p
                        id={`${prefix}.month-error`}
                        role="alert"
                        className="px-1.5 pt-0.5 text-xs text-destructive"
                      >
                        {monthError}
                      </p>
                    ) : null}
                  </td>

                  <td className="px-1 py-1.5">
                    <Input
                      id={`${prefix}.amount`}
                      type="text"
                      inputMode="decimal"
                      value={line.amount}
                      onChange={(event) =>
                        updateLine(index, { amount: event.target.value })
                      }
                      placeholder="0"
                      aria-label={`Monto de la línea ${index + 1}`}
                      aria-invalid={Boolean(amountError)}
                      aria-describedby={
                        amountError ? `${prefix}.amount-error` : undefined
                      }
                      className={cn(cellInput, "text-right tabular-nums")}
                    />
                    {amountError ? (
                      <p
                        id={`${prefix}.amount-error`}
                        role="alert"
                        className="px-1.5 pt-0.5 text-right text-xs text-destructive"
                      >
                        {amountError}
                      </p>
                    ) : null}
                  </td>

                  <td className="px-1 py-1.5">
                    <Select
                      items={VAT_OPTIONS}
                      value={line.vatRate}
                      onValueChange={(value) =>
                        updateLine(index, {
                          vatRate: typeof value === "number" ? value : 10,
                        })
                      }
                    >
                      <SelectTrigger
                        id={`${prefix}.vatRate`}
                        size="sm"
                        aria-label={`IVA de la línea ${index + 1}`}
                        aria-invalid={Boolean(vatError)}
                        className="w-full border-0 bg-transparent shadow-none"
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
                    {vatError ? (
                      <p role="alert" className="px-1.5 pt-0.5 text-xs text-destructive">
                        {vatError}
                      </p>
                    ) : null}
                  </td>

                  <td className="px-2 py-2 text-right font-medium tabular-nums">
                    {formatCurrency(total)}
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
          Agregar línea
        </Button>
      </div>
    </div>
  );
}
