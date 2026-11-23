"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Lock } from "lucide-react";

import { InvoiceConceptEditor } from "@/components/invoices/invoice-concept-editor";
import { InvoiceIssuerHeader } from "@/components/invoices/invoice-issuer-header";
import { InvoiceTotals } from "@/components/invoices/invoice-totals";
import { StudentPicker } from "@/components/invoices/student-picker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatCurrency,
  lineSubtotal,
  parseAmountInput,
  totalsFromLines,
} from "@/lib/invoices/format";
import { SALE_CONDITION_LABELS } from "@/lib/invoices/labels";
import type {
  FieldErrors,
  InvoiceFormValues,
  InvoiceLineValues,
  InvoiceStatus,
  IssuerInfo,
  TaxStamp,
} from "@/lib/invoices/types";
import { emptyLineValues, validateInvoiceForm } from "@/lib/invoices/validation";
import { fullName, type Student } from "@/lib/personas";
import { useGuardian } from "@/lib/query/guardians";
import { useCreateInvoice, useUpdateInvoice } from "@/lib/query/invoices";
import { useStudent } from "@/lib/query/students";
import { cn } from "@/lib/utils";

const sheetInput =
  "h-8 rounded-none border-0 border-b border-border bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:border-ring";

export function InvoiceForm({
  mode,
  invoiceId,
  initialValues,
  initialStudent,
  cancelHref,
  issuer,
  taxStamps,
  fixedInvoiceNumber,
  status,
}: {
  mode: "create" | "edit";
  invoiceId?: number;
  initialValues: InvoiceFormValues;
  initialStudent?: Student | null;
  cancelHref: string;
  issuer: IssuerInfo;
  taxStamps: TaxStamp[];
  fixedInvoiceNumber?: string;
  status?: InvoiceStatus;
}) {
  const router = useRouter();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const pending = createInvoice.isPending || updateInvoice.isPending;

  const [values, setValues] = useState<InvoiceFormValues>(initialValues);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(
    initialStudent ?? null,
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const lastPayerKey = useRef("");

  const studentId = Number(values.studentId);
  const studentQuery = useStudent(
    Number.isInteger(studentId) && studentId > 0 ? studentId : null,
  );
  const activeStudent = selectedStudent ?? studentQuery.data ?? null;
  const guardianQuery = useGuardian(activeStudent?.guardianId);
  const studentName = activeStudent ? fullName(activeStudent) : "";

  const previewLines = useMemo(
    () =>
      values.details.map((line) => {
        const quantity = parseAmountInput(line.quantity) ?? 0;
        const unitPrice = parseAmountInput(line.unitPrice) ?? 0;
        return {
          id: null,
          invoiceId: null,
          description: line.description,
          quantity,
          unitPrice,
          subtotal: lineSubtotal({ quantity, unitPrice }),
          vatType: line.vatType,
          conceptType: line.conceptType,
          conceptId: null,
          correspondingMonth: line.correspondingMonth || null,
        };
      }),
    [values.details],
  );
  const totals = totalsFromLines(previewLines);

  /* eslint-disable react-hooks/set-state-in-effect --
     El pagador se autocompleta cuando React Query termina de cargar al
     guardián. Es una sincronización con una fuente externa, no un render loop. */
  useEffect(() => {
    if (mode !== "create" || !activeStudent) {
      return;
    }

    const payerKey = `${activeStudent.id}:${activeStudent.guardianId ?? "self"}`;
    if (lastPayerKey.current === payerKey) {
      return;
    }

    if (activeStudent.guardianId != null) {
      const guardian = guardianQuery.data;
      if (guardian) {
        setValues((current) => ({
          ...current,
          customerName: fullName(guardian),
          customerRuc: guardian.ruc ?? "",
          customerAddress: guardian.address ?? "",
        }));
        lastPayerKey.current = payerKey;
        return;
      }
      if (guardianQuery.isError) {
        setValues((current) => ({
          ...current,
          customerName: fullName(activeStudent),
          customerRuc: activeStudent.ruc ?? "",
          customerAddress: activeStudent.address ?? "",
        }));
        lastPayerKey.current = payerKey;
      }
      return;
    }

    setValues((current) => ({
      ...current,
      customerName: fullName(activeStudent),
      customerRuc: activeStudent.ruc ?? "",
      customerAddress: activeStudent.address ?? "",
    }));
    lastPayerKey.current = payerKey;
  }, [mode, activeStudent, guardianQuery.data, guardianQuery.isError]);
  /* eslint-enable react-hooks/set-state-in-effect */

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

  function handleStudentSelect(student: Student | null) {
    lastPayerKey.current = "";
    setSelectedStudent(student);
    setValues((current) => ({
      ...current,
      studentId: student ? String(student.id) : "",
      details: student ? [emptyLineValues()] : current.details,
      customerName: student
        ? student.guardianId != null
          ? ""
          : fullName(student)
        : "",
      customerRuc: student
        ? student.guardianId != null
          ? ""
          : (student.ruc ?? "")
        : "",
      customerAddress: student
        ? student.guardianId != null
          ? ""
          : (student.address ?? "")
        : "",
    }));
    clearError("studentId");
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

    if (!issuer.ruc || !issuer.address || !issuer.activity) {
      setMessage(
        "Faltan datos del emisor. Configurá NEXT_PUBLIC_ISSUER_RUC, NEXT_PUBLIC_ISSUER_ADDRESS y NEXT_PUBLIC_ISSUER_ACTIVITY.",
      );
      revealFirstError();
      return;
    }

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
          ? await createInvoice.mutateAsync({
              data: result.data,
              issuer,
            })
          : await updateInvoice.mutateAsync({
              id: invoiceId as number,
              data: result.data,
              issuer,
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

  const invoiceNumber =
    mode === "edit" ? (fixedInvoiceNumber ?? null) : null;
  const payerLabel =
    activeStudent?.guardianId != null
      ? guardianQuery.data
        ? `Guardián: ${fullName(guardianQuery.data)}`
        : "Guardián del alumno"
      : activeStudent
        ? `Alumno: ${fullName(activeStudent)}`
        : null;

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
          taxStamps={taxStamps}
          mode={mode}
          taxStampId={values.taxStampId}
          invoiceNumber={invoiceNumber}
          issueDate={values.issueDate}
          saleCondition={values.saleCondition}
          status={status}
          errors={errors}
          onTaxStampChange={(value) => update("taxStampId", value)}
          onDateChange={(value) => update("issueDate", value)}
          onConditionChange={(value) => update("saleCondition", value)}
        />

        {mode === "edit" ? (
          <p className="flex items-center gap-2 border-t border-border bg-muted/40 px-6 py-2 text-xs text-muted-foreground sm:px-8">
            <Lock aria-hidden="true" className="size-3.5" />
            El número, el timbrado y la fecha de emisión no se pueden modificar.
          </p>
        ) : null}

        <section className="border-t border-border px-6 py-5 sm:px-8">
          <h2 className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Cliente
          </h2>

          <div className="mt-3 flex flex-col gap-4">
            {mode === "create" ? (
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <StudentPicker
                  value={values.studentId}
                  selected={selectedStudent}
                  onChange={handleStudentSelect}
                  error={errors.studentId}
                />
                <div className="flex flex-col justify-end gap-1 pb-1">
                  <span className="text-[11px] tracking-wide text-muted-foreground uppercase">
                    Se factura a
                  </span>
                  <p className="text-sm font-medium">
                    {payerLabel ?? "Elegí un alumno"}
                  </p>
                  {activeStudent?.guardianId != null &&
                  !guardianQuery.isLoading &&
                  !guardianQuery.data ? (
                    <p className="text-xs text-destructive">
                      No se pudo cargar el guardián. Se muestran los datos del
                      alumno.
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Alumno #{values.studentId || "—"}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px_220px]">
              <SheetField
                id="customerName"
                label="Nombre o razón social"
                value={values.customerName}
                onChange={(value) => update("customerName", value)}
                error={errors.customerName}
                placeholder="Ej. Juan Pérez"
                maxLength={150}
              />
              <SheetField
                id="customerRuc"
                label="RUC"
                value={values.customerRuc}
                onChange={(value) => update("customerRuc", value)}
                error={errors.customerRuc}
                placeholder="80012345-6"
                inputMode="numeric"
                maxLength={20}
              />
              <SheetField
                id="customerAddress"
                label="Dirección"
                value={values.customerAddress}
                onChange={(value) => update("customerAddress", value)}
                error={errors.customerAddress}
                placeholder="Opcional"
                maxLength={255}
              />
            </div>

            {values.saleCondition === "CREDITO" ? (
              <div className="grid gap-4 sm:w-52">
                <SheetField
                  id="dueDate"
                  label="Vencimiento"
                  type="date"
                  value={values.dueDate}
                  onChange={(value) => update("dueDate", value)}
                  error={errors.dueDate}
                />
              </div>
            ) : null}

            {values.customerRuc.trim() === "" && activeStudent ? (
              <p className="text-xs text-muted-foreground">
                El pagador no tiene RUC cargado. Ingresalo manualmente para esta
                factura.
              </p>
            ) : null}
          </div>
        </section>

        <section className="border-t border-border px-6 py-5 sm:px-8">
          <h2 className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Conceptos
          </h2>

          <div className="mt-3">
            <InvoiceConceptEditor
              studentId={
                Number.isInteger(studentId) && studentId > 0 ? studentId : null
              }
              studentName={studentName}
              lines={values.details}
              errors={errors}
              onChange={updateLines}
            />
          </div>
        </section>

        <footer className="grid gap-6 border-t border-border px-6 py-5 sm:grid-cols-[minmax(0,1fr)_320px] sm:px-8">
          <div className="flex flex-col gap-2 text-sm">
            <p>
              <span className="text-muted-foreground">Condición: </span>
              {SALE_CONDITION_LABELS[values.saleCondition]}
            </p>
            <p>
              <span className="text-muted-foreground">Timbrado: </span>
              <span className="tabular-nums">
                {taxStamps.find((stamp) => String(stamp.id) === values.taxStampId)
                  ?.stampNumber ?? "—"}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Comprobante: </span>
              <span className="tabular-nums">
                {invoiceNumber ?? "pendiente de generar"}
              </span>
            </p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Los totales definitivos los recalcula el servidor. El IVA ya está
              incluido en los valores de venta.
            </p>
            <p className="text-xs text-muted-foreground">
              Total de líneas: {formatCurrency(totals.totalAmount)}
            </p>
          </div>

          <InvoiceTotals totals={totals} />
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
