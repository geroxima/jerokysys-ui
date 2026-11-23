import type {
  InvoiceConceptType,
  InvoiceStatus,
  SaleCondition,
  VatType,
} from "./types";

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
  { value: "GRAVADA_10", label: "IVA 10%" },
  { value: "GRAVADA_5", label: "IVA 5%" },
  { value: "EXENTA", label: "Exento" },
] as const;

export const VAT_LABELS: Record<VatType, string> = {
  GRAVADA_10: "IVA 10%",
  GRAVADA_5: "IVA 5%",
  EXENTA: "Exento",
};

export const CONCEPT_TYPE_LABELS: Record<InvoiceConceptType, string> = {
  MATRICULA: "Matrícula",
  CUOTA: "Cuota",
  EXAMEN: "Examen",
  OTRO: "Otro",
};

export const CONCEPT_TYPE_OPTIONS = [
  { value: "MATRICULA", label: "Matrícula" },
  { value: "CUOTA", label: "Cuota" },
  { value: "OTRO", label: "Otro" },
] as const;

export const INVOICE_FILTER_OPTIONS = [
  { value: "query", label: "Cliente" },
  { value: "invoiceNumber", label: "Número de factura" },
  { value: "student", label: "ID de alumno" },
  { value: "stampNumber", label: "Timbrado" },
  { value: "customerRuc", label: "RUC del cliente" },
  { value: "date", label: "Fecha de emisión" },
  { value: "dateRange", label: "Rango de fechas" },
  { value: "amountRange", label: "Rango de total" },
  { value: "saleCondition", label: "Condición de venta" },
] as const;

export type InvoiceFilterType = (typeof INVOICE_FILTER_OPTIONS)[number]["value"];
