export const INVOICE_STATUSES = ["PENDING", "PAID", "CANCELLED"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const SALE_CONDITIONS = ["CONTADO", "CREDITO"] as const;
export type SaleCondition = (typeof SALE_CONDITIONS)[number];

export const VAT_RATES = [10, 5, 0] as const;
export type VatRate = (typeof VAT_RATES)[number];

/** Línea de factura ya normalizada (los montos llegan como string desde la API). */
export type InvoiceLine = {
  id: number | null;
  invoiceId: number | null;
  description: string;
  amount: number;
  vatRate: number;
  correspondingMonth: string | null;
};

export type Invoice = {
  id: number;
  studentId: number;
  timbrado: string;
  invoiceNumber: string;
  taxId: string;
  businessName: string;
  issueDate: string;
  saleCondition: SaleCondition;
  totalAmount: number;
  totalIva: number;
  paymentStatus: InvoiceStatus;
  details: InvoiceLine[];
};

export type InvoicePage = {
  content: Invoice[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};

export type InvoiceListResult = {
  items: Invoice[];
  pagination: InvoicePage | null;
  filtered: boolean;
  total: number;
};

export type StatusSummary = {
  count: number;
  total: number;
};

export type InvoiceStats = {
  all: StatusSummary;
  pending: StatusSummary;
  paid: StatusSummary;
  cancelled: StatusSummary;
};

export type InvoiceSortField =
  | "id"
  | "issueDate"
  | "invoiceNumber"
  | "businessName"
  | "totalAmount"
  | "paymentStatus";

/** Filtros que acepta el microservicio. No se combinan entre sí. */
export type InvoiceFilter =
  | { type: "none" }
  | { type: "status"; status: InvoiceStatus }
  | { type: "query"; value: string }
  | { type: "student"; value: string }
  | { type: "invoiceNumber"; value: string }
  | { type: "timbrado"; value: string }
  | { type: "taxId"; value: string }
  | { type: "date"; value: string }
  | { type: "dateRange"; from: string; to: string }
  | { type: "amountRange"; min: string; max: string }
  | { type: "saleCondition"; value: SaleCondition };

export type InvoiceQuery = {
  filter: InvoiceFilter;
  sort: InvoiceSortField;
  direction: "ASC" | "DESC";
  page: number;
};

/** Estado del formulario: los montos son strings para poder escribirlos. */
export type InvoiceLineValues = {
  description: string;
  amount: string;
  vatRate: number;
  correspondingMonth: string;
};

/** Datos fiscales del emisor, configurados por variables de entorno. */
export type IssuerInfo = {
  name: string;
  ruc: string;
  address: string;
  phone: string;
  email: string;
  activity: string;
};

/** Timbrado habilitado; cada uno puede tener su propia dirección. */
export type InvoiceTimbrado = {
  timbrado: string;
  serie: string;
  label: string;
  address: string;
  key: string;
};

export type InvoiceFormValues = {
  studentId: string;
  timbrado: string;
  serie: string;
  taxId: string;
  businessName: string;
  issueDate: string;
  saleCondition: SaleCondition;
  details: InvoiceLineValues[];
};

export type FieldErrors = Record<string, string>;

export type InvoiceActionResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: FieldErrors };

export type ParsedInvoiceLine = {
  description: string;
  amount: number;
  vatRate: number;
  correspondingMonth: string | null;
};

export type ParsedInvoice = {
  studentId: number;
  timbrado: string;
  serie: string;
  taxId: string;
  businessName: string;
  issueDate: string;
  saleCondition: SaleCondition;
  details: ParsedInvoiceLine[];
};

export type InvoicePayload = {
  studentId: number;
  timbrado: string;
  invoiceNumber: string;
  taxId: string;
  businessName: string;
  issueDate: string;
  saleCondition: SaleCondition;
  totalAmount: number;
  details: Array<{
    invoiceId: number;
    description: string;
    amount: number;
    vatRate: number;
    correspondingMonth: string | null;
  }>;
};
