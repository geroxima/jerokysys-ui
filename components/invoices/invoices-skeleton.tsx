import { Skeleton } from "@/components/ui/skeleton";

export function InvoicesSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[104px] w-full rounded-xl" />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-9 w-64" />
      </div>

      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="flex items-center gap-4 border-b border-border px-3 py-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, row) => (
          <div
            key={row}
            className="flex items-center gap-4 border-b border-border px-3 py-4 last:border-0"
          >
            {Array.from({ length: 6 }).map((_, cell) => (
              <Skeleton key={cell} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
