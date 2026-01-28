import { FiPlus, FiRepeat, FiDownload,  } from "react-icons/fi";
import { useState } from "react";
import {
  MdOutlineAccountBalanceWallet,
  MdOutlineCurrencyRupee,
} from "react-icons/md";
import { FaUniversity } from "react-icons/fa";
import { Button } from "../../../../components/UI/Button";
import { SearchDateFilter } from "../../../../components/Filter/SearchDateFilter";
const CashAndBankPage = () => {
   const [filter, setFilter] = useState("Last 365 Days");
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex-1 min-w-[200px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-xl primary-font  text-gray-800 ">Cash and Bank</h1>
        <div className="flex gap-3 flex-wrap">
          <Button variant="outline" className="flex items-center gap-2 px-4 py-2 cursor-pointer">
                    <FiPlus className="text-gray-500" /> Add/Reduce Money
          </Button>
          <Button variant="outline" className="flex items-center gap-2 px-4 py-2 cursor-pointer">
             <FiRepeat className="text-gray-500" /> Transfer Money
          </Button>
          <Button className="cursor-pointer">
               + Add New Account
          </Button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column */}
        <div className="space-y-4 bg-white  rounded-md shadow-sm border border-gray-200 p-6">
          {/* Total Balance */}
          <div className="bg-white rounded-md px-4 py-3 shadow-sm border cursor-pointer ">
            <div className="text-sm text-gray-600 font-medium mb-1">Total Balance:</div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Cash</span>
              <span className="flex items-center gap-1 text-black font-semibold">
                <MdOutlineCurrencyRupee /> 0
              </span>
            </div>
          </div>

          {/* Cash in Hand */}
          <div className="bg-white rounded-md px-4 py-3 shadow-sm border cursor-pointer">
            <div className="text-sm text-gray-600 font-medium mb-1">Cash in hand</div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Cash</span>
              <span className="flex items-center gap-1 text-black font-semibold">
                <MdOutlineCurrencyRupee /> 0
              </span>
            </div>
          </div>

          {/* Bank Accounts */}
          <div className="bg-white rounded-md px-4 py-3 shadow-sm border cursor-pointer">
            <div className="flex items-center justify-between text-sm font-medium text-gray-600 mb-2">
              <span>Bank Accounts</span>
              <button className="text-blue-600 text-xs hover:underline cursor-pointer">+ Add New Bank</button>
            </div>
            <div className="bg-gray-50 px-3 py-2 rounded-md flex justify-between items-center border border-dashed border-gray-300">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <FaUniversity /> Unlinked Transactions
              </div>
              <span className="flex items-center gap-1 font-semibold text-black">
                <MdOutlineCurrencyRupee /> 0
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-3  bg-white p-4 rounded-md shadow-sm border border-gray-200  ">
          {/* Tab and Filter */}
          <div className="flex items-center  justify-between mb-6">
            <div className="text-sm font-semibold text-[#5c27fe] border-b-2 border-[#5c27fe] pb-1">
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
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
            <MdOutlineAccountBalanceWallet className="text-6xl text-gray-300 mb-4" />
            <h2 className="text-lg font-medium mb-1">No Transactions</h2>
            <p className="text-sm text-gray-400">
              You don't have any transaction in selected period
            </p>
            <button className="mt-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200">
              <FiDownload className="text-xl text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashAndBankPage;
