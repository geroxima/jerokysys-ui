import type {
  Invoice,
  InvoiceLine,
  InvoiceTotalsData,
  VatType,
} from "./types";

const currencyFormatter = new Intl.NumberFormat("es-PY", {
  style: "currency",
  currency: "PYG",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("es-PY", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

const longDateFormatter = new Intl.DateTimeFormat("es-PY", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const monthFormatter = new Intl.DateTimeFormat("es-PY", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

/** Formatea una fecha pura `YYYY-MM-DD` sin corrimientos de zona horaria. */
export function formatDate(isoDate: string): string {
  const date = parseIsoDate(isoDate);
  return date ? dateFormatter.format(date) : "—";
}

export function formatLongDate(isoDate: string): string {
  const date = parseIsoDate(isoDate);
  return date ? longDateFormatter.format(date) : "—";
}

/** Formatea `YYYY-MM`, el mes de imputación de una línea. */
export function formatMonth(value: string | null): string {
  if (!value) {
    return "—";
  }

  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) {
    return value;
  }

  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  return monthFormatter.format(date);
}

export function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

const paraguayDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Asuncion",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function todayIsoDate(): string {
  return paraguayDateFormatter.format(new Date());
}

export function isValidInvoiceNumber(value: string): boolean {
  return /^\d{3}-\d{3}-\d{7}$/.test(value);
}

/** Inserta los guiones del formato 001-001-0000123 mientras se escribe. */
export function formatInvoiceNumberInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  const blocks = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 13)];

  return blocks.filter(Boolean).join("-");
}

/** Acepta `1.500,50`, `1500.50` y `1500`. */
export function parseAmountInput(value: string): number | null {
  const cleaned = value.trim().replace(/\s/g, "");
  if (!cleaned) {
    return null;
  }

  let normalized = cleaned;
  if (cleaned.includes(",") && cleaned.includes(".")) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (cleaned.includes(",")) {
    normalized = cleaned.replace(",", ".");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function lineSubtotal(line: Pick<InvoiceLine, "quantity" | "unitPrice">): number {
  return roundCurrency(line.quantity * line.unitPrice);
}

/** IVA incluido en el subtotal de la línea. */
export function lineVat(line: Pick<InvoiceLine, "subtotal" | "vatType">): number {
  if (line.vatType === "GRAVADA_5") {
    return roundCurrency(line.subtotal / 21);
  }
  if (line.vatType === "GRAVADA_10") {
    return roundCurrency(line.subtotal / 11);
  }
  return 0;
}

export function totalsFromLines(lines: InvoiceLine[]): InvoiceTotalsData {
  let exemptAmount = 0;
  let sales5Amount = 0;
  let sales10Amount = 0;

  for (const line of lines) {
    if (line.vatType === "EXENTA") {
      exemptAmount += line.subtotal;
    } else if (line.vatType === "GRAVADA_5") {
      sales5Amount += line.subtotal;
    } else if (line.vatType === "GRAVADA_10") {
      sales10Amount += line.subtotal;
    }
  }

  sales5Amount = roundCurrency(sales5Amount);
  sales10Amount = roundCurrency(sales10Amount);
  exemptAmount = roundCurrency(exemptAmount);

  const iva5Amount = roundCurrency(sales5Amount / 21);
  const iva10Amount = roundCurrency(sales10Amount / 11);

  return {
    exemptAmount,
    sales5Amount,
    sales10Amount,
    iva5Amount,
    iva10Amount,
    totalAmount: roundCurrency(exemptAmount + sales5Amount + sales10Amount),
    totalIva: roundCurrency(iva5Amount + iva10Amount),
  };
}

/** El total de la factura ya incluye IVA. */
export function invoiceTotal(invoice: Pick<Invoice, "totalAmount">): number {
  return roundCurrency(invoice.totalAmount);
}

export function vatTypeLabel(vatType: VatType | null): string {
  switch (vatType) {
    case "GRAVADA_10":
      return "Gravada 10%";
    case "GRAVADA_5":
      return "Gravada 5%";
    case "EXENTA":
      return "Exenta";
    default:
      return "—";
  }
}

export function pluralize(
  count: number,
  singular: string,
  plural: string,
): string {
  return count === 1 ? singular : plural;
}

/**
 * Compatibilidad con facturas viejas que guardaban el concepto como token
 * `[MATRICULA#12]` al final de la descripción.
 */
export function stripConceptToken(description: string): string {
  return description
    .replace(/\s*\[(MATRICULA|CUOTA|EXAMEN|OTRO)#\d+\]\s*$/i, "")
    .trim();
}
