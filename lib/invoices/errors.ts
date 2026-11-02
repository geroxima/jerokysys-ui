export class InvoiceApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "InvoiceApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * El backend responde en inglés y con mensajes técnicos. Traducimos los casos
 * conocidos y dejamos un mensaje accionable para el resto.
 */
const MESSAGE_TRANSLATIONS: Array<[RegExp, string]> = [
  [
    /invoiceNumber must match/i,
    "El número de factura debe tener el formato 001-001-0000123.",
  ],
  [/invoiceNumber already used/i, "Ese número de factura ya está registrado."],
  [
    /at least one detail line/i,
    "Agregá al menos una línea de detalle a la factura.",
  ],
  [
    /only pending invoices change status/i,
    "Solo las facturas pendientes pueden cambiar de estado.",
  ],
  [
    /student not found/i,
    "No existe un alumno con el ID indicado.",
  ],
  [/invoice not found|entity not found/i, "No se encontró la factura."],
  [
    /studentid is required/i,
    "El ID del alumno es obligatorio.",
  ],
  [
    /invalid status/i,
    "El estado indicado no es válido.",
  ],
  [
    /invalid salecondition/i,
    "La condición de venta indicada no es válida.",
  ],
  [
    /could not execute statement|data integrity/i,
    "Los datos entran en conflicto con la facturación existente.",
  ],
  [
    /no pudo conectar/i,
    "No se pudo conectar con el servidor de facturación. Verificá que la API esté en línea.",
  ],
];

export function translateInvoiceError(message?: string | null): string {
  const raw = message?.trim();

  if (!raw) {
    return "No se pudo completar la operación. Intentá de nuevo.";
  }

  for (const [pattern, translation] of MESSAGE_TRANSLATIONS) {
    if (pattern.test(raw)) {
      return translation;
    }
  }

  // Los mensajes de validación de campos llegan como "campo: detalle".
  if (/^[a-zA-Z]+: /.test(raw)) {
    return `Revisá los datos: ${raw}`;
  }

  return raw;
}

/** El backend rechaza números repetidos con HTTP 409 y código CONFLICT. */
export function isDuplicateInvoiceNumber(error: unknown): boolean {
  return (
    error instanceof InvoiceApiError &&
    (error.status === 409 ||
      error.code === "CONFLICT" ||
      /invoiceNumber already used/i.test(error.message))
  );
}
