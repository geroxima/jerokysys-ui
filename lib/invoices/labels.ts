import type { InvoiceStatus, SaleCondition } from "./types";

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  PENDING: "Pendiente",
  PAID: "Pagada",
  CANCELLED: "Anulada",
};

export const INVOICE_STATUS_DESCRIPTIONS: Record<InvoiceStatus, string> = {
  PENDING: "Pendiente de pago",
  PAID: "Pagada",
  CANCELLED: "Anulada",
};

export const SALE_CONDITION_LABELS: Record<SaleCondition, string> = {
  CONTADO: "Contado",
  CREDITO: "Crédito",
};

export const SALE_CONDITION_OPTIONS = [
  { value: "CONTADO", label: "Contado" },
  { value: "CREDITO", label: "Crédito" },
] as const;

export const VAT_OPTIONS = [
  { value: 10, label: "IVA 10%" },
  { value: 5, label: "IVA 5%" },
  { value: 0, label: "Exento" },
] as const;

export const INVOICE_FILTER_OPTIONS = [
  { value: "query", label: "Razón social" },
  { value: "invoiceNumber", label: "Número de factura" },
  { value: "student", label: "ID de alumno" },
  { value: "timbrado", label: "Timbrado" },
  { value: "taxId", label: "RUC" },
  { value: "date", label: "Fecha de emisión" },
  { value: "dateRange", label: "Rango de fechas" },
  { value: "amountRange", label: "Rango de subtotal" },
  { value: "saleCondition", label: "Condición de venta" },
] as const;

export type InvoiceFilterType = (typeof INVOICE_FILTER_OPTIONS)[number]["value"];
