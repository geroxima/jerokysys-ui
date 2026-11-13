import type { Invoice } from "./types";

const INVOICE_NUMBER_PATTERN = /^(\d{3})-(\d{3})-(\d{7})$/;

export type ParsedInvoiceNumber = {
  timbrado: string;
  serie: string;
  correlativo: number;
};

export function parseInvoiceNumber(
  value: string,
): ParsedInvoiceNumber | null {
  const match = INVOICE_NUMBER_PATTERN.exec(value.trim());

  if (!match) {
    return null;
  }

  return {
    timbrado: match[1],
    serie: match[2],
    correlativo: Number(match[3]),
  };
}

export function formatInvoiceNumber(
  timbrado: string,
  serie: string,
  correlativo: number,
): string {
  return `${timbrado}-${serie}-${String(correlativo).padStart(7, "0")}`;
}

/**
 * El microservicio no expone un correlativo. Calculamos el siguiente a partir
 * de las facturas del mismo timbrado y serie. Es best-effort: el backend sigue
 * siendo la autoridad y puede rechazar un número repetido.
 */
export function nextInvoiceNumber(
  invoices: Invoice[],
  timbrado: string,
  serie: string,
): string {
  let maxCorrelativo = 0;

  for (const invoice of invoices) {
    const parsed = parseInvoiceNumber(invoice.invoiceNumber);
    if (parsed && parsed.timbrado === timbrado && parsed.serie === serie) {
      maxCorrelativo = Math.max(maxCorrelativo, parsed.correlativo);
    }
  }

  return formatInvoiceNumber(timbrado, serie, maxCorrelativo + 1);
}
