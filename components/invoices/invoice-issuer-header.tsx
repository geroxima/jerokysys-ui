"use client";

import Image from "next/image";

import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SALE_CONDITION_OPTIONS } from "@/lib/invoices/labels";
import type {
  FieldErrors,
  InvoiceStatus,
  InvoiceTimbrado,
  IssuerInfo,
  SaleCondition,
} from "@/lib/invoices/types";

export function InvoiceIssuerHeader({
  issuer,
  timbrados,
  mode,
  invoiceNumber,
  timbradoKey,
  address,
  issueDate,
  saleCondition,
  status,
  errors,
  onTimbradoChange,
  onDateChange,
  onConditionChange,
}: {
  issuer: IssuerInfo;
  timbrados: InvoiceTimbrado[];
  mode: "create" | "edit";
  invoiceNumber: string | null;
  timbradoKey: string;
  address: string;
  issueDate: string;
  saleCondition: SaleCondition;
  status?: InvoiceStatus;
  errors: FieldErrors;
  onTimbradoChange: (key: string) => void;
  onDateChange: (value: string) => void;
  onConditionChange: (value: SaleCondition) => void;
}) {
  return (
    <header className="grid gap-6 px-6 py-6 sm:grid-cols-[minmax(0,1fr)_260px] sm:px-8">
      <div className="flex flex-col gap-3">
        <Image
          src="/jerokysys-logo.svg"
          alt={issuer.name}
          width={146}
          height={26}
          priority
          unoptimized
        />

        <div className="flex flex-col gap-0.5 text-sm">
          <p className="font-medium">{issuer.name}</p>
          {issuer.activity ? (
            <p className="text-muted-foreground">{issuer.activity}</p>
          ) : null}
          <p className="text-muted-foreground">
            {issuer.ruc ? `RUC ${issuer.ruc}` : "RUC sin configurar"}
          </p>
          {address ? (
            <p className="text-muted-foreground">{address}</p>
          ) : (
            <p className="text-muted-foreground">Dirección sin configurar</p>
          )}
          <p className="text-muted-foreground">
            {[issuer.phone, issuer.email].filter(Boolean).join(" · ") ||
              "Contacto sin configurar"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-lg border-2 border-foreground/80 px-4 py-3">
        <p className="text-center text-xs font-semibold tracking-[0.2em] uppercase">
          Factura
        </p>

        <div className="flex flex-col gap-0.5 text-center">
          <span className="text-[11px] tracking-wide text-muted-foreground uppercase">
            N.º
          </span>
          {invoiceNumber ? (
            <span className="text-sm font-semibold tabular-nums">
              {invoiceNumber}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              Se generará al guardar
            </span>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label
            htmlFor="timbrado"
            className="text-[11px] tracking-wide text-muted-foreground uppercase"
          >
            Timbrado
          </Label>
          {mode === "edit" ? (
            <p className="text-sm font-medium tabular-nums">{timbradoKey}</p>
          ) : (
            <>
              <Select
                items={timbrados.map((option) => ({
                  value: option.key,
                  label: `${option.timbrado}-${option.serie} · ${option.label}`,
                }))}
                value={timbradoKey}
                onValueChange={(value) => onTimbradoChange(String(value))}
              >
                <SelectTrigger
                  id="timbrado"
                  size="sm"
                  className="w-full bg-transparent"
                  aria-invalid={Boolean(errors.timbrado || errors.serie)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timbrados.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      {option.timbrado}-{option.serie} · {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.timbrado || errors.serie ? (
                <p role="alert" className="text-xs text-destructive">
                  {errors.timbrado ?? errors.serie}
                </p>
              ) : null}
            </>
          )}
        </div>

        <div className="grid gap-1">
          <Label
            htmlFor="issueDate"
            className="text-[11px] tracking-wide text-muted-foreground uppercase"
          >
            Fecha de emisión
          </Label>
          <Input
            id="issueDate"
            type="date"
            value={issueDate}
            onChange={(event) => onDateChange(event.target.value)}
            aria-invalid={Boolean(errors.issueDate)}
            aria-describedby={errors.issueDate ? "issueDate-error" : undefined}
            className="h-7 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-1"
          />
          {errors.issueDate ? (
            <p id="issueDate-error" role="alert" className="text-xs text-destructive">
              {errors.issueDate}
            </p>
          ) : null}
        </div>

        <div className="grid gap-1">
          <Label
            htmlFor="saleCondition"
            className="text-[11px] tracking-wide text-muted-foreground uppercase"
          >
            Condición de venta
          </Label>
          <Select
            items={SALE_CONDITION_OPTIONS}
            value={saleCondition}
            onValueChange={(value) =>
              onConditionChange(String(value) as SaleCondition)
            }
          >
            <SelectTrigger
              id="saleCondition"
              size="sm"
              className="w-full bg-transparent"
              aria-invalid={Boolean(errors.saleCondition)}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SALE_CONDITION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.saleCondition ? (
            <p role="alert" className="text-xs text-destructive">
              {errors.saleCondition}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
          <span className="text-[11px] tracking-wide text-muted-foreground uppercase">
            Estado
          </span>
          <InvoiceStatusBadge status={status ?? "PENDING"} />
        </div>
      </div>
    </header>
  );
}
