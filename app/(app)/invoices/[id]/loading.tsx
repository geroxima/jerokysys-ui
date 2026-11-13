import { InvoiceDetailSkeleton } from "@/components/invoices/invoice-skeletons";

export default function InvoiceDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-8 py-10">
      <InvoiceDetailSkeleton />
    </div>
  );
}
