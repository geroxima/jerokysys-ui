/** El backend acepta ADMIN y SECRETARY para leer y escribir facturas. */
export function canAccessInvoices(role: string | null | undefined): boolean {
  const normalized = (role ?? "").replace(/^ROLE_/i, "").toUpperCase();
  return normalized === "ADMIN" || normalized === "SECRETARY";
}
