import { InvoicesSkeleton } from "@/components/invoices/invoices-skeleton";

export default function InvoicesLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-8 py-10">
      <InvoicesSkeleton />
    </div>
  );
}
