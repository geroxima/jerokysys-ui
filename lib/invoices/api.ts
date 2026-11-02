import "server-only";

import { authFetch } from "@/lib/api";
import { InvoiceApiError, translateInvoiceError } from "./errors";
import { invoiceTotal, roundCurrency } from "./format";
import { nextInvoiceNumber } from "./numbering";
import { INVOICE_PAGE_SIZE } from "./query";
import type {
  Invoice,
  InvoiceLine,
  InvoiceListResult,
  InvoicePage,
  InvoicePayload,
  InvoiceQuery,
  InvoiceStats,
  InvoiceStatus,
  SaleCondition,
  StatusSummary,
} from "./types";

type ApiEnvelope<T> = {
  data: T;
  message?: string;
  code?: string | null;
  status?: number;
  success?: boolean;
};

type RawInvoiceDetail = {
  id?: number | null;
  invoiceId?: number | null;
  description?: string | null;
  amount?: string | number | null;
  vatRate?: number | null;
  correspondingMonth?: string | null;
};

type RawInvoice = {
  id?: number | null;
  studentId?: number | null;
  timbrado?: string | null;
  invoiceNumber?: string | null;
  taxId?: string | null;
  businessName?: string | null;
  issueDate?: string | null;
  saleCondition?: string | null;
  totalAmount?: string | number | null;
  totalIva?: string | number | null;
  paymentStatus?: string | null;
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

function normalizeStatus(value: unknown): InvoiceStatus {
  return value === "PAID" || value === "CANCELLED" ? value : "PENDING";
}

function normalizeSaleCondition(value: unknown): SaleCondition {
  return value === "CREDITO" ? "CREDITO" : "CONTADO";
}

function normalizeLine(raw: RawInvoiceDetail): InvoiceLine {
  return {
    id: raw.id ?? null,
    invoiceId: raw.invoiceId ?? null,
    description: raw.description ?? "",
    amount: toNumber(raw.amount),
    vatRate: toNumber(raw.vatRate),
    correspondingMonth: raw.correspondingMonth ?? null,
  };
}

function normalizeInvoice(raw: RawInvoice): Invoice {
  return {
    id: toNumber(raw.id),
    studentId: toNumber(raw.studentId),
    timbrado: raw.timbrado ?? "",
    invoiceNumber: raw.invoiceNumber ?? "",
    taxId: raw.taxId ?? "",
    businessName: raw.businessName ?? "",
    issueDate: raw.issueDate ?? "",
    saleCondition: normalizeSaleCondition(raw.saleCondition),
    totalAmount: toNumber(raw.totalAmount),
    totalIva: toNumber(raw.totalIva),
    paymentStatus: normalizeStatus(raw.paymentStatus),
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
      return `/invoices/search-by-business-name?businessName=${encodeURIComponent(filter.value)}`;
    case "student":
      return `/invoices/by-student/${encodeURIComponent(filter.value)}`;
    case "invoiceNumber":
      return `/invoices/by-number?invoiceNumber=${encodeURIComponent(filter.value)}`;
    case "timbrado":
      return `/invoices/by-timbrado?timbrado=${encodeURIComponent(filter.value)}`;
    case "taxId":
      return `/invoices/by-tax-id?taxId=${encodeURIComponent(filter.value)}`;
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
    error instanceof InvoiceApiError &&
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
  let response: Response;

  try {
    response = await authFetch(path, {
      ...init,
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new InvoiceApiError(
      "No se pudo conectar con el servidor de facturación. Verificá que la API esté en línea.",
      0,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let body: ApiEnvelope<T> | null = null;
  let parseError = false;

  if (text) {
    try {
      body = JSON.parse(text) as ApiEnvelope<T>;
    } catch {
      parseError = true;
    }
  }

  if (response.ok && body && body.success !== false) {
    return body.data;
  }

  if (response.ok) {
    throw new InvoiceApiError(
      "La respuesta del servidor no es válida.",
      response.status,
    );
  }

  if (response.status >= 500) {
    console.error("[invoices] API error", {
      path,
      method: (init?.method ?? "GET").toUpperCase(),
      status: response.status,
      code: body?.code ?? null,
      bodyPreview: text.slice(0, 500),
    });
  }

  const message =
    response.status >= 500
      ? statusMessage(response.status)
      : parseError
        ? translateInvoiceError(undefined)
        : translateInvoiceError(body?.message);

  throw new InvoiceApiError(message, response.status, body?.code ?? undefined);
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

/**
 * El microservicio no expone un correlativo. Lo calculamos a partir de las
 * facturas del mismo timbrado, filtrando por serie. Es best-effort: el backend
 * sigue siendo la autoridad y puede rechazar el número con 409.
 */
export async function getNextInvoiceNumber(
  timbrado: string,
  serie: string,
): Promise<string> {
  const raw = await apiRequest<RawInvoice[]>(
    `/invoices/by-timbrado?timbrado=${encodeURIComponent(timbrado)}`,
  );
  const invoices = (raw ?? []).map(normalizeInvoice);
  return nextInvoiceNumber(invoices, timbrado, serie);
}

function summarize(invoices: Invoice[]): StatusSummary {
  return {
    count: invoices.length,
    total: roundCurrency(
      invoices.reduce((sum, invoice) => sum + invoiceTotal(invoice), 0),
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
      total: roundCurrency(
        pending.total + paid.total + cancelled.total,
      ),
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

export function isUnauthorized(error: unknown): boolean {
  return error instanceof InvoiceApiError && error.status === 401;
}

export function isForbidden(error: unknown): boolean {
  return error instanceof InvoiceApiError && error.status === 403;
}

export function isNotFound(error: unknown): boolean {
  return error instanceof InvoiceApiError && error.status === 404;
}
