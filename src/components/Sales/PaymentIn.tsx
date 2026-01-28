import { useState } from "react";
import { MdOutlineFileCopy } from "react-icons/md";
import { SearchDateFilter } from "../Filter/SearchDateFilter";
import { Table } from "../Table/Table";
import type { Column } from "../Table/Table";
import { Button } from "../UI/Button";

type Payment = {
  date: string;
  paymentNumber: string;
  partyName: string;
  amount: string;
};

const PaymentIn = () => {
  const [filter, setFilter] = useState("Last 365 Days");
  const data: Payment[] = [];

  const columns: Column<Payment>[] = [
    { header: "Date", accessor: "date" },
    { header: "Payment Number", accessor: "paymentNumber" },
    { header: "Party Name", accessor: "partyName" },
    { header: "Amount", accessor: "amount" }
  ];

  return (
    <div className="bg-[#f9fafc] min-h-screen px-2 py-2 md:px-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1  className="text-xl primary-font  text-gray-800">Payment In</h1>
        <Button className="w-full primary-font sm:w-auto cursor-pointer"
      >Create Payment In</Button>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <div className="flex items-center text-[#5c27fe] font-medium text-sm gap-2 border-b-2 border-[#5c27fe] pb-1">
          <span>●</span>
          <span className="secondary-font">Payment Received</span>
        </div>
        <div className="w-full md:w-1/2">
          <SearchDateFilter
            filterValue={filter}
            onFilterChange={setFilter}
            placeholder="Search Quotation"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        {data.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-500 text-center">
            <MdOutlineFileCopy className="text-4xl text-gray-300 mb-2" />
            <p className="text-sm secondary-font">No Transactions Matching the current filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table columns={columns} data={data} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentIn;
