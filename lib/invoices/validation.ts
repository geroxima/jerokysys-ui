import { parseAmountInput, parseIsoDate } from "./format";
import {
  CONCEPT_TYPES,
  SALE_CONDITIONS,
  VAT_TYPES,
} from "./types";
import type {
  FieldErrors,
  InvoiceConceptType,
  InvoiceFormValues,
  InvoiceLineValues,
  ParsedInvoice,
  SaleCondition,
  VatType,
} from "./types";

const MAX_LENGTHS = {
  customerRuc: 20,
  customerName: 150,
  customerAddress: 255,
  description: 255,
} as const;

export function emptyLineValues(): InvoiceLineValues {
  return {
    conceptType: "MATRICULA",
    conceptId: "",
    description: "",
    quantity: "1",
    unitPrice: "",
    vatType: "GRAVADA_10",
    correspondingMonth: "",
  };
}

export function emptyInvoiceFormValues(
  issueDate: string,
  taxStampId: string,
): InvoiceFormValues {
  return {
    studentId: "",
    taxStampId,
    issueDate,
    dueDate: "",
    saleCondition: "CONTADO",
    customerName: "",
    customerRuc: "",
    customerAddress: "",
    details: [emptyLineValues()],
  };
}

export type ValidationResult =
  | { valid: true; data: ParsedInvoice }
  | { valid: false; errors: FieldErrors };

function isVatType(value: string): value is VatType {
  return VAT_TYPES.includes(value as VatType);
}

function isConceptType(value: string): value is InvoiceConceptType {
  return CONCEPT_TYPES.includes(value as InvoiceConceptType);
}

export function validateInvoiceForm(values: InvoiceFormValues): ValidationResult {
  const errors: FieldErrors = {};

  const studentId = Number(values.studentId.trim());
  if (!values.studentId.trim()) {
    errors.studentId = "Elegí un alumno.";
  } else if (!Number.isInteger(studentId) || studentId <= 0) {
    errors.studentId = "El alumno seleccionado no es válido.";
  }

  const taxStampId = Number(values.taxStampId.trim());
  if (!values.taxStampId.trim()) {
    errors.taxStampId = "Elegí un timbrado.";
  } else if (!Number.isInteger(taxStampId) || taxStampId <= 0) {
    errors.taxStampId = "El timbrado seleccionado no es válido.";
  }

  if (!values.issueDate) {
    errors.issueDate = "Elegí la fecha de emisión.";
  } else if (!parseIsoDate(values.issueDate)) {
    errors.issueDate = "La fecha de emisión no es válida.";
  }

  if (values.dueDate) {
    if (!parseIsoDate(values.dueDate)) {
      errors.dueDate = "El vencimiento no es válido.";
    } else if (values.issueDate && values.dueDate < values.issueDate) {
      errors.dueDate = "El vencimiento no puede ser anterior a la emisión.";
    }
  }

  const customerName = values.customerName.trim();
  if (!customerName) {
    errors.customerName = "Ingresá el nombre o razón social del cliente.";
  } else if (customerName.length > MAX_LENGTHS.customerName) {
    errors.customerName = `El nombre admite hasta ${MAX_LENGTHS.customerName} caracteres.`;
  }

  const customerRuc = values.customerRuc.trim();
  if (!customerRuc) {
    errors.customerRuc = "Ingresá el RUC del cliente.";
  } else if (customerRuc.length > MAX_LENGTHS.customerRuc) {
    errors.customerRuc = `El RUC admite hasta ${MAX_LENGTHS.customerRuc} caracteres.`;
  }

  const customerAddress = values.customerAddress.trim();
  if (customerAddress.length > MAX_LENGTHS.customerAddress) {
    errors.customerAddress = `La dirección admite hasta ${MAX_LENGTHS.customerAddress} caracteres.`;
  }

  const saleCondition = values.saleCondition;
  if (!SALE_CONDITIONS.includes(saleCondition)) {
    errors.saleCondition = "Elegí una condición de venta.";
  }

  if (values.details.length === 0) {
    errors.details = "Agregá al menos un concepto.";
  }

  const details: ParsedInvoice["details"] = [];

  values.details.forEach((line, index) => {
    const prefix = `details.${index}`;
    const description = line.description.trim();

    if (!description) {
      errors[`${prefix}.description`] = "Ingresá la descripción.";
    } else if (description.length > MAX_LENGTHS.description) {
      errors[`${prefix}.description`] =
        `La descripción admite hasta ${MAX_LENGTHS.description} caracteres.`;
    }

    const quantity = parseAmountInput(line.quantity);
    if (quantity === null) {
      errors[`${prefix}.quantity`] = "Ingresá una cantidad válida.";
    } else if (quantity <= 0) {
      errors[`${prefix}.quantity`] = "La cantidad debe ser mayor que cero.";
    }

    const unitPrice = parseAmountInput(line.unitPrice);
    if (unitPrice === null) {
      errors[`${prefix}.unitPrice`] = "Ingresá un precio unitario válido.";
    } else if (unitPrice < 0) {
      errors[`${prefix}.unitPrice`] = "El precio no puede ser negativo.";
    }

    if (!isVatType(line.vatType)) {
      errors[`${prefix}.vatType`] = "Elegí un tratamiento de IVA válido.";
    }

    if (!isConceptType(line.conceptType)) {
      errors[`${prefix}.conceptType`] = "Elegí un concepto válido.";
    }

    const month = line.correspondingMonth.trim();
    if (month && !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      errors[`${prefix}.correspondingMonth`] = "Usá el formato AAAA-MM.";
    }

    let conceptId: number | null = null;
    if (line.conceptId.trim()) {
      const parsed = Number(line.conceptId);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        errors[`${prefix}.conceptId`] = "La inscripción seleccionada no es válida.";
      } else {
        conceptId = parsed;
      }
    }

    if (line.conceptType === "CUOTA") {
      if (conceptId === null) {
        errors[`${prefix}.conceptId`] = "Elegí la inscripción de la cuota.";
      }
      if (!month) {
        errors[`${prefix}.correspondingMonth`] = "Elegí el mes de la cuota.";
      }
    }

    if (
      !errors[`${prefix}.description`] &&
      !errors[`${prefix}.quantity`] &&
      !errors[`${prefix}.unitPrice`] &&
      !errors[`${prefix}.vatType`] &&
      !errors[`${prefix}.conceptType`] &&
      !errors[`${prefix}.conceptId`] &&
      !errors[`${prefix}.correspondingMonth`]
    ) {
      details.push({
        conceptType: line.conceptType,
        conceptId,
        description,
        quantity: quantity ?? 0,
        unitPrice: unitPrice ?? 0,
        vatType: line.vatType,
        correspondingMonth: month || null,
      });
    }
  });

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      studentId,
      taxStampId,
      issueDate: values.issueDate,
      dueDate: values.dueDate || null,
      saleCondition: saleCondition as SaleCondition,
      customerName,
      customerRuc,
      customerAddress: customerAddress || null,
      details,
    },
  };
}
