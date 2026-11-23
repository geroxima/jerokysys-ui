"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  INVOICE_FILTER_OPTIONS,
  SALE_CONDITION_OPTIONS,
  type InvoiceFilterType,
} from "@/lib/invoices/labels";
import {
  formatInvoiceNumberInput,
  isValidInvoiceNumber,
  parseAmountInput,
} from "@/lib/invoices/format";
import { describeFilter, invoiceHref } from "@/lib/invoices/query";
import type {
  InvoiceFilter,
  InvoiceQuery,
  InvoiceStats,
  SaleCondition,
} from "@/lib/invoices/types";
import { cn } from "@/lib/utils";

type Draft = {
  type: InvoiceFilterType;
  value: string;
  from: string;
  to: string;
  min: string;
  max: string;
  condition: SaleCondition;
};

const STATUS_TABS: Array<{ key: string; label: string; filter: InvoiceFilter }> = [
  { key: "all", label: "Todas", filter: { type: "none" } },
  {
    key: "PENDING",
    label: "Pendientes",
    filter: { type: "status", status: "PENDING" },
  },
  { key: "PAID", label: "Pagadas", filter: { type: "status", status: "PAID" } },
  {
    key: "CANCELLED",
    label: "Anuladas",
    filter: { type: "status", status: "CANCELLED" },
  },
];

function filterKey(filter: InvoiceFilter): string {
  switch (filter.type) {
    case "none":
      return "all";
    case "status":
      return filter.status;
    default:
      return filter.type;
  }
}

function draftFromFilter(filter: InvoiceFilter): Draft {
  const base: Draft = {
    type: "query",
    value: "",
    from: "",
    to: "",
    min: "",
    max: "",
    condition: "CONTADO",
  };

  switch (filter.type) {
    case "query":
      return { ...base, type: "query", value: filter.value };
    case "student":
      return { ...base, type: "student", value: filter.value };
    case "invoiceNumber":
      return { ...base, type: "invoiceNumber", value: filter.value };
    case "stampNumber":
      return { ...base, type: "stampNumber", value: filter.value };
    case "customerRuc":
      return { ...base, type: "customerRuc", value: filter.value };
    case "date":
      return { ...base, type: "date", value: filter.value };
    case "dateRange":
      return { ...base, type: "dateRange", from: filter.from, to: filter.to };
    case "amountRange":
      return { ...base, type: "amountRange", min: filter.min, max: filter.max };
    case "saleCondition":
      return { ...base, type: "saleCondition", condition: filter.value };
    case "status":
    case "none":
      return base;
  }
}

function buildFilter(draft: Draft): { filter?: InvoiceFilter; error?: string } {
  const value = draft.value.trim();

  switch (draft.type) {
    case "query":
      return value
        ? { filter: { type: "query", value } }
        : { error: "Ingresá un cliente." };
    case "student":
      return /^\d+$/.test(value)
        ? { filter: { type: "student", value } }
        : { error: "El ID del alumno debe ser numérico." };
    case "invoiceNumber":
      return isValidInvoiceNumber(value)
        ? { filter: { type: "invoiceNumber", value } }
        : { error: "Usá el formato 001-001-0000123." };
    case "stampNumber":
      return value
        ? { filter: { type: "stampNumber", value } }
        : { error: "Ingresá el timbrado." };
    case "customerRuc":
      return value
        ? { filter: { type: "customerRuc", value } }
        : { error: "Ingresá el RUC." };
    case "date":
      return draft.value
        ? { filter: { type: "date", value: draft.value } }
        : { error: "Elegí una fecha." };
    case "dateRange":
      if (!draft.from || !draft.to) {
        return { error: "Completá las dos fechas." };
      }
      if (draft.from > draft.to) {
        return { error: "La fecha inicial no puede ser posterior a la final." };
      }
      return { filter: { type: "dateRange", from: draft.from, to: draft.to } };
    case "amountRange": {
      const min = parseAmountInput(draft.min);
      const max = parseAmountInput(draft.max);
      if (min === null || max === null) {
        return { error: "Completá ambos importes." };
      }
      if (min < 0 || max < 0 || min > max) {
        return { error: "El rango de importes no es válido." };
      }
      return {
        filter: { type: "amountRange", min: String(min), max: String(max) },
      };
    }
    case "saleCondition":
      return { filter: { type: "saleCondition", value: draft.condition } };
  }
}

export function InvoiceFilters({
  query,
  stats,
}: {
  query: InvoiceQuery;
  stats: InvoiceStats | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(
    query.filter.type === "query" ? query.filter.value : "",
  );
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => draftFromFilter(query.filter));
  const [draftError, setDraftError] = useState<string | null>(null);

  const activeKey = filterKey(query.filter);
  const activeDescription =
    query.filter.type === "status" || query.filter.type === "none"
      ? null
      : describeFilter(query.filter);

  const counts: Record<string, number | undefined> = {
    all: stats?.all.count,
    PENDING: stats?.pending.count,
    PAID: stats?.paid.count,
    CANCELLED: stats?.cancelled.count,
  };

  function navigate(filter: InvoiceFilter) {
    const href = invoiceHref({
      filter,
      sort: "issueDate",
      direction: "DESC",
      page: 0,
    });
    startTransition(() => router.push(href));
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = search.trim();
    navigate(value ? { type: "query", value } : { type: "none" });
  }

  function clearAll() {
    setSearch("");
    setDraftError(null);
    navigate({ type: "none" });
  }

  function openFilters() {
    setDraft(draftFromFilter(query.filter));
    setDraftError(null);
    setOpen(true);
  }

  function applyFilters() {
    const result = buildFilter(draft);
    if (!result.filter) {
      setDraftError(result.error ?? "El filtro no es válido.");
      return;
    }

    setOpen(false);
    navigate(result.filter);
  }

  function updateDraft(patch: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...patch }));
    setDraftError(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <nav
          aria-label="Filtrar facturas por estado"
          className="inline-flex flex-wrap items-center gap-0.5 rounded-lg bg-muted p-1"
        >
          {STATUS_TABS.map((tab) => {
            const active = activeKey === tab.key;
            return (
              <Link
                key={tab.key}
                href={invoiceHref({
                  filter: tab.filter,
                  sort: "issueDate",
                  direction: "DESC",
                  page: 0,
                })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-sm transition-colors",
                  active
                    ? "bg-background font-medium text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
                {counts[tab.key] !== undefined ? (
                  <span
                    className={cn(
                      "text-[11px] tabular-nums",
                      active ? "text-muted-foreground" : "text-muted-foreground/70",
                    )}
                  >
                    {counts[tab.key]}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <form
            role="search"
            onSubmit={submitSearch}
            className="relative min-w-0 flex-1 sm:w-64 sm:flex-none"
          >
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="text"
              name="q"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por cliente"
              aria-label="Buscar por cliente"
              className="h-9 bg-background pr-8 pl-8"
            />
            {search ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  if (query.filter.type === "query") {
                    navigate({ type: "none" });
                  }
                }}
                aria-label="Limpiar búsqueda"
                className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </form>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-9 bg-background"
            onClick={openFilters}
            aria-haspopup="dialog"
          >
            <SlidersHorizontal aria-hidden="true" />
            Filtros
          </Button>
        </div>
      </div>

      <div className="flex min-h-5 flex-wrap items-center gap-2">
        {activeDescription ? (
          <>
            <Badge variant="secondary" className="h-6 gap-1.5 px-2">
              {activeDescription}
              <button
                type="button"
                onClick={clearAll}
                aria-label="Quitar filtro"
                className="rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-6 px-1.5 text-xs text-muted-foreground"
            >
              Limpiar filtros
            </Button>
          </>
        ) : null}
        {isPending ? (
          <span className="text-xs text-muted-foreground" role="status">
            Actualizando…
          </span>
        ) : null}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filtros</DialogTitle>
            <DialogDescription>
              El servicio aplica un filtro a la vez. Al elegir uno nuevo, se
              reemplaza el anterior.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="invoice-filter-type">Filtrar por</Label>
              <Select
                items={INVOICE_FILTER_OPTIONS}
                value={draft.type}
                onValueChange={(value) =>
                  updateDraft({ type: value as InvoiceFilterType })
                }
              >
                <SelectTrigger id="invoice-filter-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVOICE_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {draft.type === "query" ? (
              <Field
                label="Cliente"
                id="filter-query"
                value={draft.value}
                onChange={(value) => updateDraft({ value })}
                placeholder="Ej. Pérez"
              />
            ) : null}

            {draft.type === "student" ? (
              <Field
                label="ID de alumno"
                id="filter-student"
                value={draft.value}
                onChange={(value) =>
                  updateDraft({ value: value.replace(/\D/g, "") })
                }
                placeholder="Ej. 12"
                inputMode="numeric"
              />
            ) : null}

            {draft.type === "invoiceNumber" ? (
              <Field
                label="Número de factura"
                id="filter-invoice-number"
                value={draft.value}
                onChange={(value) =>
                  updateDraft({ value: formatInvoiceNumberInput(value) })
                }
                placeholder="001-001-0000123"
                inputMode="numeric"
              />
            ) : null}

            {draft.type === "stampNumber" ? (
              <Field
                label="Timbrado"
                id="filter-stamp-number"
                value={draft.value}
                onChange={(value) => updateDraft({ value })}
                placeholder="Ej. 12345678"
              />
            ) : null}

            {draft.type === "customerRuc" ? (
              <Field
                label="RUC"
                id="filter-customer-ruc"
                value={draft.value}
                onChange={(value) => updateDraft({ value })}
                placeholder="Ej. 80012345-6"
                inputMode="numeric"
              />
            ) : null}

            {draft.type === "date" ? (
              <div className="grid gap-1.5">
                <Label htmlFor="filter-date">Fecha de emisión</Label>
                <Input
                  id="filter-date"
                  type="date"
                  value={draft.value}
                  onChange={(event) => updateDraft({ value: event.target.value })}
                />
              </div>
            ) : null}

            {draft.type === "dateRange" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="filter-from">Desde</Label>
                  <Input
                    id="filter-from"
                    type="date"
                    value={draft.from}
                    onChange={(event) =>
                      updateDraft({ from: event.target.value })
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="filter-to">Hasta</Label>
                  <Input
                    id="filter-to"
                    type="date"
                    value={draft.to}
                    onChange={(event) => updateDraft({ to: event.target.value })}
                  />
                </div>
              </div>
            ) : null}

            {draft.type === "amountRange" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="filter-min">Total mínimo</Label>
                  <Input
                    id="filter-min"
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft.min}
                    onChange={(event) =>
                      updateDraft({ min: event.target.value })
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="filter-max">Total máximo</Label>
                  <Input
                    id="filter-max"
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft.max}
                    onChange={(event) =>
                      updateDraft({ max: event.target.value })
                    }
                  />
                </div>
              </div>
            ) : null}

            {draft.type === "saleCondition" ? (
              <div className="grid gap-1.5">
                <Label htmlFor="filter-condition">Condición de venta</Label>
                <Select
                  items={SALE_CONDITION_OPTIONS}
                  value={draft.condition}
                  onValueChange={(value) =>
                    updateDraft({ condition: value as SaleCondition })
                  }
                >
                  <SelectTrigger id="filter-condition" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SALE_CONDITION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {draftError ? (
              <p role="alert" className="text-sm text-destructive">
                {draftError}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={applyFilters}>Aplicar filtro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: "numeric" | "decimal";
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
      />
    </div>
  );
}
