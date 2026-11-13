import type { InvoiceTimbrado, IssuerInfo } from "./types";

const DEFAULT_TIMBRADO = "001";
const DEFAULT_SERIE = "001";

function readIssuer(): IssuerInfo {
  return {
    name: process.env.NEXT_PUBLIC_ISSUER_NAME?.trim() || "JerokySys",
    ruc: process.env.NEXT_PUBLIC_ISSUER_RUC?.trim() || "",
    address: process.env.NEXT_PUBLIC_ISSUER_ADDRESS?.trim() || "",
    phone: process.env.NEXT_PUBLIC_ISSUER_PHONE?.trim() || "",
    email: process.env.NEXT_PUBLIC_ISSUER_EMAIL?.trim() || "",
    activity: process.env.NEXT_PUBLIC_ISSUER_ACTIVITY?.trim() || "",
  };
}

function normalizeTimbrado(raw: unknown): InvoiceTimbrado | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const timbrado = String(record.timbrado ?? "").trim();
  const serie = String(record.serie ?? "").trim();

  if (!/^\d{3}$/.test(timbrado) || !/^\d{3}$/.test(serie)) {
    return null;
  }

  return {
    timbrado,
    serie,
    label: String(record.label ?? "").trim() || `Timbrado ${timbrado}`,
    address: String(record.address ?? "").trim(),
    key: `${timbrado}-${serie}`,
  };
}

function readTimbrados(): InvoiceTimbrado[] {
  const raw = process.env.NEXT_PUBLIC_INVOICE_TIMBRADOS?.trim();

  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const seen = new Set<string>();
        const timbrados = parsed
          .map(normalizeTimbrado)
          .filter((item): item is InvoiceTimbrado => item !== null)
          .filter((item) => {
            if (seen.has(item.key)) {
              return false;
            }
            seen.add(item.key);
            return true;
          });

        if (timbrados.length > 0) {
          return timbrados;
        }
      }
    } catch {
      console.warn(
        "NEXT_PUBLIC_INVOICE_TIMBRADOS no es un JSON válido. Se usa el timbrado 001-001.",
      );
    }
  }

  return [
    {
      timbrado: DEFAULT_TIMBRADO,
      serie: DEFAULT_SERIE,
      label: "Principal",
      address: "",
      key: `${DEFAULT_TIMBRADO}-${DEFAULT_SERIE}`,
    },
  ];
}

export function getIssuerConfig(): {
  issuer: IssuerInfo;
  timbrados: InvoiceTimbrado[];
} {
  return {
    issuer: readIssuer(),
    timbrados: readTimbrados(),
  };
}

export function isIssuerConfigured(issuer: IssuerInfo): boolean {
  return Boolean(issuer.ruc && issuer.address);
}

export function resolveIssuerAddress(
  issuer: IssuerInfo,
  timbrado: InvoiceTimbrado | null,
): string {
  return timbrado?.address || issuer.address;
}
