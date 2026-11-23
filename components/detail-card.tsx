import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DetailCard({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: ReactNode }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">{item.label}</dt>
              <dd className="text-sm">{item.value ?? "—"}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
