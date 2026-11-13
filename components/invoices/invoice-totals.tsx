import { formatCurrency } from "@/lib/invoices/format";
import type { InvoiceTotalsData } from "@/lib/invoices/types";
import { cn } from "@/lib/utils";

export function InvoiceTotals({
  totals,
  className,
}: {
  totals: InvoiceTotalsData;
  className?: string;
}) {
  return (
    <dl className={cn("flex flex-col gap-1 text-sm", className)}>
      <TotalRow label="Exentas" value={totals.exemptAmount} />
      <TotalRow label="Ventas 5%" value={totals.sales5Amount} />
      <TotalRow label="Ventas 10%" value={totals.sales10Amount} />
      <TotalRow label="IVA 5%" value={totals.iva5Amount} />
      <TotalRow label="IVA 10%" value={totals.iva10Amount} />
      <TotalRow
        label="Total IVA"
        value={totals.totalIva}
        className="border-t border-border pt-1"
      />
      <div className="mt-1 flex items-baseline justify-between gap-6 border-t border-border pt-2">
        <dt className="text-sm font-semibold tracking-wide uppercase">Total</dt>
        <dd className="text-base font-semibold tabular-nums">
          {formatCurrency(totals.totalAmount)}
        </dd>
      </div>
    </dl>
  );
}

function TotalRow({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-6", className)}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{formatCurrency(value)}</dd>
    </div>
  );
}
