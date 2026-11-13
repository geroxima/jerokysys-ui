import { parseAmountInput, parseIsoDate } from "./format";
import { SALE_CONDITIONS, VAT_RATES } from "./types";
import type {
  FieldErrors,
  InvoiceFormValues,
  InvoiceLineValues,
  ParsedInvoice,
  SaleCondition,
} from "./types";

const MAX_LENGTHS = {
  taxId: 20,
  businessName: 150,
  description: 255,
} as const;

export function emptyLineValues(): InvoiceLineValues {
  return {
    description: "",
    amount: "",
    vatRate: 10,
    correspondingMonth: "",
  };
}

export function emptyInvoiceFormValues(
  issueDate: string,
  timbrado: string,
  serie: string,
): InvoiceFormValues {
  return {
    studentId: "",
    timbrado,
    serie,
    taxId: "",
    businessName: "",
    issueDate,
    saleCondition: "CONTADO",
    details: [emptyLineValues()],
  };
}

export type ValidationResult =
  | { valid: true; data: ParsedInvoice }
  | { valid: false; errors: FieldErrors };

export function validateInvoiceForm(values: InvoiceFormValues): ValidationResult {
  const errors: FieldErrors = {};

  const studentId = Number(values.studentId.trim());
  if (!values.studentId.trim()) {
    errors.studentId = "Ingresá el ID del alumno.";
  } else if (!Number.isInteger(studentId) || studentId <= 0) {
    errors.studentId = "El ID del alumno debe ser un número entero positivo.";
  }

  const timbrado = values.timbrado.trim();
  if (!/^\d{3}$/.test(timbrado)) {
    errors.timbrado = "Elegí un timbrado habilitado.";
  }

  const serie = values.serie.trim();
  if (!/^\d{3}$/.test(serie)) {
    errors.serie = "La serie debe tener tres dígitos.";
  }

  const taxId = values.taxId.trim();
  if (!taxId) {
    errors.taxId = "Ingresá el RUC del cliente.";
  } else if (taxId.length > MAX_LENGTHS.taxId) {
    errors.taxId = `El RUC admite hasta ${MAX_LENGTHS.taxId} caracteres.`;
  }

  const businessName = values.businessName.trim();
  if (!businessName) {
    errors.businessName = "Ingresá la razón social.";
  } else if (businessName.length > MAX_LENGTHS.businessName) {
    errors.businessName = `La razón social admite hasta ${MAX_LENGTHS.businessName} caracteres.`;
  }

  if (!values.issueDate) {
    errors.issueDate = "Elegí la fecha de emisión.";
  } else if (!parseIsoDate(values.issueDate)) {
    errors.issueDate = "La fecha de emisión no es válida.";
  }

  const saleCondition = values.saleCondition;
  if (!SALE_CONDITIONS.includes(saleCondition)) {
    errors.saleCondition = "Elegí una condición de venta.";
  }

  if (values.details.length === 0) {
    errors.details = "Agregá al menos una línea de detalle.";
  }

  const details: ParsedInvoice["details"] = [];

  values.details.forEach((line, index) => {
    const prefix = `details.${index}`;
    const description = line.description.trim();

    if (!description) {
      errors[`${prefix}.description`] = "Ingresá el concepto.";
    } else if (description.length > MAX_LENGTHS.description) {
      errors[`${prefix}.description`] =
        `El concepto admite hasta ${MAX_LENGTHS.description} caracteres.`;
    }

    const amount = parseAmountInput(line.amount);
    if (amount === null) {
      errors[`${prefix}.amount`] = "Ingresá un monto válido.";
    } else if (amount < 0) {
      errors[`${prefix}.amount`] = "El monto no puede ser negativo.";
    }

    if (!VAT_RATES.includes(line.vatRate as (typeof VAT_RATES)[number])) {
      errors[`${prefix}.vatRate`] = "Elegí una tasa de IVA válida.";
    }

    const month = line.correspondingMonth.trim();
    if (month && !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      errors[`${prefix}.correspondingMonth`] = "Usá el formato AAAA-MM.";
    }

    if (
      !errors[`${prefix}.description`] &&
      !errors[`${prefix}.amount`] &&
      !errors[`${prefix}.vatRate`]
    ) {
      details.push({
        description,
        amount: amount ?? 0,
        vatRate: line.vatRate,
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
      timbrado,
      serie,
      taxId,
      businessName,
      issueDate: values.issueDate,
      saleCondition: saleCondition as SaleCondition,
      details,
    },
  };
}
