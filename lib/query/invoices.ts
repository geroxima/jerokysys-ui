"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  changeInvoiceStatus,
  createInvoiceFromForm,
  deleteInvoice,
  getInvoice,
  getInvoiceStats,
  getValidTaxStamps,
  listInvoices,
  updateInvoiceFromForm,
} from "@/lib/invoices/api";
import type {
  InvoiceQuery,
  InvoiceStatus,
  IssuerInfo,
  ParsedInvoice,
} from "@/lib/invoices/types";

export const invoiceKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoiceKeys.all, "list"] as const,
  list: (query: InvoiceQuery) => [...invoiceKeys.lists(), query] as const,
  details: () => [...invoiceKeys.all, "detail"] as const,
  detail: (id: number) => [...invoiceKeys.details(), id] as const,
  stats: () => [...invoiceKeys.all, "stats"] as const,
  taxStamps: () => [...invoiceKeys.all, "tax-stamps"] as const,
};

export function useInvoices(query: InvoiceQuery) {
  return useQuery({
    queryKey: invoiceKeys.list(query),
    queryFn: () => listInvoices(query),
    placeholderData: keepPreviousData,
  });
}

export function useInvoice(id: number | null) {
  return useQuery({
    queryKey: invoiceKeys.detail(id ?? 0),
    queryFn: () => getInvoice(id as number),
    enabled: id != null && Number.isInteger(id) && id > 0,
  });
}

export function useInvoiceStats() {
  return useQuery({
    queryKey: invoiceKeys.stats(),
    queryFn: getInvoiceStats,
    staleTime: 30_000,
  });
}

export function useValidTaxStamps() {
  return useQuery({
    queryKey: invoiceKeys.taxStamps(),
    queryFn: getValidTaxStamps,
    staleTime: 60_000,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      issuer,
    }: {
      data: ParsedInvoice;
      issuer: IssuerInfo;
    }) => createInvoiceFromForm(data, issuer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      issuer,
    }: {
      id: number;
      data: ParsedInvoice;
      issuer: IssuerInfo;
    }) => updateInvoiceFromForm(id, data, issuer),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      if (invoice.id != null) {
        queryClient.invalidateQueries({
          queryKey: invoiceKeys.detail(invoice.id),
        });
      }
    },
  });
}

export function useChangeInvoiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: Extract<InvoiceStatus, "PAID" | "CANCELLED">;
    }) => changeInvoiceStatus(id, status),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      if (invoice.id != null) {
        queryClient.invalidateQueries({
          queryKey: invoiceKeys.detail(invoice.id),
        });
      }
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}
