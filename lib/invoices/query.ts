import type {
  InvoiceFilter,
  InvoiceQuery,
  InvoiceSortField,
  InvoiceStatus,
  SaleCondition,
} from "./types";
import { formatCurrency, formatDate } from "./format";

const SORT_FIELDS: InvoiceSortField[] = [
  "id",
  "issueDate",
  "invoiceNumber",
  "customerName",
  "totalAmount",
  "paymentStatus",
];

export const INVOICE_PAGE_SIZE = 10;

const DEFAULT_QUERY: InvoiceQuery = {
  filter: { type: "none" },
  sort: "issueDate",
  direction: "DESC",
  page: 0,
};

function firstValue(
  value: string | string[] | undefined,
): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

function parseStatus(value: string | undefined): InvoiceStatus | undefined {
  if (value === "PENDING" || value === "PAID" || value === "CANCELLED") {
    return value;
  }
  return undefined;
}

function parseSaleCondition(value: string | undefined): SaleCondition | undefined {
  if (value === "CONTADO" || value === "CREDITO") {
    return value;
  }
  return undefined;
}

function parseDate(value: string | undefined): string | undefined {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

/** El backend no combina filtros: se elige el primero presente en la URL. */
export function parseInvoiceQuery(
  params: Record<string, string | string[] | undefined>,
): InvoiceQuery {
  const status = parseStatus(firstValue(params.status));
  const query = firstValue(params.q);
  const student = firstValue(params.student);
  const invoiceNumber = firstValue(params.invoiceNumber);
  const stampNumber = firstValue(params.stampNumber);
  const customerRuc = firstValue(params.ruc);
  const date = parseDate(firstValue(params.date));
  const from = parseDate(firstValue(params.from));
  const to = parseDate(firstValue(params.to));
  const min = firstValue(params.min);
  const max = firstValue(params.max);
  const saleCondition = parseSaleCondition(firstValue(params.condition));

  let filter: InvoiceFilter = { type: "none" };

  if (status) {
    filter = { type: "status", status };
  } else if (query) {
    filter = { type: "query", value: query };
  } else if (student) {
    filter = { type: "student", value: student };
  } else if (invoiceNumber) {
    filter = { type: "invoiceNumber", value: invoiceNumber };
  } else if (stampNumber) {
    filter = { type: "stampNumber", value: stampNumber };
  } else if (customerRuc) {
    filter = { type: "customerRuc", value: customerRuc };
  } else if (date) {
    filter = { type: "date", value: date };
  } else if (from && to) {
    filter = { type: "dateRange", from, to };
  } else if (min && max) {
    filter = { type: "amountRange", min, max };
  } else if (saleCondition) {
    filter = { type: "saleCondition", value: saleCondition };
  }

  const sortParam = firstValue(params.sort);
  const sort = SORT_FIELDS.includes(sortParam as InvoiceSortField)
    ? (sortParam as InvoiceSortField)
    : DEFAULT_QUERY.sort;
  const direction = firstValue(params.direction) === "ASC" ? "ASC" : "DESC";
  const pageParam = Number(firstValue(params.page));
  const page =
    Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 0;

  return { filter, sort, direction, page };
}

function appendFilter(params: URLSearchParams, filter: InvoiceFilter): void {
  switch (filter.type) {
    case "status":
      params.set("status", filter.status);
      break;
    case "query":
      params.set("q", filter.value);
      break;
    case "student":
      params.set("student", filter.value);
      break;
    case "invoiceNumber":
      params.set("invoiceNumber", filter.value);
      break;
    case "stampNumber":
      params.set("stampNumber", filter.value);
      break;
    case "customerRuc":
      params.set("ruc", filter.value);
      break;
    case "date":
      params.set("date", filter.value);
      break;
    case "dateRange":
      params.set("from", filter.from);
      params.set("to", filter.to);
      break;
    case "amountRange":
      params.set("min", filter.min);
      params.set("max", filter.max);
      break;
    case "saleCondition":
      params.set("condition", filter.value);
      break;
    case "none":
      break;
  }
}

export function invoiceHref(query: InvoiceQuery): string {
  const params = new URLSearchParams();
  appendFilter(params, query.filter);

  if (query.sort !== DEFAULT_QUERY.sort) {
    params.set("sort", query.sort);
  }
  if (query.direction !== DEFAULT_QUERY.direction) {
    params.set("direction", query.direction);
  }
  if (query.page > 0) {
    params.set("page", String(query.page));
  }

  const search = params.toString();
  return search ? `/invoices?${search}` : "/invoices";
}

export function defaultInvoiceQuery(): InvoiceQuery {
  return { ...DEFAULT_QUERY };
}

export function isFiltered(query: InvoiceQuery): boolean {
  return query.filter.type !== "none";
}

export function describeFilter(filter: InvoiceFilter): string | null {
  switch (filter.type) {
    case "status":
      return filter.status === "PENDING"
        ? "Pendientes"
        : filter.status === "PAID"
          ? "Pagadas"
          : "Anuladas";
    case "query":
      return `Cliente: “${filter.value}”`;
    case "student":
      return `Alumno #${filter.value}`;
    case "invoiceNumber":
      return `Factura ${filter.value}`;
    case "stampNumber":
      return `Timbrado ${filter.value}`;
    case "customerRuc":
      return `RUC ${filter.value}`;
    case "date":
      return `Emitida el ${formatDate(filter.value)}`;
    case "dateRange":
      return `Del ${formatDate(filter.from)} al ${formatDate(filter.to)}`;
    case "amountRange":
      return `Total entre ${formatCurrency(Number(filter.min))} y ${formatCurrency(Number(filter.max))}`;
    case "saleCondition":
      return filter.value === "CONTADO" ? "Venta al contado" : "Venta a crédito";
    case "none":
      return null;
  }
}
