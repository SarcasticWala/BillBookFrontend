import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { MdEdit, MdDeleteOutline } from "react-icons/md";
import {
  useGetSaleByIdQuery,
  useDeleteSaleMutation,
} from "../../features/sales/saleApiSlice";
import {
  useGetPurchaseByIdQuery,
  useDeletePurchaseMutation,
} from "../../features/purchase/purchaseApiSlice";
import { Badge } from "../UI/Badge";
import { Button } from "../UI/Button";
import { PageHeader } from "../UI/PageHeader";
import { FormSection } from "../UI/FormSection";
import { Table, type Column } from "../Table/Table";

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
  const { data, isLoading, isError } = isSale ? saleQ : purchaseQ;

  const [deleteSale, { isLoading: deletingSale }] = useDeleteSaleMutation();
  const [deletePurchase, { isLoading: deletingPurchase }] =
    useDeletePurchaseMutation();
  const deleting = deletingSale || deletingPurchase;

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
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 secondary-font">
        Loading invoice…
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
    <span className="block text-xs secondary-font text-gray-500 uppercase tracking-wide">
      {label}
    </span>
    <span
      className={`block text-base primary-font mt-1 ${
        danger ? "text-red-600" : accent ? "text-primary" : "text-gray-900"
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
