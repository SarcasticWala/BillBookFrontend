import { useState } from "react";
import { FiFilter, FiCalendar } from "react-icons/fi";
import { MdOutlineStar, MdAttachMoney, MdOutlinePayment, MdMoneyOff, MdReceiptLong } from "react-icons/md";
import { toast } from "react-toastify";
import { format, startOfDay, endOfDay, subDays, startOfWeek } from "date-fns";
import { Card } from "../../../../components/UI/Card";
import { StatCard } from "../../../../components/UI/StatCard";
import { PageHeader } from "../../../../components/UI/PageHeader";
import { Badge } from "../../../../components/UI/Badge";
import { Table, type Column } from "../../../../components/Table/Table";
import { useGetPartiesQuery } from "../../../../features/party/partyApiSlice";
import {
  useGetSalesSummaryQuery,
  useGetPurchaseSummaryQuery,
  useGetDaybookQuery,
  useGetPartyOutstandingQuery,
  useGetPartyLedgerQuery,
  useGetStockSummaryQuery,
} from "../../../../features/report/reportApiSlice";

const inr = (v: unknown) => `₹${Number(v || 0).toLocaleString("en-IN")}`;
const fmtDate = (v: unknown) => (v ? format(new Date(String(v)), "dd MMM yyyy") : "-");

type ReportKey =
  | "salesSummary"
  | "purchaseSummary"
  | "partyOutstanding"
  | "partyLedger"
  | "stockSummary"
  | "daybook";

// Only these six report labels are backed by real data right now — everything
// else in `sections` below is a placeholder that shows a "coming soon" toast.
const REPORT_KEYS: Record<string, ReportKey> = {
  "Sales Summary": "salesSummary",
  "Purchase Summary": "purchaseSummary",
  "Party Wise Outstanding": "partyOutstanding",
  "Party Statement (Ledger)": "partyLedger",
  "Stock Summary": "stockSummary",
  Daybook: "daybook",
};

const REPORT_TITLES: Record<ReportKey, string> = {
  salesSummary: "Sales Summary",
  purchaseSummary: "Purchase Summary",
  partyOutstanding: "Party Wise Outstanding",
  partyLedger: "Party Statement (Ledger)",
  stockSummary: "Stock Summary",
  daybook: "Daybook",
};

const categories = ["Party", "Category", "Payment Collection", "Item", "Invoice Details", "Summary"];

const sections = [
  {
    title: "Favourite",
    icon: <MdOutlineStar className="text-yellow-500" />,
    items: ["Balance Sheet", "GSTR-1 (Sales)", "Profit and Loss Report", "Sales Summary"],
  },
  {
    title: "GST",
    items: [
      "GSTR-2 (Purchase)",
      "GSTR-3B",
      "GST Purchase (With HSN)",
      "GST Sales (With HSN)",
      "HSN Wise Sales Summary",
      "TDS Payable",
      "TDS Receivable",
      "TCS Payable",
      "TCS Receivable",
    ],
  },
  {
    title: "Transaction",
    items: [
      "Audit Trail",
      "Bill Wise Profit",
      "Cash and Bank Report (All Payments)",
      "Daybook",
      "Expense Category Report",
      "Expense Transaction Report",
      "Purchase Summary",
    ],
  },
  {
    title: "Item",
    items: [
      "Item Report By Party",
      "Item Sales and Purchase Summary",
      "Low Stock Summary",
      "Rate List",
      "Stock Detail Report",
      "Stock Summary",
    ],
  },
  {
    title: "Party",
    items: [
      "Receivable Aging Report",
      "Party Report (By Item)",
      "Party Statement (Ledger)",
      "Party Wise Outstanding",
      "Sales Summary - Category Wise",
    ],
  },
];

const RANGE_FILTERS = [
  "Today",
  "Yesterday",
  "This Week",
  "Last 7 Days",
  "Last 30 Days",
  "Last 365 Days",
] as const;

/** Same preset-range convention as `SearchDateFilter` (used on every invoice
 * list page), resolved to the from/to strings the report API takes. */
function rangeForFilter(filter: string): { from: string; to: string } {
  const now = new Date();
  let start = startOfDay(subDays(now, 29));
  let end = endOfDay(now);
  switch (filter) {
    case "Today":
      start = startOfDay(now);
      break;
    case "Yesterday": {
      const y = subDays(now, 1);
      start = startOfDay(y);
      end = endOfDay(y);
      break;
    }
    case "This Week":
      start = startOfWeek(now, { weekStartsOn: 1 });
      break;
    case "Last 7 Days":
      start = startOfDay(subDays(now, 6));
      break;
    case "Last 365 Days":
      start = startOfDay(subDays(now, 364));
      break;
  }
  return { from: format(start, "yyyy-MM-dd"), to: format(end, "yyyy-MM-dd") };
}

/** Matches `SearchDateFilter`'s date-select styling exactly, minus the search box. */
const RangeFilter: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <div className="relative w-full sm:w-56">
    <FiCalendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
    <select value={value} onChange={(e) => onChange(e.target.value)} className="input-field bg-white pl-10">
      {RANGE_FILTERS.map((f) => (
        <option key={f}>{f}</option>
      ))}
    </select>
  </div>
);

type InvoiceRow = {
  id: string;
  date: string;
  invioceNo: string;
  partyName: string;
  totalAmount: string;
  dueAmount: string;
  status: string;
};

const invoiceColumns: Column<InvoiceRow>[] = [
  { header: "Date", accessor: "date" },
  { header: "Invoice No", accessor: "invioceNo" },
  { header: "Party", accessor: "partyName" },
  { header: "Amount", accessor: "totalAmount" },
  { header: "Due", accessor: "dueAmount" },
  {
    header: "Status",
    accessor: "status",
    render: (value) => (
      <Badge variant={value === "PAID" ? "success" : value === "PARTIAL" ? "warning" : value === "VOID" ? "neutral" : "danger"}>
        {value}
      </Badge>
    ),
  },
];

const InvoiceSummaryView: React.FC<{ kind: "sale" | "purchase" }> = ({ kind }) => {
  const [filter, setFilter] = useState<string>("Last 30 Days");
  const { from, to } = rangeForFilter(filter);
  const saleQ = useGetSalesSummaryQuery({ from, to }, { skip: kind !== "sale" });
  const purchaseQ = useGetPurchaseSummaryQuery({ from, to }, { skip: kind !== "purchase" });
  const { data, isFetching } = kind === "sale" ? saleQ : purchaseQ;
  const res = data?.data;

  const rows: InvoiceRow[] = (res?.invoices || []).map((i: any) => ({
    id: i.id,
    date: fmtDate(i.invioceDate),
    invioceNo: i.invioceNo,
    partyName: i.partyName,
    totalAmount: inr(i.totalAmount),
    dueAmount: inr(i.dueAmount),
    status: i.status,
  }));

  return (
    <>
      <div className="mb-6">
        <RangeFilter value={filter} onChange={setFilter} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label={kind === "sale" ? "Invoices" : "Bills"} tone="neutral" icon={<MdReceiptLong />} value={res?.totals.count ?? 0} loading={isFetching} />
        <StatCard label="Total Amount" tone="primary" icon={<MdAttachMoney />} value={inr(res?.totals.totalAmount)} loading={isFetching} />
        <StatCard label="Received" tone="success" colorValue icon={<MdOutlinePayment />} value={inr(res?.totals.receivedAmount)} loading={isFetching} />
        <StatCard label="Due" tone="danger" colorValue icon={<MdMoneyOff />} value={inr(res?.totals.dueAmount)} loading={isFetching} />
      </div>
      <Card>
        <Table
          columns={invoiceColumns}
          data={rows}
          emptyMessage={isFetching ? "Loading…" : "No invoices in this range"}
        />
      </Card>
    </>
  );
};

type DaybookRow = { date: string; type: string; refNo: string; party: string; amount: number; direction: "IN" | "OUT" };

const daybookColumns: Column<DaybookRow>[] = [
  { header: "Date", accessor: "date" },
  { header: "Type", accessor: "type" },
  { header: "Ref No", accessor: "refNo" },
  { header: "Party", accessor: "party" },
  {
    header: "Amount",
    render: (_v, row) => (
      <span className={row.direction === "IN" ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
        {row.direction === "IN" ? "+" : "-"}
        {inr(row.amount)}
      </span>
    ),
  },
];

const DaybookView: React.FC = () => {
  const [filter, setFilter] = useState<string>("Last 30 Days");
  const { from, to } = rangeForFilter(filter);
  const { data, isFetching } = useGetDaybookQuery({ from, to });
  const res = data?.data;

  const rows: DaybookRow[] = (res?.entries || []).map((e: any) => ({
    date: fmtDate(e.date),
    type: e.type,
    refNo: e.refNo,
    party: e.party,
    amount: e.amount,
    direction: e.direction,
  }));

  return (
    <>
      <div className="mb-6">
        <RangeFilter value={filter} onChange={setFilter} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Money In" tone="success" colorValue icon={<MdOutlinePayment />} value={inr(res?.totals.totalIn)} loading={isFetching} />
        <StatCard label="Money Out" tone="danger" colorValue icon={<MdMoneyOff />} value={inr(res?.totals.totalOut)} loading={isFetching} />
        <StatCard label="Net" tone="primary" icon={<MdAttachMoney />} value={inr(res?.totals.net)} loading={isFetching} />
      </div>
      <Card>
        <Table columns={daybookColumns} data={rows} emptyMessage={isFetching ? "Loading…" : "No activity in this range"} />
      </Card>
    </>
  );
};

type OutstandingRow = { id: string; partyName: string; partyType: string; outstanding: number; status: string };

const outstandingColumns: Column<OutstandingRow>[] = [
  { header: "Party", accessor: "partyName" },
  { header: "Type", accessor: "partyType" },
  {
    header: "Outstanding",
    render: (_v, row) => inr(Math.abs(row.outstanding)),
  },
  {
    header: "Status",
    accessor: "status",
    render: (value) => (
      <Badge variant={value === "TO_COLLECT" ? "success" : value === "TO_PAY" ? "danger" : "neutral"}>
        {value === "TO_COLLECT" ? "To Collect" : value === "TO_PAY" ? "To Pay" : "Settled"}
      </Badge>
    ),
  },
];

const PartyOutstandingView: React.FC = () => {
  const { data, isFetching } = useGetPartyOutstandingQuery();
  const rows: OutstandingRow[] = data?.data || [];

  return (
    <Card>
      <Table
        columns={outstandingColumns}
        data={rows}
        emptyMessage={isFetching ? "Loading…" : "No parties yet"}
      />
    </Card>
  );
};

type LedgerRow = { date: string; type: string; refNo: string; delta: number; balance: number };

const ledgerColumns: Column<LedgerRow>[] = [
  { header: "Date", accessor: "date" },
  { header: "Type", accessor: "type" },
  { header: "Ref No", accessor: "refNo" },
  {
    header: "Amount",
    render: (_v, row) => (
      <span className={row.delta >= 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
        {row.delta >= 0 ? "+" : "-"}
        {inr(Math.abs(row.delta))}
      </span>
    ),
  },
  { header: "Balance", render: (_v, row) => inr(row.balance) },
];

const PartyLedgerView: React.FC = () => {
  const { data: partiesRes } = useGetPartiesQuery(undefined);
  const parties: any[] = partiesRes?.data || [];
  const [partyId, setPartyId] = useState("");
  const [filter, setFilter] = useState<string>("Last 365 Days");
  const { from, to } = rangeForFilter(filter);
  const { data, isFetching } = useGetPartyLedgerQuery({ partyId, from, to }, { skip: !partyId });
  const res = data?.data;

  const rows: LedgerRow[] = (res?.entries || []).map((e: any) => ({
    date: fmtDate(e.date),
    type: e.type,
    refNo: e.refNo,
    delta: e.delta,
    balance: e.balance,
  }));

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={partyId}
          onChange={(e) => setPartyId(e.target.value)}
          className="input-field bg-white sm:w-64"
        >
          <option value="">Select a party…</option>
          {parties.map((p: any) => (
            <option key={p._id} value={p._id}>
              {p.partyName}
            </option>
          ))}
        </select>
        {partyId && <RangeFilter value={filter} onChange={setFilter} />}
      </div>
      {!partyId ? (
        <p className="text-sm text-gray-400 py-12 text-center secondary-font">
          Pick a party to see their statement.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard label="Opening Balance" tone="neutral" icon={<MdAttachMoney />} value={inr(res?.openingBalance)} loading={isFetching} />
            <StatCard label="Closing Balance" tone="primary" icon={<MdAttachMoney />} value={inr(res?.closingBalance)} loading={isFetching} />
          </div>
          <Card>
            <Table columns={ledgerColumns} data={rows} emptyMessage={isFetching ? "Loading…" : "No activity in this range"} />
          </Card>
        </>
      )}
    </>
  );
};

type StockRow = { id: string; name: string; categoryName: string; stock: string; stockValue: string; isLow: boolean };

const stockColumns: Column<StockRow>[] = [
  {
    header: "Item",
    render: (_v, row) => (
      <span className="inline-flex items-center gap-2">
        {row.name}
        {row.isLow && <Badge variant="warning">Low</Badge>}
      </span>
    ),
  },
  { header: "Category", accessor: "categoryName" },
  { header: "Stock", accessor: "stock" },
  { header: "Stock Value", accessor: "stockValue" },
];

const StockSummaryView: React.FC = () => {
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const { data, isFetching } = useGetStockSummaryQuery({ lowStockOnly });
  const res = data?.data;

  const rows: StockRow[] = (res?.items || []).map((i: any) => ({
    id: i.id,
    name: i.name,
    categoryName: i.categoryName,
    stock: `${i.stock} ${i.unit}`,
    stockValue: inr(i.stockValue),
    isLow: i.isLow,
  }));

  return (
    <>
      <label className="input-label inline mb-6 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={lowStockOnly}
          onChange={(e) => setLowStockOnly(e.target.checked)}
          className="cursor-pointer"
        />
        Low stock only
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Items" tone="neutral" icon={<MdReceiptLong />} value={res?.totals.items ?? 0} loading={isFetching} />
        <StatCard label="Stock Value (at cost)" tone="primary" icon={<MdAttachMoney />} value={inr(res?.totals.stockValue)} loading={isFetching} />
        <StatCard label="Low Stock Items" tone="warning" colorValue icon={<MdMoneyOff />} value={res?.totals.lowStockCount ?? 0} loading={isFetching} />
      </div>
      <Card>
        <Table columns={stockColumns} data={rows} emptyMessage={isFetching ? "Loading…" : "No products yet"} />
      </Card>
    </>
  );
};

const ReportDetail: React.FC<{ reportKey: ReportKey; onBack: () => void }> = ({ reportKey, onBack }) => (
  <div>
    <PageHeader title={REPORT_TITLES[reportKey]} onBack={onBack} sticky={false} />
    {reportKey === "salesSummary" && <InvoiceSummaryView kind="sale" />}
    {reportKey === "purchaseSummary" && <InvoiceSummaryView kind="purchase" />}
    {reportKey === "daybook" && <DaybookView />}
    {reportKey === "partyOutstanding" && <PartyOutstandingView />}
    {reportKey === "partyLedger" && <PartyLedgerView />}
    {reportKey === "stockSummary" && <StockSummaryView />}
  </div>
);

const ReportPage = () => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const [selectedReport, setSelectedReport] = useState<ReportKey | null>(null);

  const toggleExpand = (title: string) => {
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleItemClick = (item: string) => {
    const key = REPORT_KEYS[item];
    if (key) {
      setSelectedReport(key);
    } else {
      toast.info(`${item} is coming soon`);
    }
  };

  if (selectedReport) {
    return (
      <div className="p-4 sm:p-6 min-h-full secondary-font">
        <ReportDetail reportKey={selectedReport} onBack={() => setSelectedReport(null)} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 min-h-full secondary-font">
      {/* Page header */}
      <div className="mb-6 pr-10 sm:pr-0">
        <h1 className="text-xl sm:text-2xl primary-font text-gray-900">Reports</h1>
        <p className="text-sm light-font text-gray-500 mt-0.5">
          Browse and generate detailed business reports
        </p>
      </div>

      {/* Filter Tags */}
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <span className="text-sm secondary-font text-gray-600 flex items-center gap-1.5">
          <FiFilter /> Filter By
        </span>
        {categories.map((cat) => (
          <span
            key={cat}
            className="px-3 py-1.5 border border-slate-200 rounded-full text-xs font-medium text-gray-600 bg-white shadow-[var(--shadow-xs)] hover:border-primary hover:text-primary hover:bg-primary/[0.03] transition-colors cursor-pointer"
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Grid Layout for Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {sections.map((section) => {
          const expanded = expandedSections[section.title] || false;
          const visibleItems = expanded ? section.items : section.items.slice(0, 5);

          return (
            <Card key={section.title} className="p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 primary-font text-gray-900">
                  {section.icon || <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  {section.title}
                </div>
                {section.items.length > 5 && (
                  <button
                    onClick={() => toggleExpand(section.title)}
                    className="text-xs text-primary secondary-font hover:underline"
                  >
                    {expanded ? "See less ↑" : "See more ↓"}
                  </button>
                )}
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                {visibleItems.map((item, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleItemClick(item)}
                    className="px-2 py-1.5 -mx-2 rounded-md hover:bg-primary/5 hover:text-primary cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <span>{item}</span>
                    {!REPORT_KEYS[item] && (
                      <span className="text-[10px] text-gray-300 group-hover:text-gray-400">soon</span>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ReportPage;
