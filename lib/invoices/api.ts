import { ApiError, apiRequest as request } from "@/lib/api-client";
import { translateInvoiceError } from "./errors";
import { roundCurrency } from "./format";
import { buildInvoicePayload } from "./payload";
import { INVOICE_PAGE_SIZE } from "./query";
import type {
  Invoice,
  InvoiceConceptType,
  InvoiceLine,
  InvoiceListResult,
  InvoicePage,
  InvoicePayload,
  InvoiceQuery,
  InvoiceStats,
  InvoiceStatus,
  IssuerInfo,
  ParsedInvoice,
  SaleCondition,
  StatusSummary,
  TaxStamp,
  VatType,
} from "./types";

type RawInvoiceDetail = {
  id?: number | null;
  invoiceId?: number | null;
  description?: string | null;
  quantity?: string | number | null;
  unitPrice?: string | number | null;
  subtotal?: string | number | null;
  vatType?: string | null;
  conceptType?: string | null;
  conceptId?: number | null;
  correspondingMonth?: string | null;
};

type RawInvoice = {
  id?: number | null;
  studentId?: number | null;
  taxStampId?: number | null;
  establishmentCode?: string | null;
  expeditionPoint?: string | null;
  sequenceNumber?: number | null;
  invoiceNumber?: string | null;
  issueDate?: string | null;
  dueDate?: string | null;
  saleCondition?: string | null;
  paymentStatus?: string | null;
  customerName?: string | null;
  customerRuc?: string | null;
  customerAddress?: string | null;
  issuerName?: string | null;
  issuerRuc?: string | null;
  issuerActivity?: string | null;
  issuerPhone?: string | null;
  issuerAddress?: string | null;
  issuerEmail?: string | null;
  stampNumber?: string | null;
  stampValidFrom?: string | null;
  stampValidUntil?: string | null;
  exemptAmount?: string | number | null;
  sales5Amount?: string | number | null;
  sales10Amount?: string | number | null;
  iva5Amount?: string | number | null;
  iva10Amount?: string | number | null;
  totalAmount?: string | number | null;
  totalIva?: string | number | null;
  details?: RawInvoiceDetail[] | null;
};

type RawPage = {
  content?: RawInvoice[] | null;
  totalElements?: number;
  totalPages?: number;
  page?: number;
  size?: number;
};

function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = toNumber(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeStatus(value: unknown): InvoiceStatus {
  return value === "PAID" || value === "CANCELLED" ? value : "PENDING";
}

function normalizeSaleCondition(value: unknown): SaleCondition {
  return value === "CREDITO" ? "CREDITO" : "CONTADO";
}

function normalizeVatType(value: unknown): VatType {
  if (value === "GRAVADA_5" || value === "EXENTA" || value === "GRAVADA_10") {
    return value;
  }
  return "GRAVADA_10";
}

function normalizeConceptType(value: unknown): InvoiceConceptType | null {
  if (
    value === "MATRICULA" ||
    value === "CUOTA" ||
    value === "EXAMEN" ||
    value === "OTRO"
  ) {
    return value;
  }
  return null;
}

function normalizeLine(raw: RawInvoiceDetail): InvoiceLine {
  const subtotal = toNumber(raw.subtotal);
  return {
    id: raw.id ?? null,
    invoiceId: raw.invoiceId ?? null,
    description: raw.description ?? "",
    quantity: toNumber(raw.quantity),
    unitPrice: toNumber(raw.unitPrice),
    subtotal,
    vatType: normalizeVatType(raw.vatType),
    conceptType: normalizeConceptType(raw.conceptType),
    conceptId: toNumberOrNull(raw.conceptId),
    correspondingMonth: raw.correspondingMonth ?? null,
  };
}

function normalizeInvoice(raw: RawInvoice): Invoice {
  return {
    id: toNumber(raw.id),
    studentId: toNumberOrNull(raw.studentId),
    taxStampId: toNumber(raw.taxStampId),
    establishmentCode: raw.establishmentCode ?? "",
    expeditionPoint: raw.expeditionPoint ?? "",
    sequenceNumber: toNumber(raw.sequenceNumber),
    invoiceNumber: raw.invoiceNumber ?? "",
    issueDate: raw.issueDate ?? "",
    dueDate: raw.dueDate ?? null,
    saleCondition: normalizeSaleCondition(raw.saleCondition),
    paymentStatus: normalizeStatus(raw.paymentStatus),
    customerName: raw.customerName ?? "",
    customerRuc: raw.customerRuc ?? "",
    customerAddress: raw.customerAddress ?? null,
    issuerName: raw.issuerName ?? "",
    issuerRuc: raw.issuerRuc ?? "",
    issuerActivity: raw.issuerActivity ?? "",
    issuerPhone: raw.issuerPhone ?? null,
    issuerAddress: raw.issuerAddress ?? "",
    issuerEmail: raw.issuerEmail ?? null,
    stampNumber: raw.stampNumber ?? "",
    stampValidFrom: raw.stampValidFrom ?? "",
    stampValidUntil: raw.stampValidUntil ?? "",
    exemptAmount: toNumber(raw.exemptAmount),
    sales5Amount: toNumber(raw.sales5Amount),
    sales10Amount: toNumber(raw.sales10Amount),
    iva5Amount: toNumber(raw.iva5Amount),
    iva10Amount: toNumber(raw.iva10Amount),
    totalAmount: toNumber(raw.totalAmount),
    totalIva: toNumber(raw.totalIva),
    details: (raw.details ?? []).map(normalizeLine),
  };
}

function normalizePage(raw: RawPage): InvoicePage {
  const content = (raw.content ?? []).map(normalizeInvoice);
  return {
    content,
    totalElements: raw.totalElements ?? content.length,
    totalPages: raw.totalPages ?? 1,
    page: raw.page ?? 0,
    size: raw.size ?? INVOICE_PAGE_SIZE,
  };
}

function endpointForFilter(query: InvoiceQuery): string {
  const { filter } = query;

  switch (filter.type) {
    case "status":
      return `/invoices/by-status?status=${filter.status}`;
    case "query":
      return `/invoices/search-by-customer-name?customerName=${encodeURIComponent(filter.value)}`;
    case "student":
      return `/invoices/by-student/${encodeURIComponent(filter.value)}`;
    case "invoiceNumber":
      return `/invoices/by-number?invoiceNumber=${encodeURIComponent(filter.value)}`;
    case "stampNumber":
      return `/invoices/by-stamp-number?stampNumber=${encodeURIComponent(filter.value)}`;
    case "customerRuc":
      return `/invoices/by-customer-ruc?ruc=${encodeURIComponent(filter.value)}`;
    case "date":
      return `/invoices/by-date?date=${encodeURIComponent(filter.value)}`;
    case "dateRange":
      return `/invoices/by-date-range?from=${filter.from}&to=${filter.to}`;
    case "amountRange":
      return `/invoices/by-amount-range?min=${encodeURIComponent(filter.min)}&max=${encodeURIComponent(filter.max)}`;
    case "saleCondition":
      return `/invoices/by-sale-condition?condition=${filter.value}`;
    case "none": {
      const params = new URLSearchParams({
        page: String(query.page),
        size: String(INVOICE_PAGE_SIZE),
        sort: query.sort,
        direction: query.direction,
      });
      return `/invoices?${params.toString()}`;
    }
  }
}

const RETRYABLE_STATUSES = new Set([502, 503, 504]);
const GET_RETRY_DELAY_MS = 400;

function statusMessage(status: number): string {
  switch (status) {
    case 502:
      return "El servicio de facturación no respondió correctamente (HTTP 502).";
    case 503:
      return "El servicio de facturación no está disponible (HTTP 503).";
    case 504:
      return "El servicio de facturación tardó demasiado en responder (HTTP 504).";
    default:
      return "El servidor de facturación tuvo un problema. Intentá de nuevo en unos minutos.";
  }
}

function isTransient(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 0 || RETRYABLE_STATUSES.has(error.status))
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiRequestOnce<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();

  try {
    return await request<T>(path, {
      ...init,
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    if (!(error instanceof ApiError)) {
      throw new ApiError(
        0,
        null,
        "No se pudo conectar con el servidor de facturación. Verificá que la API esté en línea.",
      );
    }

    if (error.status === 0) {
      throw new ApiError(
        0,
        null,
        "No se pudo conectar con el servidor de facturación. Verificá que la API esté en línea.",
      );
    }

    if (error.status >= 500) {
      console.error("[invoices] API error", {
        path,
        method,
        status: error.status,
        code: error.code,
      });
      throw new ApiError(error.status, error.code, statusMessage(error.status));
    }

    throw new ApiError(
      error.status,
      error.code,
      translateInvoiceError(error.message),
    );
  }
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  // Solo los GET se reintentan: las escrituras no son idempotentes.
  const maxAttempts = method === "GET" ? 2 : 1;

  for (let attempt = 1; ; attempt += 1) {
    try {
      return await apiRequestOnce<T>(path, init);
    } catch (error) {
      if (attempt >= maxAttempts || !isTransient(error)) {
        throw error;
      }
      await delay(GET_RETRY_DELAY_MS);
    }
  }
}

export async function listInvoices(
  query: InvoiceQuery,
): Promise<InvoiceListResult> {
  const path = endpointForFilter(query);

  if (query.filter.type === "none") {
    const raw = await apiRequest<RawPage>(path);
    const page = normalizePage(raw);
    return {
      items: page.content,
      pagination: page,
      filtered: false,
      total: page.totalElements,
    };
  }

  const raw = await apiRequest<RawInvoice[]>(path);
  const items = (raw ?? []).map(normalizeInvoice);

  return {
    items,
    pagination: null,
    filtered: true,
    total: items.length,
  };
}

export async function getInvoice(id: number): Promise<Invoice> {
  const raw = await apiRequest<RawInvoice>(`/invoices/${id}`);
  return normalizeInvoice(raw);
}

export async function getValidTaxStamps(): Promise<TaxStamp[]> {
  const raw = await apiRequest<TaxStamp[]>("/tax-stamps/valid");
  return (raw ?? []).map((stamp) => ({
    ...stamp,
    id: Number(stamp.id),
    nextSequence: stamp.nextSequence ? Number(stamp.nextSequence) : 0,
  }));
}

function summarize(invoices: Invoice[]): StatusSummary {
  return {
    count: invoices.length,
    total: roundCurrency(
      invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0),
    ),
  };
}

export async function getInvoiceStats(): Promise<InvoiceStats> {
  const [pendingRaw, paidRaw, cancelledRaw] = await Promise.all([
    apiRequest<RawInvoice[]>("/invoices/by-status?status=PENDING"),
    apiRequest<RawInvoice[]>("/invoices/by-status?status=PAID"),
    apiRequest<RawInvoice[]>("/invoices/by-status?status=CANCELLED"),
  ]);

  const pending = summarize((pendingRaw ?? []).map(normalizeInvoice));
  const paid = summarize((paidRaw ?? []).map(normalizeInvoice));
  const cancelled = summarize((cancelledRaw ?? []).map(normalizeInvoice));

  return {
    pending,
    paid,
    cancelled,
    all: {
      count: pending.count + paid.count + cancelled.count,
      total: roundCurrency(pending.total + paid.total + cancelled.total),
    },
  };
}

export async function createInvoice(payload: InvoicePayload): Promise<Invoice> {
  const raw = await apiRequest<RawInvoice>("/invoices", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeInvoice(raw);
}

export async function updateInvoice(
  id: number,
  payload: InvoicePayload,
): Promise<Invoice> {
  const raw = await apiRequest<RawInvoice>(`/invoices/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return normalizeInvoice(raw);
}

export async function createInvoiceFromForm(
  data: ParsedInvoice,
  issuer: IssuerInfo,
): Promise<Invoice> {
  return createInvoice(buildInvoicePayload(data, issuer));
}

export async function updateInvoiceFromForm(
  id: number,
  data: ParsedInvoice,
  issuer: IssuerInfo,
): Promise<Invoice> {
  const current = await getInvoice(id);

  if (current.paymentStatus !== "PENDING") {
    throw new ApiError(
      409,
      null,
      "Solo las facturas pendientes admiten cambios.",
    );
  }

  return updateInvoice(id, buildInvoicePayload(data, issuer));
}

export async function changeInvoiceStatus(
  id: number,
  status: Extract<InvoiceStatus, "PAID" | "CANCELLED">,
): Promise<Invoice> {
  const raw = await apiRequest<RawInvoice>(
    `/invoices/${id}/status?status=${status}`,
    { method: "PATCH" },
  );
  return normalizeInvoice(raw);
}

export async function deleteInvoice(id: number): Promise<void> {
  await apiRequest<void>(`/invoices/${id}`, { method: "DELETE" });
}

export {
  isForbidden,
  isNotFound,
  isUnauthorized,
} from "@/lib/api-client";
