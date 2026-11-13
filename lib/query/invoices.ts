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
  getNextInvoiceNumber,
  listInvoices,
  updateInvoiceFromForm,
} from "@/lib/invoices/api";
import type {
  InvoiceQuery,
  InvoiceStatus,
  InvoiceTimbrado,
  ParsedInvoice,
} from "@/lib/invoices/types";

export const invoiceKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoiceKeys.all, "list"] as const,
  list: (query: InvoiceQuery) => [...invoiceKeys.lists(), query] as const,
  details: () => [...invoiceKeys.all, "detail"] as const,
  detail: (id: number) => [...invoiceKeys.details(), id] as const,
  stats: () => [...invoiceKeys.all, "stats"] as const,
  nextNumbers: (keys: string[]) =>
    [...invoiceKeys.all, "next-numbers", keys] as const,
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

export function useNextInvoiceNumbers(timbrados: InvoiceTimbrado[]) {
  const keys = timbrados.map((option) => option.key);

  return useQuery({
    queryKey: invoiceKeys.nextNumbers(keys),
    queryFn: async () => {
      const entries = await Promise.all(
        timbrados.map(async (option) => {
          try {
            const number = await getNextInvoiceNumber(
              option.timbrado,
              option.serie,
            );
            return [option.key, number] as const;
          } catch {
            return null;
          }
        }),
      );

      return Object.fromEntries(
        entries.filter(
          (entry): entry is readonly [string, string] => entry !== null,
        ),
      );
    },
    staleTime: 15_000,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ParsedInvoice) => createInvoiceFromForm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ParsedInvoice }) =>
      updateInvoiceFromForm(id, data),
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
