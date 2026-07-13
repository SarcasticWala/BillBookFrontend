import { useState } from "react";
import { MdOutlineFileCopy } from "react-icons/md";
import { SearchDateFilter } from "../Filter/SearchDateFilter";
import { Button } from "../UI/Button";
import { Card } from "../UI/Card";
import { Table } from "../Table/Table";
import type { Column } from "../Table/Table";
import { useNavigate } from "react-router-dom";
import { useGetPaymentsQuery } from "../../features/payment/paymentApiSlice";

type PaymentOutEntry = {
  date: string;
  paymentNumber: string;
  partyName: string;
  amount: string;
};

const PaymentOut = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("Last 365 Days");

  const { data: res } = useGetPaymentsQuery("PAYMENT_OUT");
  const data: PaymentOutEntry[] = (res?.data || []).map((p: any) => ({
    date: p.paymentDate ? new Date(p.paymentDate).toLocaleDateString("en-IN") : "-",
    paymentNumber: p.paymentNo,
    partyName: p.partyName || "-",
    amount: `₹${(p.amount || 0).toLocaleString("en-IN")}`,
  }));

  const columns: Column<PaymentOutEntry>[] = [
    { header: "Date", accessor: "date" },
    { header: "Payment Number", accessor: "paymentNumber" },
    { header: "Party Name", accessor: "partyName" },
    { header: "Amount", accessor: "amount" },
  ];

  return (
    <div className="bg-[#f9fafc] min-h-screen px-2 py-2 md:px-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-xl primary-font text-gray-900">Payment Out</h1>
        <Button
          className="w-full sm:w-auto cursor-pointer"
          onClick={() => navigate("/purchases/paymentout/create")}
        >
          Create Payment Out
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <div className="flex items-center text-accent font-medium text-sm gap-2 border-b-2 border-accent pb-1">
          <span>●</span>
          <span className="secondary-font">Payments Made</span>
        </div>
        <div className="w-full md:w-1/2">
          <SearchDateFilter
            filterValue={filter}
            onFilterChange={setFilter}
            placeholder="Search Payment Out"
          />
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

export default PaymentOut;
