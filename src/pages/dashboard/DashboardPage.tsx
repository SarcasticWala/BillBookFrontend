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

const DashboardPage = () => {
  const navigate = useNavigate();
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
            Last Update: 28 Jan 2026 | 09:01 PM
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* TO COLLECT */}
          <div className="bg-green-50 border border-gray-200 rounded-lg p-4 hover:border-green-500 transition cursor-pointer">
            <p className="text-sm secondary-font text-green-700">↓ To Collect</p>
            <p className="text-lg primary-font text-gray-900 mt-2">₹ 0</p>
          </div>

          {/* TO PAY */}
          <div className="bg-red-50 border border-gray-200 rounded-lg p-4 hover:border-red-500 transition cursor-pointer">
            <p className="text-sm secondary-font text-red-600">↑ To Pay</p>
            <p className="text-lg primary-font text-gray-900 mt-2">₹ 0</p>
          </div>

          {/* CASH + BANK */}
          <div className="bg-blue-50 border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition cursor-pointer">
            <div className="flex items-center gap-2 text-blue-700">
              <MdAccountBalanceWallet />
              <p className="text-sm secondary-font">Total Cash + Bank Balance</p>
            </div>
            <p className="text-lg primary-font text-gray-900 mt-2">₹ 0</p>
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
                  <span>Amount</span>
                </div>

                <div className="flex items-center justify-center py-12 text-sm light-font text-gray-400">
                  No transactions made yet!
                </div>
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
