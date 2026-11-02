import { parseInvoiceNumber } from "./numbering";
import type { Invoice, InvoiceFormValues } from "./types";

export function invoiceToFormValues(invoice: Invoice): InvoiceFormValues {
  const parsed = parseInvoiceNumber(invoice.invoiceNumber);

  return {
    studentId: String(invoice.studentId),
    timbrado: invoice.timbrado,
    serie: parsed?.serie ?? "001",
    taxId: invoice.taxId,
    businessName: invoice.businessName,
    issueDate: invoice.issueDate,
    saleCondition: invoice.saleCondition,
    details:
      invoice.details.length > 0
        ? invoice.details.map((line) => ({
            description: line.description,
            amount: String(line.amount),
            vatRate: line.vatRate,
            correspondingMonth: line.correspondingMonth ?? "",
          }))
        : [
            {
              description: "",
              amount: "",
              vatRate: 10,
              correspondingMonth: "",
            },
          ],
  };
}
