type TableSkeletonProps = {
  columns: number;
};

export function TableSkeleton({ columns }: TableSkeletonProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-4">
        <div className="flex items-center gap-4 mb-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={i}
              className="h-4 w-24 animate-pulse rounded bg-muted"
            />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            {Array.from({ length: columns }).map((_, j) => (
              <div
                key={j}
                className="h-3 w-20 animate-pulse rounded bg-muted"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
