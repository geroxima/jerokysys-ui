"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type ColumnFormat =
  | "strong"
  | "muted"
  | "currency"
  | { kind: "timeRange"; endKey: string }
  | {
      kind: "badge";
      labels: Record<string, string>;
      colors: Record<string, string>;
    };

export type Column<T> = {
  header: string;
  accessorKey: keyof T;
  sortable?: boolean;
  format?: ColumnFormat;
  emptyText?: string;
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  sort?: string;
  direction?: string;
  onRowClick?: (row: T) => void;
  rowDoubleClickBaseUrl?: string;
  rowEditBaseUrl?: string;
};

export function DataTable<T extends { id: number | null }>({
  columns,
  data,
  sort,
  direction,
  onRowClick,
  rowDoubleClickBaseUrl,
  rowEditBaseUrl,
}: DataTableProps<T>) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSort = (key: string) => {
    const params = new URLSearchParams(window.location.search);
    const newDirection = sort === key && direction === "ASC" ? "DESC" : "ASC";
    params.set("sort", key);
    params.set("direction", newDirection);
    params.set("page", "0");
    router.push(`${pathname}?${params.toString()}`);
  };

  const SortIcon = ({ column }: { column: Column<T> }) => {
    const key = String(column.accessorKey);
    if (!column.sortable) return <ArrowUpDown className="size-3 ml-1 opacity-40" />;
    if (sort === key) {
      return direction === "ASC" ? (
        <ArrowUp className="size-3 ml-1" />
      ) : (
        <ArrowDown className="size-3 ml-1" />
      );
    }
    return <ArrowUpDown className="size-3 ml-1 opacity-40" />;
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={String(col.accessorKey)}
                className={cn(
                  "font-medium text-muted-foreground",
                  col.sortable && "cursor-pointer hover:bg-muted/50 select-none",
                  col.className,
                )}
                onClick={col.sortable ? () => handleSort(String(col.accessorKey)) : undefined}
              >
                <span className="inline-flex items-center">
                  {col.header}
                  <SortIcon column={col} />
                </span>
              </TableHead>
            ))}
            {rowDoubleClickBaseUrl || rowEditBaseUrl ? (
              <TableHead className="text-right">Acciones</TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={
                  columns.length +
                  (rowDoubleClickBaseUrl || rowEditBaseUrl ? 1 : 0)
                }
                className="h-24 text-center text-muted-foreground"
              >
                Sin registros
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow
                key={row.id ?? undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onDoubleClick={
                  rowDoubleClickBaseUrl
                    ? () => router.push(`${rowDoubleClickBaseUrl}/${row.id}`)
                    : undefined
                }
                title={rowDoubleClickBaseUrl ? "Doble clic para ver el detalle" : undefined}
                className={
                  onRowClick || rowDoubleClickBaseUrl
                    ? "cursor-pointer hover:bg-muted/50"
                    : undefined
                }
              >
                {columns.map((col) => {
                  const value = row[col.accessorKey];
                  const text = value == null ? col.emptyText ?? "" : String(value);
                  let content: React.ReactNode = text;

                  if (col.format === "strong") {
                    content = <span className="font-medium">{text}</span>;
                  } else if (col.format === "muted") {
                    content = <span className="text-muted-foreground">{text}</span>;
                  } else if (col.format === "currency") {
                    content = value == null ? col.emptyText ?? "—" : `$${text}`;
                  } else if (typeof col.format === "object" && col.format.kind === "timeRange") {
                    content = `${text} - ${String(row[col.format.endKey as keyof T] ?? "")}`;
                  } else if (typeof col.format === "object" && col.format.kind === "badge") {
                    content = (
                      <Badge
                        variant="secondary"
                        className={col.format.colors[text] ?? "bg-gray-100 text-gray-800"}
                      >
                        {col.format.labels[text] ?? (text || col.emptyText || "—")}
                      </Badge>
                    );
                  }

                  return (
                    <TableCell key={String(col.accessorKey)} className={col.className}>
                      {content}
                    </TableCell>
                  );
                })}
                {rowDoubleClickBaseUrl || rowEditBaseUrl ? (
                  <TableCell className="space-x-3 text-right">
                    {rowDoubleClickBaseUrl ? (
                      <Link
                        href={`${rowDoubleClickBaseUrl}/${row.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                        onDoubleClick={(event) => event.stopPropagation()}
                      >
                        Ver
                      </Link>
                    ) : null}
                    {rowEditBaseUrl ? (
                      <Link
                        href={`${rowEditBaseUrl}/${row.id}/edit`}
                        className="text-sm font-medium text-primary hover:underline"
                        onDoubleClick={(event) => event.stopPropagation()}
                      >
                        Editar
                      </Link>
                    ) : null}
                  </TableCell>
                ) : null}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
