import { FiPlus, FiRepeat, FiDownload } from "react-icons/fi";
import { useState } from "react";
import {
  MdOutlineAccountBalanceWallet,
  MdOutlineCurrencyRupee,
} from "react-icons/md";
import { FaUniversity } from "react-icons/fa";
import { Button } from "../../../../components/UI/Button";
import { Card } from "../../../../components/UI/Card";
import { SearchDateFilter } from "../../../../components/Filter/SearchDateFilter";

const CashAndBankPage = () => {
  const [filter, setFilter] = useState("Last 365 Days");
  return (
    <div className="secondary-font space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl primary-font text-gray-900">Cash and Bank</h1>
        <div className="flex gap-3 flex-wrap">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <FiPlus /> Add/Reduce Money
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <FiRepeat /> Transfer Money
          </Button>
          <Button size="sm" className="flex items-center gap-2">
            <FiPlus /> Add New Account
          </Button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Left Column */}
        <Card className="lg:col-span-1 space-y-4">
          {/* Total Balance */}
          <div className="rounded-lg border border-gray-200 px-4 py-3 hover:border-primary transition-colors cursor-pointer">
            <div className="text-[13px] input-label mb-1">Total Balance</div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 secondary-font">Cash</span>
              <span className="flex items-center gap-0.5 text-gray-900 primary-font">
                <MdOutlineCurrencyRupee /> 0
              </span>
            </div>
          </div>

          {/* Cash in Hand */}
          <div className="rounded-lg border border-gray-200 px-4 py-3 hover:border-primary transition-colors cursor-pointer">
            <div className="text-[13px] input-label mb-1">Cash in hand</div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 secondary-font">Cash</span>
              <span className="flex items-center gap-0.5 text-gray-900 primary-font">
                <MdOutlineCurrencyRupee /> 0
              </span>
            </div>
          </div>

          {/* Bank Accounts */}
          <div className="rounded-lg border border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] input-label">Bank Accounts</span>
              <button className="text-primary text-xs secondary-font hover:underline cursor-pointer">
                + Add New Bank
              </button>
            </div>
            <div className="bg-slate-50 px-3 py-2 rounded-md flex justify-between items-center border border-dashed border-gray-300">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <FaUniversity /> Unlinked Transactions
              </div>
              <span className="flex items-center gap-0.5 primary-font text-gray-900">
                <MdOutlineCurrencyRupee /> 0
              </span>
            </div>
          </div>
        </Card>

        {/* Right Panel */}
        <Card className="lg:col-span-3">
          {/* Tab and Filter */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-gray-200 pb-3">
            <div className="text-sm primary-font text-accent border-b-2 border-accent -mb-3 pb-3">
              Transactions
            </div>
            <div className="w-full lg:w-1/2">
              <SearchDateFilter
                filterValue={filter}
                onFilterChange={setFilter}
                placeholder="Search Quotation"
              />
            </div>
          </div>

          {/* No Transactions */}
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center text-gray-500">
            <MdOutlineAccountBalanceWallet className="text-5xl sm:text-6xl text-gray-300 mb-4" />
            <h2 className="text-lg primary-font text-gray-700 mb-1">No Transactions</h2>
            <p className="text-sm text-gray-400">
              You don't have any transaction in selected period
            </p>
            <button className="mt-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors">
              <FiDownload className="text-xl text-gray-500" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CashAndBankPage;
