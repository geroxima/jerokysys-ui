export const INVOICE_STATUSES = ["PENDING", "PAID", "CANCELLED"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const SALE_CONDITIONS = ["CONTADO", "CREDITO"] as const;
export type SaleCondition = (typeof SALE_CONDITIONS)[number];

export const VAT_TYPES = ["GRAVADA_10", "GRAVADA_5", "EXENTA"] as const;
export type VatType = (typeof VAT_TYPES)[number];

export const CONCEPT_TYPES = ["MATRICULA", "CUOTA", "EXAMEN", "OTRO"] as const;
export type InvoiceConceptType = (typeof CONCEPT_TYPES)[number];

/** Línea de factura ya normalizada (los montos llegan como string desde la API). */
export type InvoiceLine = {
  id: number | null;
  invoiceId: number | null;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  vatType: VatType;
  conceptType: InvoiceConceptType | null;
  conceptId: number | null;
  correspondingMonth: string | null;
};

export type Invoice = {
  id: number;
  studentId: number | null;
  taxStampId: number;
  establishmentCode: string;
  expeditionPoint: string;
  sequenceNumber: number;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string | null;
  saleCondition: SaleCondition;
  paymentStatus: InvoiceStatus;
  customerName: string;
  customerRuc: string;
  customerAddress: string | null;
  issuerName: string;
  issuerRuc: string;
  issuerActivity: string;
  issuerPhone: string | null;
  issuerAddress: string;
  issuerEmail: string | null;
  stampNumber: string;
  stampValidFrom: string;
  stampValidUntil: string;
  exemptAmount: number;
  sales5Amount: number;
  sales10Amount: number;
  iva5Amount: number;
  iva10Amount: number;
  totalAmount: number;
  totalIva: number;
  details: InvoiceLine[];
};

export type InvoiceTotalsData = {
  exemptAmount: number;
  sales5Amount: number;
  sales10Amount: number;
  iva5Amount: number;
  iva10Amount: number;
  totalAmount: number;
  totalIva: number;
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
  | "customerName"
  | "totalAmount"
  | "paymentStatus";

/** Filtros que acepta el microservicio. No se combinan entre sí. */
export type InvoiceFilter =
  | { type: "none" }
  | { type: "status"; status: InvoiceStatus }
  | { type: "query"; value: string }
  | { type: "student"; value: string }
  | { type: "invoiceNumber"; value: string }
  | { type: "stampNumber"; value: string }
  | { type: "customerRuc"; value: string }
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

/** Timbrado autorizado que devuelve `/tax-stamps/valid`. */
export type TaxStamp = {
  id: number;
  businessRuc: string;
  stampNumber: string;
  establishmentCode: string;
  expeditionPoint: string;
  validFrom: string;
  validUntil: string;
  nextSequence?: number;
  active?: boolean;
};

/** Estado del formulario: los montos son strings para poder escribirlos. */
export type InvoiceLineValues = {
  conceptType: InvoiceConceptType;
  conceptId: string;
  description: string;
  quantity: string;
  unitPrice: string;
  vatType: VatType;
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

export type InvoiceFormValues = {
  studentId: string;
  taxStampId: string;
  issueDate: string;
  dueDate: string;
  saleCondition: SaleCondition;
  customerName: string;
  customerRuc: string;
  customerAddress: string;
  details: InvoiceLineValues[];
};

export type FieldErrors = Record<string, string>;

export type InvoiceActionResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: FieldErrors };

export type ParsedInvoiceLine = {
  conceptType: InvoiceConceptType;
  conceptId: number | null;
  description: string;
  quantity: number;
  unitPrice: number;
  vatType: VatType;
  correspondingMonth: string | null;
};

export type ParsedInvoice = {
  studentId: number;
  taxStampId: number;
  issueDate: string;
  dueDate: string | null;
  saleCondition: SaleCondition;
  customerName: string;
  customerRuc: string;
  customerAddress: string | null;
  details: ParsedInvoiceLine[];
};

export type InvoicePayload = {
  studentId: number;
  taxStampId: number;
  issueDate: string;
  dueDate: string | null;
  saleCondition: SaleCondition;
  customerName: string;
  customerRuc: string;
  customerAddress: string | null;
  issuerName: string;
  issuerRuc: string;
  issuerActivity: string;
  issuerPhone: string | null;
  issuerAddress: string;
  issuerEmail: string | null;
  details: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    vatType: VatType;
    conceptType: InvoiceConceptType;
    conceptId: number | null;
    correspondingMonth: string | null;
  }>;
};
