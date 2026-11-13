"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Lock } from "lucide-react";

import { InvoiceIssuerHeader } from "@/components/invoices/invoice-issuer-header";
import { InvoiceLinesEditor } from "@/components/invoices/invoice-lines-editor";
import { InvoiceTotals } from "@/components/invoices/invoice-totals";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseAmountInput } from "@/lib/invoices/format";
import { SALE_CONDITION_LABELS } from "@/lib/invoices/labels";
import type {
  FieldErrors,
  InvoiceFormValues,
  InvoiceLineValues,
  InvoiceStatus,
  InvoiceTimbrado,
  IssuerInfo,
} from "@/lib/invoices/types";
import { validateInvoiceForm } from "@/lib/invoices/validation";
import { useCreateInvoice, useUpdateInvoice } from "@/lib/query/invoices";
import { cn } from "@/lib/utils";

const sheetInput =
  "h-8 rounded-none border-0 border-b border-border bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:border-ring";

export function InvoiceForm({
  mode,
  invoiceId,
  initialValues,
  cancelHref,
  issuer,
  timbrados,
  numberByTimbrado,
  fixedInvoiceNumber,
  status,
}: {
  mode: "create" | "edit";
  invoiceId?: number;
  initialValues: InvoiceFormValues;
  cancelHref: string;
  issuer: IssuerInfo;
  timbrados: InvoiceTimbrado[];
  numberByTimbrado: Record<string, string>;
  fixedInvoiceNumber?: string;
  status?: InvoiceStatus;
}) {
  const router = useRouter();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const pending = createInvoice.isPending || updateInvoice.isPending;

  const [values, setValues] = useState<InvoiceFormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);

  const timbradoKey = `${values.timbrado}-${values.serie}`;
  const selectedTimbrado =
    timbrados.find((option) => option.key === timbradoKey) ?? null;
  const address = selectedTimbrado?.address || issuer.address;
  const invoiceNumber =
    mode === "edit"
      ? (fixedInvoiceNumber ?? null)
      : (numberByTimbrado[timbradoKey] ?? null);

  const totalsLines = values.details.map((line) => ({
    amount: parseAmountInput(line.amount) ?? 0,
    vatRate: line.vatRate,
  }));

  function clearError(...keys: string[]) {
    setErrors((current) => {
      if (!keys.some((key) => key in current)) {
        return current;
      }
      const next = { ...current };
      for (const key of keys) {
        delete next[key];
      }
      return next;
    });
  }

  function update<K extends keyof InvoiceFormValues>(
    key: K,
    value: InvoiceFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    clearError(key as string);
  }

  function updateLines(lines: InvoiceLineValues[]) {
    setValues((current) => ({ ...current, details: lines }));
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(next)) {
        if (key.startsWith("details")) {
          delete next[key];
        }
      }
      return next;
    });
  }

  function changeTimbrado(key: string) {
    const option = timbrados.find((item) => item.key === key);
    if (!option) {
      return;
    }

    setValues((current) => ({
      ...current,
      timbrado: option.timbrado,
      serie: option.serie,
    }));
    clearError("timbrado", "serie");
  }

  function revealFirstError() {
    window.setTimeout(() => {
      const firstInvalid = document.querySelector<HTMLElement>(
        '[aria-invalid="true"]',
      );

      if (firstInvalid) {
        firstInvalid.focus({ preventScroll: true });
        firstInvalid.scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }

      document
        .getElementById("invoice-form-error")
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 60);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const result = validateInvoiceForm(values);
    if (!result.valid) {
      setErrors(result.errors);
      setMessage("Revisá los campos marcados antes de guardar.");
      revealFirstError();
      return;
    }

    setErrors({});

    if (mode === "edit" && !invoiceId) {
      setMessage("No se pudo identificar la factura que querés editar.");
      revealFirstError();
      return;
    }

    try {
      const invoice =
        mode === "create"
          ? await createInvoice.mutateAsync(result.data)
          : await updateInvoice.mutateAsync({
              id: invoiceId as number,
              data: result.data,
            });

      router.push(`/invoices/${invoice.id}`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la factura.",
      );
      revealFirstError();
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {message ? (
        <Alert id="invoice-form-error" variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>No se pudo guardar la factura</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <article className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <InvoiceIssuerHeader
          issuer={issuer}
          timbrados={timbrados}
          mode={mode}
          invoiceNumber={invoiceNumber}
          timbradoKey={timbradoKey}
          address={address}
          issueDate={values.issueDate}
          saleCondition={values.saleCondition}
          status={status}
          errors={errors}
          onTimbradoChange={changeTimbrado}
          onDateChange={(value) => update("issueDate", value)}
          onConditionChange={(value) => update("saleCondition", value)}
        />

        {mode === "edit" ? (
          <p className="flex items-center gap-2 border-t border-border bg-muted/40 px-6 py-2 text-xs text-muted-foreground sm:px-8">
            <Lock className="size-3.5" aria-hidden="true" />
            El número y el timbrado no se pueden modificar en una factura
            emitida.
          </p>
        ) : null}

        <section className="border-t border-border px-6 py-5 sm:px-8">
          <h2 className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Cliente
          </h2>

          <div className="mt-3 grid gap-4 sm:grid-cols-[140px_minmax(0,1fr)_200px]">
            <SheetField
              id="studentId"
              label="ID de alumno"
              value={values.studentId}
              onChange={(value) => update("studentId", value.replace(/\D/g, ""))}
              error={errors.studentId}
              placeholder="Ej. 12"
              inputMode="numeric"
            />
            <SheetField
              id="businessName"
              label="Razón social"
              value={values.businessName}
              onChange={(value) => update("businessName", value)}
              error={errors.businessName}
              placeholder="Ej. Juan Pérez"
              maxLength={150}
            />
            <SheetField
              id="taxId"
              label="RUC"
              value={values.taxId}
              onChange={(value) => update("taxId", value)}
              error={errors.taxId}
              placeholder="20123456789"
              inputMode="numeric"
              maxLength={20}
            />
          </div>
        </section>

        <section className="border-t border-border px-6 py-5 sm:px-8">
          <h2 className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Detalle
          </h2>

          <div className="mt-3">
            <InvoiceLinesEditor
              lines={values.details}
              errors={errors}
              onChange={updateLines}
            />
          </div>
        </section>

        <footer className="grid gap-6 border-t border-border px-6 py-5 sm:grid-cols-[minmax(0,1fr)_300px] sm:px-8">
          <div className="flex flex-col gap-2 text-sm">
            <p>
              <span className="text-muted-foreground">Condición: </span>
              {SALE_CONDITION_LABELS[values.saleCondition]}
            </p>
            <p>
              <span className="text-muted-foreground">Timbrado: </span>
              <span className="tabular-nums">{timbradoKey}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Comprobante: </span>
              <span className="tabular-nums">
                {invoiceNumber ?? "pendiente de generar"}
              </span>
            </p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Los totales definitivos los recalcula el servidor a partir de las
              líneas. El IVA se calcula sobre el monto de cada línea.
            </p>
          </div>

          <InvoiceTotals lines={totalsLines} />
        </footer>

        <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-2 border-t border-border bg-card/95 px-6 py-3 backdrop-blur sm:px-8">
          <Link
            href={cancelHref}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-9 bg-background",
            )}
          >
            Cancelar
          </Link>
          <Button type="submit" size="lg" className="h-9" disabled={pending}>
            {pending ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : null}
            {pending
              ? "Guardando…"
              : mode === "create"
                ? "Guardar factura"
                : "Guardar cambios"}
          </Button>
        </div>
      </article>
    </form>
  );
}

function SheetField({
  id,
  label,
  value,
  onChange,
  error,
  ...props
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
} & Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "id">) {
  return (
    <div className="flex flex-col gap-1">
      <Label
        htmlFor={id}
        className="text-[11px] tracking-wide text-muted-foreground uppercase"
      >
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={sheetInput}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
