import type { IssuerInfo } from "./types";

export function getIssuerConfig(): IssuerInfo {
  return {
    name: process.env.NEXT_PUBLIC_ISSUER_NAME?.trim() || "JerokySys",
    ruc: process.env.NEXT_PUBLIC_ISSUER_RUC?.trim() || "",
    address: process.env.NEXT_PUBLIC_ISSUER_ADDRESS?.trim() || "",
    phone: process.env.NEXT_PUBLIC_ISSUER_PHONE?.trim() || "",
    email: process.env.NEXT_PUBLIC_ISSUER_EMAIL?.trim() || "",
    activity: process.env.NEXT_PUBLIC_ISSUER_ACTIVITY?.trim() || "",
  };
}

export function isIssuerConfigured(issuer: IssuerInfo): boolean {
  return Boolean(issuer.ruc && issuer.address && issuer.activity);
}
