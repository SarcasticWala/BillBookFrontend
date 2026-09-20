import { useState } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { Card } from "../../../components/UI/Card";
import { Button } from "../../../components/UI/Button";
import { Table, type Column } from "../../../components/Table/Table";
import { useGetMeQuery } from "../../../features/auth/authApiSlice";
import {
  useSetEInvoicingEnabledMutation,
  useGetGstr1SummaryQuery,
} from "../../../features/eInvoice/eInvoiceApiSlice";

const inr = (v: unknown) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const EInvoicingPage = () => {
  const { data: meData, refetch: refetchMe } = useGetMeQuery();
  const business = meData?.data || {};
  const [setEnabled, { isLoading: toggling }] = useSetEInvoicingEnabledMutation();

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const { data: gstrData, isFetching, isUninitialized } = useGetGstr1SummaryQuery(month, {
    skip: !business.eInvoicingEnabled,
  });
  const rows: any[] = gstrData?.data || [];
  // Only block the view on the very first load — once data has arrived once,
  // a background refetch (e.g. changing the month) shouldn't hide the table.
  const loadingGstr = isUninitialized || (isFetching && !gstrData);

  const handleToggle = async () => {
    try {
      await setEnabled(!business.eInvoicingEnabled).unwrap();
      toast.success(business.eInvoicingEnabled ? "e-Invoicing disabled" : "e-Invoicing enabled");
      refetchMe();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update e-Invoicing setting");
    }
  };

  const columns: Column<any>[] = [
    { header: "Invoice No", accessor: "invioceNo" },
    { header: "Date", render: (_v, r) => format(new Date(r.invioceDate), "dd MMM yyyy") },
    { header: "Party", accessor: "partyName" },
    { header: "Buyer GSTIN", accessor: "buyerGstin" },
    { header: "Taxable Value", render: (_v, r) => <div className="text-right">{inr(r.taxableValue)}</div> },
    { header: "Tax", render: (_v, r) => <div className="text-right">{inr(r.tax)}</div> },
    { header: "IRN", render: (_v, r) => <span className="text-xs break-all">{r.irn}</span> },
  ];

  return (
    <div className="secondary-font">
      <h1 className="text-xl primary-font text-gray-900 mb-6">GST e-Invoicing</h1>

      <Card className="p-4 sm:p-6 mb-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg primary-font text-gray-800">Enable e-Invoicing</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-lg">
              Once enabled, eligible B2B/export/SEZ sales invoices automatically get an IRN + QR
              from the government's IRP. B2C sales are never sent. Make sure your business GSTIN
              is set in Settings first.
            </p>
            {!business.gstin && (
              <p className="text-sm text-amber-600 mt-2">
                No business GSTIN on file — add one in Settings before enabling.
              </p>
            )}
          </div>
          <Button
            loading={toggling}
            variant={business.eInvoicingEnabled ? "outline" : "primary"}
            onClick={handleToggle}
            disabled={!business.gstin && !business.eInvoicingEnabled}
          >
            {business.eInvoicingEnabled ? "Disable" : "Enable"} e-Invoicing
          </Button>
        </div>
      </Card>

      {business.eInvoicingEnabled && (
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-lg primary-font text-gray-800">GSTR-1 Data (this feeds your filing, it doesn't file it)</h2>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="input-field w-auto"
            />
          </div>
          {loadingGstr ? (
            <p className="text-sm text-gray-500 py-6 text-center">Loading…</p>
          ) : (
            <Table
              columns={columns}
              data={rows}
              emptyMessage="No e-invoiced sales for this month yet"
            />
          )}
        </Card>
      )}
    </div>
  );
};

export default EInvoicingPage;
