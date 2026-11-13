import { roundCurrency } from "./format";
import type { InvoicePayload, ParsedInvoice } from "./types";

/**
 * El DTO de detalle exige `invoiceId` por validación de beans, aunque el mapper
 * del backend lo ignora (la relación se arma desde la cabecera). Por eso al crear
 * mandamos 0 y al editar el id real. Ver InvoiceDetailDTO.invoiceId en commons.
 */
export function buildInvoicePayload(
  data: ParsedInvoice,
  invoiceId: number,
  invoiceNumber: string,
): InvoicePayload {
  const subtotal = roundCurrency(
    data.details.reduce((sum, line) => sum + line.amount, 0),
  );

  return {
    studentId: data.studentId,
    timbrado: data.timbrado,
    invoiceNumber,
    taxId: data.taxId,
    businessName: data.businessName,
    issueDate: data.issueDate,
    saleCondition: data.saleCondition,
    // El backend lo recalcula; el DTO lo exige como no nulo.
    totalAmount: subtotal,
    details: data.details.map((line) => ({
      invoiceId,
      description: line.description,
      amount: line.amount,
      vatRate: line.vatRate,
      correspondingMonth: line.correspondingMonth,
    })),
  };
}
