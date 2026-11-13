import type { ReactNode } from "react";
import { FileText } from "lucide-react";

export function InvoiceEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground ring-1 ring-border">
        <FileText className="size-5" aria-hidden="true" />
      </span>
      <h2 className="text-base font-medium">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
