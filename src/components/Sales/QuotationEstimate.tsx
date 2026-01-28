import { useState } from "react";
import { MdFilterList, MdOutlineFileCopy } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import { SearchDateFilter } from "../Filter/SearchDateFilter";
import { Table } from "../Table/Table";
import type { Column } from "../Table/Table";
import { Button } from "../UI/Button";

type Quotation = {
  date: string;
  quotationNumber: string;
  partyName: string;
  dueIn: string;
  amount: string;
  status: "Open" | "Accepted" | "Rejected";
};

const QuotationEstimate = () => {
  const [filter, setFilter] = useState("Last 365 Days");

  const data: Quotation[] = [];

  const columns: Column<Quotation>[] = [
    { header: "Date", accessor: "date" },
    { header: "Quotation Number", accessor: "quotationNumber" },
    { header: "Party Name", accessor: "partyName" },
    { header: "Due In", accessor: "dueIn" },
    { header: "Amount", accessor: "amount" },
    {
      header: "Status",
      accessor: "status",
      render: (value: Quotation["status"]) => {
        const color =
          value === "Accepted"
            ? "bg-green-100 text-green-700"
            : value === "Rejected"
            ? "bg-red-100 text-red-700"
            : "bg-yellow-100 text-yellow-700";
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
            {value}
          </span>
        );
      },
    },
  ];

  return (
    <div className="bg-[#f9fafc] min-h-screen px-2 py-2 md:px-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 style={{ fontFamily: 'Outfit, sans-serif',fontWeight: 500}
      } className="text-xl primary-font text-gray-800">Quotation / Estimate</h1>
        <Button className="w-full primary-font sm:w-auto cursor-pointer"
       >Create Quotation</Button>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="w-full lg:w-1/2">
          <SearchDateFilter
            filterValue={filter}
            onFilterChange={setFilter}
            placeholder="Search Quotation"
          />
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-auto justify-between sm:justify-start">
          <MdFilterList className="text-gray-500" />
          <span className=" secondary-font cursor-pointer">Show Open Quotation</span>
          <IoIosArrowDown className="text-gray-500" />
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

export default QuotationEstimate;
