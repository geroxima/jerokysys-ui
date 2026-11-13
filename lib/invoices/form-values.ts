import { stripConceptToken } from "./format";
import { emptyLineValues } from "./validation";
import type { Invoice, InvoiceFormValues } from "./types";

export function invoiceToFormValues(invoice: Invoice): InvoiceFormValues {
  return {
    studentId: invoice.studentId != null ? String(invoice.studentId) : "",
    taxStampId: String(invoice.taxStampId),
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate ?? "",
    saleCondition: invoice.saleCondition,
    customerName: invoice.customerName,
    customerRuc: invoice.customerRuc,
    customerAddress: invoice.customerAddress ?? "",
    details:
      invoice.details.length > 0
        ? invoice.details.map((line) => ({
            conceptType: line.conceptType ?? "OTRO",
            conceptId: line.conceptId != null ? String(line.conceptId) : "",
            description: stripConceptToken(line.description) || line.description,
            quantity: String(line.quantity),
            unitPrice: String(line.unitPrice),
            vatType: line.vatType,
            correspondingMonth: line.correspondingMonth ?? "",
          }))
        : [emptyLineValues()],
  };
}
