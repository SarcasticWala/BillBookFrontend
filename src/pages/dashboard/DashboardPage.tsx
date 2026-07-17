import { MdAccountBalanceWallet } from "react-icons/md";
import {
  MdNotificationsNone,
  MdCampaign,
  MdCardGiftcard,
  MdPeopleAlt,
} from "react-icons/md";
import { FiArrowUpRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/UI/Button";
import { Card } from "../../components/UI/Card";
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
    <div className="secondary-font min-h-screen bg-slate-50 p-4 space-y-6">
      {/* HEADER */}
      <Card className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-xl primary-font text-gray-900">Dashboard</h1>

        <div className="flex items-center gap-4">
          <MdNotificationsNone className="text-xl text-gray-500 hover:text-gray-700 cursor-pointer transition" />
          <MdCampaign className="text-xl text-gray-500 hover:text-gray-700 cursor-pointer transition" />
          <MdCardGiftcard className="text-xl text-gray-500 hover:text-gray-700 cursor-pointer transition" />
          <MdPeopleAlt className="text-xl text-gray-500 hover:text-gray-700 cursor-pointer transition" />

          <Button onClick={() => navigate("/book-demo")}>Book Demo</Button>
        </div>
      </Card>

      {/* BOOK FREE DEMO */}
      <Card className="bg-blue-50 flex justify-between items-center">
        <div>
          <p className="text-lg primary-font text-gray-900">Book Free Demo</p>
          <p className="text-sm light-font text-gray-600 mt-1">
            Get a personalised tour from our solution expert
          </p>

          <button
            onClick={() => navigate("/book-demo")}
            className="inline-flex items-center gap-1 mt-3 text-sm secondary-font text-primary hover:text-primary-hover cursor-pointer transition"
          >
            Book Demo Now <FiArrowUpRight />
          </button>
        </div>

        <div className="hidden md:block">
          <div className="w-32 h-20 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400">
            Preview
          </div>
        </div>
      </Card>

      {/* BUSINESS OVERVIEW */}
      <Card className="p-5">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
          <h2 className="text-lg primary-font text-gray-900">Business Overview</h2>
          <p className="text-xs light-font text-gray-500">
            Last Update: {lastUpdate}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* TO COLLECT */}
          <div className="bg-green-50 border border-gray-200 rounded-lg p-4 hover:border-green-500 transition cursor-pointer">
            <p className="text-sm secondary-font text-green-700">↓ To Collect</p>
            {loading ? (
              <Shimmer className="h-6 w-24 rounded mt-2" />
            ) : (
              <p className="text-lg primary-font text-gray-900 mt-2">{inr(toCollect)}</p>
            )}
          </div>

          {/* TO PAY */}
          <div className="bg-red-50 border border-gray-200 rounded-lg p-4 hover:border-red-500 transition cursor-pointer">
            <p className="text-sm secondary-font text-red-600">↑ To Pay</p>
            {loading ? (
              <Shimmer className="h-6 w-24 rounded mt-2" />
            ) : (
              <p className="text-lg primary-font text-gray-900 mt-2">{inr(toPay)}</p>
            )}
          </div>

          {/* CASH + BANK */}
          <div className="bg-blue-50 border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition cursor-pointer">
            <div className="flex items-center gap-2 text-blue-700">
              <MdAccountBalanceWallet />
              <p className="text-sm secondary-font">Total Cash + Bank Balance</p>
            </div>
            {loading ? (
              <Shimmer className="h-6 w-24 rounded mt-2" />
            ) : (
              <p className="text-lg primary-font text-gray-900 mt-2">{inr(cashBalance)}</p>
            )}
          </div>
        </div>
      </Card>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LATEST TRANSACTIONS */}
        <Card className="lg:col-span-2">
          <h2 className="text-lg primary-font text-gray-900 mb-4">
            Latest Transactions
          </h2>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[520px]">
                <div className="grid grid-cols-5 bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500 px-4 py-3">
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
                      className="grid grid-cols-5 items-center border-b border-gray-100 last:border-0 px-4 py-3.5"
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
                  <div className="flex items-center justify-center py-12 text-sm light-font text-gray-400">
                    No transactions made yet!
                  </div>
                ) : (
                  txns.map((t, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-5 items-center border-b border-gray-100 last:border-0 px-4 py-3 text-sm text-gray-700"
                    >
                      <span>{fmtDate(t.date)}</span>
                      <span>{t.type}</span>
                      <span className="truncate pr-2">{t.no}</span>
                      <span className="truncate pr-2">{t.party}</span>
                      <span
                        className={`text-right primary-font ${
                          t.sign > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {t.sign > 0 ? "+" : "-"} {inr(t.amount)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* TODAY CHECKLIST */}
        <Card className="flex flex-col items-center justify-center">
          <h2 className="text-lg primary-font text-gray-900 mb-4">
            Today's Checklist
          </h2>

          <div className="text-center text-gray-400">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              🚧
            </div>
            <p className="text-sm secondary-font">Coming Soon...</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
