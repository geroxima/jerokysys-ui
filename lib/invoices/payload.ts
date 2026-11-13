import type { InvoicePayload, IssuerInfo, ParsedInvoice } from "./types";

export function buildInvoicePayload(
  data: ParsedInvoice,
  issuer: IssuerInfo,
): InvoicePayload {
  return {
    studentId: data.studentId,
    taxStampId: data.taxStampId,
    issueDate: data.issueDate,
    dueDate: data.dueDate,
    saleCondition: data.saleCondition,
    customerName: data.customerName,
    customerRuc: data.customerRuc,
    customerAddress: data.customerAddress,
    issuerName: issuer.name,
    issuerRuc: issuer.ruc,
    issuerActivity: issuer.activity,
    issuerPhone: issuer.phone || null,
    issuerAddress: issuer.address,
    issuerEmail: issuer.email || null,
    details: data.details.map((line) => ({
      description: line.description,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      vatType: line.vatType,
      conceptType: line.conceptType,
      conceptId: line.conceptId,
      correspondingMonth: line.correspondingMonth,
    })),
  };
}
