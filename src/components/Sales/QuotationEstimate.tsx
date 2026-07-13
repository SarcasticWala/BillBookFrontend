import { useState } from "react";
import { MdFilterList, MdOutlineFileCopy } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import { SearchDateFilter } from "../Filter/SearchDateFilter";
import { Table } from "../Table/Table";
import { Badge } from "../UI/Badge";
import type { Column } from "../Table/Table";
import { Button } from "../UI/Button";
import { Card } from "../UI/Card";
import { useNavigate } from "react-router-dom";
import { useGetDocumentsQuery } from "../../features/document/documentApiSlice";

type Quotation = {
  date: string;
  quotationNumber: string;
  partyName: string;
  dueIn: string;
  amount: string;
  status: "Open" | "Accepted" | "Rejected";
};

const QuotationEstimate = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("Last 365 Days");

  const { data: res } = useGetDocumentsQuery("QUOTATION");
  const data: Quotation[] = (res?.data || []).map((d: any) => ({
    date: d.docDate ? new Date(d.docDate).toLocaleDateString("en-IN") : "-",
    quotationNumber: d.docNo,
    partyName: d.partyName || "-",
    dueIn: "-",
    amount: `₹${(d.grandTotal || 0).toLocaleString("en-IN")}`,
    status: d.status || "Open",
  }));

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
        const variant =
          value === "Accepted" ? "success" : value === "Rejected" ? "danger" : "warning";
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
  ];

  return (
    <div className="secondary-font min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-xl primary-font text-gray-900">Quotation / Estimate</h1>
        <Button
          className="w-full sm:w-auto cursor-pointer"
          onClick={() => navigate("/sales/quotation/create")}
        >
          Create Quotation
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="w-full lg:w-1/2">
          <SearchDateFilter
            filterValue={filter}
            onFilterChange={setFilter}
            placeholder="Search Quotation"
          />
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-2 text-sm w-full sm:w-auto justify-between sm:justify-start shadow-sm cursor-pointer hover:border-gray-300 transition-colors">
          <MdFilterList className="text-gray-500" />
          <span className="secondary-font">Show Open Quotation</span>
          <IoIosArrowDown className="text-gray-500" />
        </div>
      </div>

      <Card>
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
      </Card>
    </div>
  );
};

export default QuotationEstimate;
