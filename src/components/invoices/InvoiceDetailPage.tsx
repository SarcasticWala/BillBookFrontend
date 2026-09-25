import { useState, lazy, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { MdEdit, MdDeleteOutline, MdOutlinePictureAsPdf } from "react-icons/md";
import {
  useGetSaleByIdQuery,
  useDeleteSaleMutation,
} from "../../features/sales/saleApiSlice";
import {
  useGetPurchaseByIdQuery,
  useDeletePurchaseMutation,
} from "../../features/purchase/purchaseApiSlice";
import { useGetMeQuery, useGetLogoQuery } from "../../features/auth/authApiSlice";
import { useGetAccountsQuery } from "../../features/account/accountApiSlice";
import {
  useSubmitEInvoiceMutation,
  useCancelEInvoiceMutation,
} from "../../features/eInvoice/eInvoiceApiSlice";
import { useQrDataUrl } from "../../hooks/useQrDataUrl";
import { Badge } from "../UI/Badge";
import { Button } from "../UI/Button";
import { PageHeader } from "../UI/PageHeader";
import { Shimmer } from "../UI/Shimmer";
import { FormSection } from "../UI/FormSection";
import { Table, type Column } from "../Table/Table";

// @react-pdf/renderer is large — load it only when someone actually opens
// the PDF preview, not on every invoice page view.
const InvoicePdfPreviewModal = lazy(() =>
  import("./InvoicePdfPreviewModal").then((m) => ({ default: m.InvoicePdfPreviewModal }))
);

type InvoiceType = "SALE" | "PURCHASE";

const inr = (v: unknown) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const fmtDate = (v: any) => {
  if (!v) return "-";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "-" : format(d, "dd MMM yyyy");
};

export const InvoiceDetailPage = ({ type }: { type: InvoiceType }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isSale = type === "SALE";

  const saleQ = useGetSaleByIdQuery(id || "", { skip: !isSale || !id });
  const purchaseQ = useGetPurchaseByIdQuery(id || "", { skip: isSale || !id });
  const { data, isLoading, isError, refetch } = isSale ? saleQ : purchaseQ;

  const [submitEInvoice, { isLoading: submittingEInvoice }] = useSubmitEInvoiceMutation();
  const [cancelEInvoice, { isLoading: cancellingEInvoice }] = useCancelEInvoiceMutation();

  const [deleteSale, { isLoading: deletingSale }] = useDeleteSaleMutation();
  const [deletePurchase, { isLoading: deletingPurchase }] =
    useDeletePurchaseMutation();
  const deleting = deletingSale || deletingPurchase;

  const { data: meData } = useGetMeQuery();
  // The logo is no longer on /me; the PDF needs it, so pull it from its own
  // (shared, cached) endpoint and merge it back into `business` below.
  const { data: logoData } = useGetLogoQuery(undefined, {
    skip: !meData?.data?.hasLogo,
  });
  const { data: accountsData } = useGetAccountsQuery(undefined);
  const [pdfOpen, setPdfOpen] = useState(false);

  // Computed ahead of the loading/error early-returns below so this hook is
  // always called in the same order, per the Rules of Hooks — `data` is
  // simply undefined until the query resolves.
  const eInvoicePreload = data?.data?.eInvoice;
  const eInvoiceQr = useQrDataUrl(
    eInvoicePreload?.status === "GENERATED" ? eInvoicePreload.signedQrCode : null
  );

  // "Scan to Pay" on the invoice PDF: the first BANK account with a UPI ID —
  // the auto-created default account is always type CASH (no bank details),
  // so "default" here means the business's actual bank, not `isDefault`.
  const bankAccounts: any[] = accountsData?.data || [];
  const payoutAccount = bankAccounts.find((a) => a.type === "BANK" && a.upiId);
  const businessName =
    meData?.data?.businessName?.trim() || meData?.data?.name?.trim() || "BillBook";
  const upiPayString = payoutAccount
    ? `upi://pay?pa=${encodeURIComponent(payoutAccount.upiId)}&pn=${encodeURIComponent(
        businessName
      )}&am=${encodeURIComponent(String(Number(data?.data?.dueAmount ?? 0) || Number(data?.data?.totalSaleAmount ?? data?.data?.totalPurchaseAmount ?? 0)))}&cu=INR&tn=${encodeURIComponent(
        `Invoice ${data?.data?.invioceNo || ""}`
      )}`
    : null;
  const paymentQr = useQrDataUrl(upiPayString);

  const listPath = isSale ? "/sales/invoices" : "/purchases/purchaseInvoice";
  const editPath = isSale
    ? `/sales/invoice/${id}/edit`
    : `/purchases/invoice/${id}/edit`;

  const handleVoid = async () => {
    if (
      !window.confirm(
        "Void this invoice? It will be kept for your records but its stock and party-balance effects will be reversed. This can't be undone."
      )
    )
      return;
    try {
      if (isSale) await deleteSale(id!).unwrap();
      else await deletePurchase(id!).unwrap();
      toast.success("Invoice voided");
      navigate(listPath);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to void invoice");
    }
  };

  if (isLoading) {
    // Mirrors the real layout below rather than a short centred spinner. The
    // old h-64 box was ~256px tall and the loaded invoice runs well past
    // 1000px, so swapping one for the other shoved the page footer down the
    // screen — that single swap was the page's entire Cumulative Layout Shift
    // (0.676, its only failing Core Web Vital). Reserving the space up front
    // costs nothing and removes the jump.
    return (
      <div className="secondary-font" aria-busy="true" aria-label="Loading invoice">
        <Shimmer className="h-10 w-64 rounded-lg" />
        <section className="mt-5 bg-white rounded-xl border border-slate-200/80 shadow-[var(--shadow-card)] p-4 sm:p-5">
          <Shimmer className="h-5 w-40 rounded" />
          <Shimmer className="mt-3 h-4 w-56 rounded" />
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Shimmer key={i} className="h-[72px] rounded-xl" />
            ))}
          </div>
        </section>
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Shimmer className="h-72 rounded-xl" />
          <Shimmer className="h-72 rounded-xl" />
        </div>
        <Shimmer className="mt-5 h-56 rounded-xl" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500 secondary-font">
        Failed to fetch invoice.
      </div>
    );
  }

  const inv: any = data.data;

  // Tolerant field readers — sale/purchase payloads differ slightly.
  const partyName = inv.partyId?.partyName || inv.partyName || "-";
  const partyMobile = inv.partyId?.mobileNo || "";
  const partyGst = inv.partyId?.gstNumber || "";

  const total = inv.totalPurchaseAmount ?? inv.totalSaleAmount ?? 0;
  const taxable =
    inv.totalTaxableSaleAmount ?? inv.totalTaxablePurchaseAmount ?? 0;
  const tax = inv.totalTax ?? 0;
  const paid = inv.receivedAmount ?? inv.paidAmount ?? 0;
  const due = inv.dueAmount ?? Math.max(0, Number(total) - Number(paid));
  const additionalCharges = inv.additionalCharges ?? 0;
  const discountAfterTax = inv.discountAfterTax ?? 0;

  const status: string = inv.status || (inv.isFullyPaid ? "PAID" : "UNPAID");
  const isVoid = status === "VOID";
  const statusVariant =
    status === "PAID"
      ? "success"
      : status === "PARTIAL"
      ? "warning"
      : isVoid
      ? "neutral"
      : "danger";

  const items: any[] = Array.isArray(inv.itemDetails) ? inv.itemDetails : [];

  // GST e-Invoicing applies only to sales, never purchases.
  const eInvoice = inv.eInvoice || { status: "NOT_APPLICABLE" };
  const eInvoiceGenerated = eInvoice.status === "GENERATED";
  const generatedAt = eInvoice.generatedAt ? new Date(eInvoice.generatedAt) : null;
  const withinCancelWindow =
    !!generatedAt && Date.now() - generatedAt.getTime() < 24 * 60 * 60 * 1000;

  const handleGenerateEInvoice = async () => {
    try {
      await submitEInvoice(id!).unwrap();
      toast.success("e-Invoice request submitted");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to generate e-Invoice");
    }
  };

  const handleCancelEInvoice = async () => {
    const reason = window.prompt("Reason for cancelling this e-Invoice:");
    if (reason == null) return;
    try {
      await cancelEInvoice({ invoiceId: id!, reason }).unwrap();
      toast.success("e-Invoice cancelled");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to cancel e-Invoice");
    }
  };

  const columns: Column<any>[] = [
    { header: "Item", accessor: "itemName" },
    { header: "HSN", accessor: "hsnCode" },
    { header: "Qty", accessor: "quantity" },
    {
      header: "Price/Item",
      render: (_v, row) => (
        <div className="text-right">{inr(row.pricePerItem)}</div>
      ),
    },
    {
      header: "Tax",
      render: (_v, row) => (
        <div className="text-right">
          {inr(row.taxAmount)}
          {row.taxPercentage ? (
            <span className="text-gray-400"> ({row.taxPercentage}%)</span>
          ) : null}
        </div>
      ),
    },
    {
      header: "Amount",
      render: (_v, row) => (
        <div className="text-right font-medium">{inr(row.totalAmount)}</div>
      ),
    },
  ];

  return (
    <div className="secondary-font">
      <PageHeader
        title={`Invoice #${inv.invioceNo || "-"}`}
        subtitle={isSale ? "Sales invoice" : "Purchase invoice"}
        onBack={() => navigate(listPath)}
        actions={
          <>
            <Badge variant={statusVariant as any}>{status}</Badge>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setPdfOpen(true)}
            >
              <MdOutlinePictureAsPdf /> Download PDF
            </Button>
            {!isVoid && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => navigate(editPath)}
                >
                  <MdEdit /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={handleVoid}
                  disabled={deleting}
                  className="!text-red-600 !border-red-200 hover:!bg-red-50"
                >
                  <MdDeleteOutline /> {deleting ? "Voiding…" : "Void"}
                </Button>
              </>
            )}
          </>
        }
      />

      {/* Tabs (visual only) */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200 text-sm text-gray-600">
        <div className="text-primary border-b-2 border-primary pb-2 -mb-px">
          Overview
        </div>
      </div>

      <div className="space-y-5 max-w-5xl">
        {/* Summary card */}
        <section className="bg-white rounded-xl border border-slate-200/80 shadow-[var(--shadow-card)] p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs secondary-font text-gray-500 uppercase tracking-wide">
                {isSale ? "Bill To" : "Supplier"}
              </p>
              <h2 className="mt-1 text-xl primary-font text-gray-900 truncate">
                {partyName}
              </h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
                {partyMobile && <span>{partyMobile}</span>}
                {partyMobile && partyGst && (
                  <span className="text-gray-300">•</span>
                )}
                {partyGst && <span>GSTIN: {partyGst}</span>}
              </div>
            </div>
            <div className="sm:text-right space-y-1.5">
              <div className="flex items-center justify-between gap-4 sm:justify-end text-sm">
                <span className="text-xs secondary-font text-gray-500 uppercase tracking-wide">
                  Invoice Date
                </span>
                <span className="secondary-font text-gray-800">
                  {fmtDate(inv.invioceDate)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end text-sm">
                <span className="text-xs secondary-font text-gray-500 uppercase tracking-wide">
                  Due Date
                </span>
                <span className="secondary-font text-gray-800">
                  {fmtDate(inv.dueDate)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Metric label="Total" value={inr(total)} accent />
            <Metric label={isSale ? "Received" : "Paid"} value={inr(paid)} />
            <Metric label="Balance Due" value={inr(due)} danger={Number(due) > 0} />
            <Metric label="Items" value={String(items.length)} />
          </div>
        </section>

        {/* Items */}
        <FormSection title="Items" layout="plain">
          <Table columns={columns} data={items} emptyMessage="No items" />
        </FormSection>

        {/* Totals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <FormSection title="Amount Summary" layout="plain">
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 space-y-2">
              <Row label="Taxable Amount" value={inr(taxable)} />
              <Row label="Total Tax" value={inr(tax)} />
              <Row label="Additional Charges" value={inr(additionalCharges)} />
              <Row label="Discount After Tax" value={`- ${inr(discountAfterTax)}`} />
              <Row label="Grand Total" value={inr(total)} grand />
              <Row label={isSale ? "Received" : "Paid"} value={inr(paid)} />
              <Row
                label="Balance Due"
                value={inr(due)}
                strong
                danger={Number(due) > 0}
              />
            </div>
          </FormSection>

          <FormSection title="Invoice Details" layout="plain">
            <div className="divide-y divide-gray-100">
              <Row label="Invoice No" value={inv.invioceNo || "-"} />
              <Row label="Invoice Date" value={fmtDate(inv.invioceDate)} />
              <Row label="Due Date" value={fmtDate(inv.dueDate)} />
              <Row
                label="Payment Terms"
                value={
                  inv.paymentTermDays ? `${inv.paymentTermDays} days` : "-"
                }
              />
              <Row label="Status" value={status} />
            </div>
          </FormSection>
        </div>

        {/* GST e-Invoice — sales only; not shown at all for purchases */}
        {isSale && !isVoid && (
          <FormSection title="GST e-Invoice" layout="plain">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    eInvoiceGenerated
                      ? "success"
                      : eInvoice.status === "FAILED"
                      ? "danger"
                      : eInvoice.status === "CANCELLED"
                      ? "neutral"
                      : "info"
                  }
                >
                  {eInvoice.status.replace("_", " ")}
                </Badge>
                {eInvoiceGenerated && (
                  <span className="text-xs text-gray-500 break-all max-w-md">
                    IRN: {eInvoice.irn}
                  </span>
                )}
                {eInvoice.status === "FAILED" && eInvoice.error && (
                  <span className="text-xs text-red-500">{eInvoice.error}</span>
                )}
              </div>

              {eInvoiceGenerated && eInvoiceQr && (
                <img src={eInvoiceQr} alt="e-Invoice QR" className="h-16 w-16" />
              )}

              <div className="sm:ml-auto flex gap-2">
                {(eInvoice.status === "NOT_APPLICABLE" || eInvoice.status === "FAILED") && (
                  <Button
                    size="sm"
                    variant="outline"
                    loading={submittingEInvoice}
                    onClick={handleGenerateEInvoice}
                  >
                    {eInvoice.status === "FAILED" ? "Retry e-Invoice" : "Generate e-Invoice"}
                  </Button>
                )}
                {eInvoiceGenerated && withinCancelWindow && (
                  <Button
                    size="sm"
                    variant="outline"
                    loading={cancellingEInvoice}
                    className="!text-red-600 !border-red-200 hover:!bg-red-50"
                    onClick={handleCancelEInvoice}
                  >
                    Cancel e-Invoice
                  </Button>
                )}
              </div>
            </div>
            {eInvoiceGenerated && !withinCancelWindow && (
              <p className="text-xs text-gray-400 mt-2">
                The 24-hour cancellation window has passed — issue a credit note to reverse this
                invoice instead.
              </p>
            )}
          </FormSection>
        )}

        {/* Notes & Terms */}
        {(inv.notes || inv.termsAndConditions) && (
          <FormSection title="Notes & Terms" layout="plain">
            {inv.notes && (
              <div className="mb-3">
                <p className="input-label mb-0.5">Notes</p>
                <p className="text-sm text-gray-600">{inv.notes}</p>
              </div>
            )}
            {inv.termsAndConditions && (
              <div>
                <p className="input-label mb-0.5">Terms & Conditions</p>
                <p className="text-sm text-gray-600">{inv.termsAndConditions}</p>
              </div>
            )}
          </FormSection>
        )}
      </div>

      {pdfOpen && (
        <Suspense fallback={null}>
          <InvoicePdfPreviewModal
            isOpen={pdfOpen}
            onClose={() => setPdfOpen(false)}
            type={type}
            invoiceNo={inv.invioceNo || "-"}
            invoiceDate={inv.invioceDate}
            dueDate={inv.dueDate}
            partyName={partyName}
            partyMobile={partyMobile}
            partyGst={partyGst}
            items={items}
            taxable={taxable}
            tax={tax}
            additionalCharges={additionalCharges}
            discountAfterTax={discountAfterTax}
            total={total}
            paid={paid}
            due={due}
            status={status}
            notes={inv.notes}
            termsAndConditions={inv.termsAndConditions}
            business={{ ...(meData?.data || {}), logoUrl: logoData?.data?.logoUrl }}
            eInvoice={eInvoiceGenerated ? { irn: eInvoice.irn, qrDataUrl: eInvoiceQr } : undefined}
            bankAccount={
              payoutAccount
                ? {
                    bankName: payoutAccount.bankName,
                    accountNumber: payoutAccount.accountNumber,
                    ifsc: payoutAccount.ifsc,
                    upiId: payoutAccount.upiId,
                  }
                : undefined
            }
            paymentQrDataUrl={paymentQr}
          />
        </Suspense>
      )}
    </div>
  );
};

const Metric = ({
  label,
  value,
  accent,
  danger,
}: {
  label: string;
  value: string;
  accent?: boolean;
  danger?: boolean;
}) => (
  <div
    className={`rounded-xl border px-3.5 py-3 ${
      danger
        ? "border-red-200 bg-red-50"
        : accent
        ? "border-primary/15 bg-primary/5"
        : "border-slate-200/80 bg-slate-50"
    }`}
  >
    {/* gray-600 over gray-500, and red-700 over red-600: at this size and on
        the tinted tile backgrounds the lighter pair fell under the 4.5:1
        contrast minimum. */}
    <span className="block text-xs secondary-font text-gray-600 uppercase tracking-wide">
      {label}
    </span>
    <span
      className={`block text-base primary-font mt-1 ${
        danger ? "text-red-700" : accent ? "text-primary" : "text-gray-900"
      }`}
    >
      {value}
    </span>
  </div>
);

const Row = ({
  label,
  value,
  strong,
  grand,
  danger,
}: {
  label: string;
  value: string;
  strong?: boolean;
  grand?: boolean;
  danger?: boolean;
}) => (
  <div
    className={`flex items-center justify-between gap-4 py-2.5 text-sm ${
      grand ? "mt-0.5 border-t border-slate-200 pt-3" : ""
    }`}
  >
    <span
      className={`shrink-0 ${
        grand ? "primary-font text-gray-900" : "text-gray-500 light-font"
      }`}
    >
      {label}
    </span>
    <span
      className={`text-right ${
        grand
          ? "text-lg primary-font text-primary"
          : danger
          ? "primary-font text-red-600"
          : strong
          ? "primary-font text-gray-900"
          : "secondary-font text-gray-800"
      }`}
    >
      {value}
    </span>
  </div>
);

export default InvoiceDetailPage;
