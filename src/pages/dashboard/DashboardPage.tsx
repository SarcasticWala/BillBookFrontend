import { MdAccountBalanceWallet } from "react-icons/md";
import {
  MdNotificationsNone,
  MdCampaign,
  MdCardGiftcard,
  MdPeopleAlt,
} from "react-icons/md";
import { FiArrowUpRight } from "react-icons/fi";
import { Button } from "../../components/UI/Button";

const DashboardPage = () => {
  return (
    <div className="min-h-screen px-2 py-2 lg:px-2 md:py-2 bg-gray-50">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white border border-gray-200 rounded-md p-4 mb-6">
        <h1 className="text-xl primary-font text-gray-800">Dashboard</h1>

        <div className="flex items-center gap-4">
          <MdNotificationsNone className="text-xl text-gray-500 cursor-pointer" />
          <MdCampaign className="text-xl text-gray-500 cursor-pointer" />
          <MdCardGiftcard className="text-xl text-gray-500 cursor-pointer" />
          <MdPeopleAlt className="text-xl text-gray-500 cursor-pointer" />

          <Button className="primary-font px-4 py-2">
            Book Demo
          </Button>
        </div>
      </div>

      {/* BOOK FREE DEMO */}
      <div className="bg-[#f4eee6] border border-gray-200 rounded-md p-6 mb-6 flex justify-between items-center">
        <div>
          <p className="text-lg primary-font text-gray-800">
            Book Free Demo
          </p>
          <p className="text-sm secondary-font text-gray-600 mt-1">
            Get a personalised tour from our solution expert
          </p>

          <button className="flex items-center gap-1 mt-3 text-sm secondary-font text-gray-800 cursor-pointer">
            Book Demo Now <FiArrowUpRight />
          </button>
        </div>

        <div className="hidden md:block">
          <div className="w-32 h-20 bg-white border rounded-md flex items-center justify-center text-xs text-gray-400">
            Preview
          </div>
        </div>
      </div>

      {/* BUSINESS OVERVIEW */}
      <div className="bg-white border border-gray-200 rounded-md p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="primary-font text-gray-800">
            Business Overview
          </h2>
          <p className="text-xs secondary-font text-gray-500">
            Last Update: 28 Jan 2026 | 09:01 PM
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* TO COLLECT */}
          <div className="bg-green-50 border border-gray-200 rounded-md p-4 hover:border-green-500 transition cursor-pointer">
            <p className="text-sm secondary-font text-green-700">
              ↓ To Collect
            </p>
            <p className="text-lg secondary-font mt-2">
              ₹ 0
            </p>
          </div>

          {/* TO PAY */}
          <div className="bg-red-50 border border-gray-200 rounded-md p-4 hover:border-red-500 transition cursor-pointer">
            <p className="text-sm secondary-font text-red-600">
              ↑ To Pay
            </p>
            <p className="text-lg secondary-font mt-2">
              ₹ 0
            </p>
          </div>

          {/* CASH + BANK */}
          <div className="bg-blue-50 border border-gray-200 rounded-md p-4 hover:border-blue-500 transition cursor-pointer">
            <div className="flex items-center gap-2 text-blue-700">
              <MdAccountBalanceWallet />
              <p className="text-sm secondary-font">
                Total Cash + Bank Balance
              </p>
            </div>
            <p className="text-lg secondary-font mt-2">
              ₹ 0
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LATEST TRANSACTIONS */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-md p-4">
          <h2 className="primary-font text-gray-800 mb-4">
            Latest Transactions
          </h2>

          <div className="border border-gray-200 rounded-md overflow-hidden">
            <div className="grid grid-cols-5 bg-gray-100 text-xs secondary-font text-gray-600 px-3 py-2">
              <span>DATE</span>
              <span>TYPE</span>
              <span>TXN NO</span>
              <span>PARTY NAME</span>
              <span>AMOUNT</span>
            </div>

            <div className="flex items-center justify-center py-12 text-sm secondary-font text-gray-400">
              No transactions made yet!
            </div>
          </div>
        </div>

        {/* TODAY CHECKLIST */}
        <div className="bg-white border border-gray-200 rounded-md p-4 flex flex-col items-center justify-center">
          <h2 className="primary-font text-gray-800 mb-4">
            Today's Checklist
          </h2>

          <div className="text-center text-gray-400">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              🚧
            </div>
            <p className="text-sm secondary-font">
              Coming Soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
