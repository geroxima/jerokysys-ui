import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function InvoiceDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <Skeleton className="h-4 w-28" />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
        <Card className="h-fit">
          <CardHeader>
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function InvoiceFormSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-live="polite">
      <Skeleton className="h-4 w-28" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="grid gap-6 px-8 py-6 sm:grid-cols-[minmax(0,1fr)_260px]">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-3.5 w-56" />
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="h-3.5 w-64" />
          </div>
          <div className="flex flex-col gap-3 rounded-lg border-2 border-border px-4 py-3">
            <Skeleton className="mx-auto h-3 w-20" />
            <Skeleton className="mx-auto h-4 w-32" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>

        <div className="border-t border-border px-8 py-5">
          <Skeleton className="h-3 w-16" />
          <div className="mt-3 grid gap-4 sm:grid-cols-[140px_minmax(0,1fr)_200px]">
            {Array.from({ length: 3 }).map((_, field) => (
              <div key={field} className="flex flex-col gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border px-8 py-5">
          <Skeleton className="h-3 w-14" />
          <div className="mt-4 flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, row) => (
              <Skeleton key={row} className="h-9 w-full" />
            ))}
          </div>
        </div>

        <div className="grid gap-6 border-t border-border px-8 py-5 sm:grid-cols-[minmax(0,1fr)_300px]">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-44" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-8 py-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
    </div>
  );
}
