import { MdAccountBalanceWallet } from "react-icons/md";
import {
  MdNotificationsNone,
  MdCampaign,
  MdCardGiftcard,
  MdPeopleAlt,
  MdArrowDownward,
  MdArrowUpward,
} from "react-icons/md";
import { FiArrowUpRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/UI/Button";
import { Card } from "../../components/UI/Card";
import { Badge } from "../../components/UI/Badge";
import { Shimmer } from "../../components/UI/Shimmer";
import { useGetDashboardSummaryQuery } from "../../features/dashboard/dashboardApiSlice";

const inr = (n: number): string => `₹ ${Math.round(n).toLocaleString("en-IN")}`;

interface Txn {
  date: string;
  type: string;
  no: string;
  party: string;
  amount: number;
  sign: 1 | -1;
}

const DashboardPage = () => {
  const navigate = useNavigate();

  // Server-side aggregate: spans ALL records (not a capped page) and excludes
  // voided invoices, so these totals are accurate at any scale.
  const { data: summaryRes, isLoading: loading } = useGetDashboardSummaryQuery();
  const summary = summaryRes?.data || {};
  const toCollect: number = summary.toCollect || 0;
  const toPay: number = summary.toPay || 0;
  const cashBalance: number = summary.cashBank || 0;
  const txns: Txn[] = summary.recent || [];

  const fmtDate = (d: string) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";

  const lastUpdate = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="secondary-font min-h-screen bg-slate-50 p-4 sm:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="pr-10 sm:pr-0">
          <h1 className="text-xl sm:text-2xl primary-font text-gray-900">Dashboard</h1>
          <p className="text-sm light-font text-gray-500 mt-0.5">
            Here's what's happening across your business
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {[MdNotificationsNone, MdCampaign, MdCardGiftcard, MdPeopleAlt].map((Icon, i) => (
            <button
              key={i}
              type="button"
              className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-gray-800 hover:shadow-[var(--shadow-xs)] transition-all cursor-pointer"
            >
              <Icon className="text-xl" />
            </button>
          ))}
          <Button onClick={() => navigate("/book-demo")} className="ml-1.5">Book Demo</Button>
        </div>
      </div>

      {/* BOOK FREE DEMO */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-[var(--shadow-elevated)]">
        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute right-16 -bottom-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap justify-between items-center gap-4 p-5 sm:p-6">
          <div>
            <p className="text-lg sm:text-xl primary-font text-white">Book a Free Demo</p>
            <p className="text-sm text-white/80 mt-1 max-w-md">
              Get a personalised tour from our solution expert and set up your billing in minutes.
            </p>
            <button
              onClick={() => navigate("/book-demo")}
              className="inline-flex items-center gap-1.5 mt-4 rounded-lg bg-white/15 hover:bg-white/25 px-3.5 py-2 text-sm secondary-font text-white backdrop-blur-sm transition-colors cursor-pointer"
            >
              Book Demo Now <FiArrowUpRight />
            </button>
          </div>
          <div className="hidden md:flex h-24 w-40 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/20 text-xs text-white/70">
            Preview
          </div>
        </div>
      </div>

      {/* BUSINESS OVERVIEW */}
      <div>
        <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
          <h2 className="text-base primary-font text-gray-900">Business Overview</h2>
          <p className="text-xs light-font text-gray-500">
            Last updated {lastUpdate}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* TO COLLECT */}
          <Card interactive className="flex items-start gap-3.5">
            <span className="shrink-0 h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-inset ring-emerald-600/10">
              <MdArrowDownward className="text-xl" />
            </span>
            <div className="min-w-0">
              <p className="text-xs secondary-font text-gray-500 uppercase tracking-wide">To Collect</p>
              {loading ? (
                <Shimmer className="h-7 w-28 rounded mt-1.5" />
              ) : (
                <p className="text-2xl primary-font text-emerald-600 leading-tight mt-0.5">{inr(toCollect)}</p>
              )}
            </div>
          </Card>

          {/* TO PAY */}
          <Card interactive className="flex items-start gap-3.5">
            <span className="shrink-0 h-11 w-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center ring-1 ring-inset ring-red-600/10">
              <MdArrowUpward className="text-xl" />
            </span>
            <div className="min-w-0">
              <p className="text-xs secondary-font text-gray-500 uppercase tracking-wide">To Pay</p>
              {loading ? (
                <Shimmer className="h-7 w-28 rounded mt-1.5" />
              ) : (
                <p className="text-2xl primary-font text-red-600 leading-tight mt-0.5">{inr(toPay)}</p>
              )}
            </div>
          </Card>

          {/* CASH + BANK */}
          <Card interactive className="flex items-start gap-3.5">
            <span className="shrink-0 h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center ring-1 ring-inset ring-blue-600/10">
              <MdAccountBalanceWallet className="text-xl" />
            </span>
            <div className="min-w-0">
              <p className="text-xs secondary-font text-gray-500 uppercase tracking-wide">Cash + Bank Balance</p>
              {loading ? (
                <Shimmer className="h-7 w-28 rounded mt-1.5" />
              ) : (
                <p className="text-2xl primary-font text-gray-900 leading-tight mt-0.5">{inr(cashBalance)}</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LATEST TRANSACTIONS */}
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-base primary-font text-gray-900">Latest Transactions</h2>
            <span className="text-xs secondary-font text-gray-400">{txns.length} recent</span>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[520px]">
              <div className="grid grid-cols-5 bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-5 py-3">
                <span>Date</span>
                <span>Type</span>
                <span>Txn No</span>
                <span>Party Name</span>
                <span className="text-right">Amount</span>
              </div>

              {loading ? (
                [0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="grid grid-cols-5 items-center border-b border-slate-50 last:border-0 px-5 py-3.5"
                  >
                    <Shimmer className="h-3.5 w-20 rounded" />
                    <Shimmer className="h-3.5 w-16 rounded" />
                    <Shimmer className="h-3.5 w-24 rounded" />
                    <Shimmer className="h-3.5 w-28 rounded" />
                    <div className="flex justify-end">
                      <Shimmer className="h-3.5 w-16 rounded" />
                    </div>
                  </div>
                ))
              ) : txns.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                  <div className="h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-lg">
                    ₹
                  </div>
                  <p className="text-sm light-font text-gray-400">No transactions made yet</p>
                </div>
              ) : (
                txns.map((t, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-5 items-center border-b border-slate-50 last:border-0 px-5 py-3.5 text-sm text-gray-700 hover:bg-primary/[0.03] transition-colors"
                  >
                    <span className="text-gray-500">{fmtDate(t.date)}</span>
                    <span>
                      <Badge variant={t.sign > 0 ? "success" : "danger"}>{t.type}</Badge>
                    </span>
                    <span className="truncate pr-2 font-medium text-gray-900">{t.no}</span>
                    <span className="truncate pr-2">{t.party}</span>
                    <span
                      className={`text-right primary-font ${
                        t.sign > 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {t.sign > 0 ? "+" : "-"} {inr(t.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* TODAY CHECKLIST */}
        <Card className="flex flex-col">
          <h2 className="text-base primary-font text-gray-900 mb-4">Today's Checklist</h2>

          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-2xl">
              🚧
            </div>
            <p className="text-sm secondary-font text-gray-600">Coming soon</p>
            <p className="text-xs light-font text-gray-400 mt-1 max-w-[12rem]">
              Your daily tasks and reminders will appear here.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
