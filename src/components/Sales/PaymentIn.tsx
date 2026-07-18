import { useState } from "react";
import { MdOutlineFileCopy } from "react-icons/md";
import { SearchDateFilter } from "../Filter/SearchDateFilter";
import { Table } from "../Table/Table";
import type { Column } from "../Table/Table";
import { Button } from "../UI/Button";
import { Card } from "../UI/Card";
import { useNavigate } from "react-router-dom";
import { useGetPaymentsQuery } from "../../features/payment/paymentApiSlice";

type Payment = {
  date: string;
  paymentNumber: string;
  partyName: string;
  amount: string;
};

const PaymentIn = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("Last 365 Days");

  const { data: res } = useGetPaymentsQuery("PAYMENT_IN");
  const data: Payment[] = (res?.data || []).map((p: any) => ({
    date: p.paymentDate ? new Date(p.paymentDate).toLocaleDateString("en-IN") : "-",
    paymentNumber: p.paymentNo,
    partyName: p.partyName || "-",
    amount: `₹${(p.amount || 0).toLocaleString("en-IN")}`,
  }));

  const columns: Column<Payment>[] = [
    { header: "Date", accessor: "date" },
    { header: "Payment Number", accessor: "paymentNumber" },
    { header: "Party Name", accessor: "partyName" },
    { header: "Amount", accessor: "amount" }
  ];

  return (
    <div className="secondary-font min-h-screen bg-slate-50 px-2 py-2 md:px-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="pr-10 md:pr-0">
          <h1 className="text-xl sm:text-2xl primary-font text-gray-900">Payment In</h1>
          <p className="text-sm light-font text-gray-500 mt-0.5">Track payments received from your parties</p>
        </div>
        <Button
          className="secondary-font w-full sm:w-auto cursor-pointer"
          onClick={() => navigate("/sales/paymentin/create")}
        >
          Create Payment In
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <div className="flex items-center text-accent font-medium text-sm gap-2 border-b-2 border-accent pb-1">
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

      <Card>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 mb-4">
              <MdOutlineFileCopy className="text-2xl text-gray-400" />
            </span>
            <p className="text-sm secondary-font text-gray-500">No Transactions Matching the current filter</p>
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

export default PaymentIn;
