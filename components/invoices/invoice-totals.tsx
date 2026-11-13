import { formatCurrency, lineVat, roundCurrency } from "@/lib/invoices/format";
import type { InvoiceLine } from "@/lib/invoices/types";
import { cn } from "@/lib/utils";

type TotalsLine = Pick<InvoiceLine, "amount" | "vatRate">;

function sumByRate(lines: TotalsLine[], rate: number): number {
  return roundCurrency(
    lines
      .filter((line) => line.vatRate === rate)
      .reduce((sum, line) => sum + line.amount, 0),
  );
}

export function InvoiceTotals({
  lines,
  className,
}: {
  lines: TotalsLine[];
  className?: string;
}) {
  const subtotal = roundCurrency(
    lines.reduce((sum, line) => sum + line.amount, 0),
  );
  const vat = roundCurrency(
    lines.reduce((sum, line) => sum + lineVat(line), 0),
  );
  const total = roundCurrency(subtotal + vat);
  const taxable10 = sumByRate(lines, 10);
  const taxable5 = sumByRate(lines, 5);
  const exempt = sumByRate(lines, 0);
  const otherRates = roundCurrency(
    lines
      .filter((line) => ![10, 5, 0].includes(line.vatRate))
      .reduce((sum, line) => sum + line.amount, 0),
  );

  return (
    <dl className={cn("flex flex-col gap-1 text-sm", className)}>
      <TotalRow label="Subtotal" value={subtotal} />
      {taxable10 > 0 ? <TotalRow label="Gravado IVA 10%" value={taxable10} /> : null}
      {taxable5 > 0 ? <TotalRow label="Gravado IVA 5%" value={taxable5} /> : null}
      {exempt > 0 ? <TotalRow label="Exento" value={exempt} /> : null}
      {otherRates > 0 ? (
        <TotalRow label="Otras tasas" value={otherRates} />
      ) : null}
      <TotalRow label="IVA" value={vat} />
      <div className="mt-1 flex items-baseline justify-between gap-6 border-t border-border pt-2">
        <dt className="text-sm font-semibold tracking-wide uppercase">Total</dt>
        <dd className="text-base font-semibold tabular-nums">
          {formatCurrency(total)}
        </dd>
      </div>
    </dl>
  );
}

function TotalRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{formatCurrency(value)}</dd>
    </div>
  );
}
