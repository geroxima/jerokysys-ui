import Link from "next/link";
import { Ban, CircleCheck, Clock, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/invoices/format";
import type { InvoiceStats } from "@/lib/invoices/types";
import { cn } from "@/lib/utils";

type SummaryCardProps = {
  label: string;
  amount: number;
  count: number;
  href: string;
  icon: typeof Wallet;
  tone: string;
};

function SummaryCard({
  label,
  amount,
  count,
  href,
  icon: Icon,
  tone,
}: SummaryCardProps) {
  return (
    <Link href={href} className="group rounded-xl focus-visible:outline-none">
      <Card
        size="sm"
        className="h-full transition-colors group-hover:ring-primary/30 group-focus-visible:ring-3 group-focus-visible:ring-ring/50"
      >
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-md",
                tone,
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>
          </div>
          <CardTitle className="text-xl tabular-nums">
            {formatCurrency(amount)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {count} {count === 1 ? "factura" : "facturas"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function InvoiceSummaryCards({ stats }: { stats: InvoiceStats }) {
  return (
    <section aria-label="Resumen de facturación">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total facturado"
          amount={stats.all.total}
          count={stats.all.count}
          href="/invoices"
          icon={Wallet}
          tone="bg-brand-surface/60 text-brand-accent"
        />
        <SummaryCard
          label="Pendientes"
          amount={stats.pending.total}
          count={stats.pending.count}
          href="/invoices?status=PENDING"
          icon={Clock}
          tone="bg-amber-50 text-amber-700"
        />
        <SummaryCard
          label="Pagadas"
          amount={stats.paid.total}
          count={stats.paid.count}
          href="/invoices?status=PAID"
          icon={CircleCheck}
          tone="bg-emerald-50 text-emerald-700"
        />
        <SummaryCard
          label="Anuladas"
          amount={stats.cancelled.total}
          count={stats.cancelled.count}
          href="/invoices?status=CANCELLED"
          icon={Ban}
          tone="bg-rose-50 text-rose-700"
        />
      </div>
    </section>
  );
}
