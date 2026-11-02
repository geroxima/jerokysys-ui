import { Badge } from "@/components/ui/badge";
import { INVOICE_STATUS_LABELS } from "@/lib/invoices/labels";
import type { InvoiceStatus } from "@/lib/invoices/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-rose-200 bg-rose-50 text-rose-700",
};

export function InvoiceStatusBadge({
  status,
  className,
}: {
  status: InvoiceStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("border", STATUS_STYLES[status], className)}
    >
      {INVOICE_STATUS_LABELS[status]}
    </Badge>
  );
}
