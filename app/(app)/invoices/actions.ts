"use server";

import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth";
import {
  changeInvoiceStatus,
  createInvoice,
  deleteInvoice,
  getInvoice,
  getNextInvoiceNumber,
  isForbidden,
  isUnauthorized,
  updateInvoice,
} from "@/lib/invoices/api";
import {
  InvoiceApiError,
  isDuplicateInvoiceNumber,
  translateInvoiceError,
} from "@/lib/invoices/errors";
import { buildInvoicePayload } from "@/lib/invoices/payload";
import { canAccessInvoices } from "@/lib/invoices/permissions";
import { validateInvoiceForm } from "@/lib/invoices/validation";
import type {
  InvoiceActionResult,
  InvoiceFormValues,
  InvoiceStatus,
  ParsedInvoice,
} from "@/lib/invoices/types";

const NO_PERMISSION =
  "No tenés permisos para administrar facturas. Pedile acceso a un administrador.";

function failure(error: unknown): InvoiceActionResult {
  if (isUnauthorized(error)) {
    redirect("/login");
  }

  if (isForbidden(error)) {
    return { ok: false, message: NO_PERMISSION };
  }

  if (error instanceof InvoiceApiError) {
    return { ok: false, message: translateInvoiceError(error.message) };
  }

  return {
    ok: false,
    message: "Ocurrió un error inesperado. Intentá de nuevo.",
  };
}

async function requireInvoiceManager() {
  const session = await requireSession();

  if (!canAccessInvoices(session.role)) {
    return null;
  }

  return session;
}

export async function createInvoiceAction(
  values: InvoiceFormValues,
): Promise<InvoiceActionResult> {
  const session = await requireInvoiceManager();

  if (!session) {
    return { ok: false, message: NO_PERMISSION };
  }

  const parsed = validateInvoiceForm(values);
  if (!parsed.valid) {
    return {
      ok: false,
      message: "Revisá los campos marcados.",
      fieldErrors: parsed.errors,
    };
  }

  const data: ParsedInvoice = parsed.data;
  let invoiceId: number | null = null;

  // El preview del cliente puede quedar viejo; regeneramos y reintentamos una
  // vez si el backend rechaza el número por duplicado.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const invoiceNumber = await getNextInvoiceNumber(
        data.timbrado,
        data.serie,
      );
      const created = await createInvoice(
        buildInvoicePayload(data, 0, invoiceNumber),
      );
      invoiceId = created.id;
      break;
    } catch (error) {
      if (attempt === 0 && isDuplicateInvoiceNumber(error)) {
        continue;
      }
      return failure(error);
    }
  }

  if (invoiceId === null) {
    return {
      ok: false,
      message:
        "No se pudo asignar un número de factura libre. Intentá de nuevo en unos segundos.",
    };
  }

  redirect(`/invoices/${invoiceId}`);
}

export async function updateInvoiceAction(
  id: number,
  values: InvoiceFormValues,
): Promise<InvoiceActionResult> {
  const session = await requireInvoiceManager();

  if (!session) {
    return { ok: false, message: NO_PERMISSION };
  }

  const parsed = validateInvoiceForm(values);
  if (!parsed.valid) {
    return {
      ok: false,
      message: "Revisá los campos marcados.",
      fieldErrors: parsed.errors,
    };
  }

  try {
    // El número y el timbrado son inmutables: se reutilizan los de la factura
    // existente, nunca los que manda el cliente.
    const current = await getInvoice(id);

    if (current.paymentStatus !== "PENDING") {
      return {
        ok: false,
        message: "Solo las facturas pendientes admiten cambios.",
      };
    }

    await updateInvoice(
      id,
      buildInvoicePayload(
        {
          ...parsed.data,
          timbrado: current.timbrado,
          serie: parsed.data.serie,
        },
        id,
        current.invoiceNumber,
      ),
    );
  } catch (error) {
    return failure(error);
  }

  redirect(`/invoices/${id}`);
}

export async function changeInvoiceStatusAction(
  id: number,
  status: Extract<InvoiceStatus, "PAID" | "CANCELLED">,
): Promise<InvoiceActionResult> {
  const session = await requireInvoiceManager();

  if (!session) {
    return { ok: false, message: NO_PERMISSION };
  }

  try {
    await changeInvoiceStatus(id, status);
  } catch (error) {
    return failure(error);
  }

  return { ok: true };
}

export async function deleteInvoiceAction(
  id: number,
): Promise<InvoiceActionResult> {
  const session = await requireInvoiceManager();

  if (!session) {
    return { ok: false, message: NO_PERMISSION };
  }

  try {
    await deleteInvoice(id);
  } catch (error) {
    return failure(error);
  }

  redirect("/invoices");
}
