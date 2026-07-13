import { useState } from "react";
import { MdOutlineFileCopy } from "react-icons/md";
import { SearchDateFilter } from "../Filter/SearchDateFilter";
import { Button } from "../UI/Button";
import { Badge } from "../UI/Badge";
import { Card } from "../UI/Card";
import { Table } from "../Table/Table";
import type { Column } from "../Table/Table";
import { useNavigate } from "react-router-dom";
import { useGetDocumentsQuery } from "../../features/document/documentApiSlice";

type PurchaseOrderEntry = {
  date: string;
  orderNumber: string;
  partyName: string;
  validTill: string;
  amount: string;
  status: "Open" | "Closed" | "Cancelled";
};

const PurchaseOrder = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("Last 365 Days");

  const { data: res } = useGetDocumentsQuery("PURCHASE_ORDER");
  const data: PurchaseOrderEntry[] = (res?.data || []).map((d: any) => ({
    date: d.docDate ? new Date(d.docDate).toLocaleDateString("en-IN") : "-",
    orderNumber: d.docNo,
    partyName: d.partyName || "-",
    validTill: d.dueDate ? new Date(d.dueDate).toLocaleDateString("en-IN") : "-",
    amount: `₹${(d.grandTotal || 0).toLocaleString("en-IN")}`,
    status: d.status || "Open",
  }));

  const columns: Column<PurchaseOrderEntry>[] = [
    { header: "Date", accessor: "date" },
    { header: "Purchase Order Number", accessor: "orderNumber" },
    { header: "Party Name", accessor: "partyName" },
    { header: "Valid Till", accessor: "validTill" },
    { header: "Amount", accessor: "amount" },
    {
      header: "Status",
      accessor: "status",
      render: (value: PurchaseOrderEntry["status"]) => {
        const variant =
          value === "Closed" ? "success" : value === "Cancelled" ? "danger" : "warning";
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
  ];

  return (
    <div className="secondary-font bg-slate-50 min-h-screen p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl primary-font text-gray-900">Purchase Orders</h1>
          <p className="text-sm light-font text-gray-500 mt-0.5">
            Manage and track your purchase orders
          </p>
        </div>
        <Button
          className="w-full sm:w-auto cursor-pointer"
          onClick={() => navigate("/purchases/purchaseorder/create")}
        >
          Create Purchase Order
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <div className="flex items-center text-accent secondary-font text-sm gap-2 border-b-2 border-accent pb-1">
          <span>●</span>
          <span>Purchase Orders</span>
        </div>
        <div className="w-full md:w-1/2">
          <SearchDateFilter
            filterValue={filter}
            onFilterChange={setFilter}
            placeholder="Search Purchase Orders"
          />
        </div>
      </div>

      <Card>
        {data.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-500 text-center">
            <MdOutlineFileCopy className="text-4xl text-gray-300 mb-3" />
            <p className="text-sm secondary-font text-gray-600">
              No Transactions Matching the current filter
            </p>
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

export default PurchaseOrder;
