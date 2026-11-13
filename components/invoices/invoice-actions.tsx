"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Ban,
  CircleCheck,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { InvoiceStatus } from "@/lib/invoices/types";
import {
  useChangeInvoiceStatus,
  useDeleteInvoice,
} from "@/lib/query/invoices";
import { cn } from "@/lib/utils";

type Action = "PAID" | "CANCELLED" | "DELETE";

const CONFIRMATION_COPY: Record<
  Action,
  { title: string; description: string; confirm: string; destructive: boolean }
> = {
  PAID: {
    title: "¿Marcar como pagada?",
    description:
      "La factura quedará como pagada. Esta acción no se puede deshacer.",
    confirm: "Marcar como pagada",
    destructive: false,
  },
  CANCELLED: {
    title: "¿Anular la factura?",
    description:
      "La factura quedará anulada y no podrá volver a estado pendiente.",
    confirm: "Anular factura",
    destructive: true,
  },
  DELETE: {
    title: "¿Eliminar la factura?",
    description:
      "La factura se ocultará del listado. Es una eliminación lógica: los datos quedan en la base de datos.",
    confirm: "Eliminar factura",
    destructive: true,
  },
};

export function InvoiceActions({
  invoiceId,
  invoiceNumber,
  status,
  variant = "menu",
}: {
  invoiceId: number;
  invoiceNumber: string;
  status: InvoiceStatus;
  variant?: "menu" | "buttons";
}) {
  const router = useRouter();
  const changeStatus = useChangeInvoiceStatus();
  const removeInvoice = useDeleteInvoice();
  const pending = changeStatus.isPending || removeInvoice.isPending;
  const [action, setAction] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canEdit = status === "PENDING";
  const canChangeStatus = status === "PENDING";
  const copy = action ? CONFIRMATION_COPY[action] : null;

  function closeDialog() {
    if (pending) {
      return;
    }
    setAction(null);
    setError(null);
  }

  async function run() {
    if (!action) {
      return;
    }

    const current = action;
    setError(null);

    try {
      if (current === "DELETE") {
        await removeInvoice.mutateAsync(invoiceId);
        setAction(null);
        router.push("/invoices");
        return;
      }

      await changeStatus.mutateAsync({ id: invoiceId, status: current });
      setAction(null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo completar la acción.",
      );
    }
  }

  return (
    <>
      {variant === "menu" ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Acciones para la factura ${invoiceNumber}`}
              />
            }
          >
            <MoreHorizontal aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-auto min-w-52 whitespace-nowrap"
          >
            <DropdownMenuItem
              render={<Link href={`/invoices/${invoiceId}`} />}
            >
              <Eye aria-hidden="true" />
              Ver detalle
            </DropdownMenuItem>
            {canEdit ? (
              <DropdownMenuItem
                render={<Link href={`/invoices/${invoiceId}/edit`} />}
              >
                <Pencil aria-hidden="true" />
                Editar
              </DropdownMenuItem>
            ) : null}
            {canChangeStatus ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setAction("PAID")}>
                  <CircleCheck aria-hidden="true" />
                  Marcar como pagada
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAction("CANCELLED")}>
                  <Ban aria-hidden="true" />
                  Anular
                </DropdownMenuItem>
              </>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setAction("DELETE")}
            >
              <Trash2 aria-hidden="true" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {canEdit ? (
            <Link
              href={`/invoices/${invoiceId}/edit`}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-9 bg-background",
              )}
            >
              <Pencil aria-hidden="true" />
              Editar
            </Link>
          ) : null}
          {canChangeStatus ? (
            <>
              <Button size="lg" className="h-9" onClick={() => setAction("PAID")}>
                <CircleCheck aria-hidden="true" />
                Marcar pagada
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-9 bg-background"
                onClick={() => setAction("CANCELLED")}
              >
                <Ban aria-hidden="true" />
                Anular
              </Button>
            </>
          ) : null}
          <Button
            variant="ghost"
            size="lg"
            className="h-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setAction("DELETE")}
          >
            <Trash2 aria-hidden="true" />
            Eliminar
          </Button>
        </div>
      )}

      <AlertDialog
        open={action !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
      >
        {copy ? (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia
                className={cn(
                  copy.destructive
                    ? "bg-destructive/10 text-destructive"
                    : "bg-emerald-50 text-emerald-700",
                )}
              >
                {action === "DELETE" ? (
                  <Trash2 aria-hidden="true" />
                ) : action === "CANCELLED" ? (
                  <Ban aria-hidden="true" />
                ) : (
                  <CircleCheck aria-hidden="true" />
                )}
              </AlertDialogMedia>
              <AlertDialogTitle>{copy.title}</AlertDialogTitle>
              <AlertDialogDescription>
                Factura {invoiceNumber}. {copy.description}
              </AlertDialogDescription>
            </AlertDialogHeader>

            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={run}
                disabled={pending}
                variant={copy.destructive ? "destructive" : "default"}
              >
                {pending ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : null}
                {pending ? "Procesando…" : copy.confirm}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        ) : null}
      </AlertDialog>
    </>
  );
}
