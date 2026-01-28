import { useState, useMemo } from "react";
import { FiDownload, FiSettings } from "react-icons/fi";
import {
  MdOutlineMoreVert,
  MdOutlineFileCopy,
  MdShoppingCartCheckout,
  MdOutlinePayment,
  MdMoneyOff,
} from "react-icons/md";
import { SearchDateFilter } from "../Filter/SearchDateFilter";
import { Table, type Column } from "../Table/Table";
import { Button } from "../UI/Button";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useGetPurchaseInvoicesQuery } from "../../features/purchase/purchaseApiSlice";

type PurchaseInvoice = {
  id: string;
  date: string;
  invoiceNumber: string;
  partyName: string;
  dueIn: string;
  amount: string;
  status: "Paid" | "Unpaid" | "Overdue";
};

const PurchasesInvoice = () => {
  const [filter, setFilter] = useState("Last 365 Days");
  const navigate = useNavigate();

  const {
    data: response,
    isLoading,
    isError,
  } = useGetPurchaseInvoicesQuery(undefined);
  const invoicesData = response?.data || [];

  // Table data mapping
  const tableData: PurchaseInvoice[] = invoicesData.map((invoice: any) => {
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;
    return {
      id: invoice.id,
      date: invoice.invioceDate
        ? format(new Date(invoice.invioceDate), "dd MMM yyyy")
        : "-",
      invoiceNumber: invoice.invioceNo || "-",
      partyName: invoice.party?.name || "-",
      dueIn: dueDate ? format(dueDate, "PPP") : "No Due Date",
      amount: `₹${invoice.totalPurchaseAmount ?? "-"}`,
      status: invoice.isFullyPaid
        ? "Paid"
        : invoice.dueAmount > 0
          ? "Unpaid"
          : "Overdue",
    };
  });

  // Totals for dashboard cards
  const { totalPurchases, totalPaid, totalUnpaid } = useMemo(() => {
    let totalPurchases = 0;
    let totalPaid = 0;
    let totalUnpaid = 0;

    invoicesData.forEach((inv: any) => {
      totalPurchases += inv.totalPurchaseAmount || 0;
      totalPaid += inv.paidAmount || 0;
      totalUnpaid += inv.dueAmount || 0;
    });

    return { totalPurchases, totalPaid, totalUnpaid };
  }, [invoicesData]);

  const columns: Column<PurchaseInvoice>[] = [
    { header: "Date", accessor: "date" },
    { header: "Invoice Number", accessor: "invoiceNumber" },
    { header: "Party Name", accessor: "partyName" },
    { header: "Due In", accessor: "dueIn" },
    { header: "Amount", accessor: "amount" },
    {
      header: "Status",
      accessor: "status",
      render: (value: PurchaseInvoice["status"]) => {
        const color =
          value === "Paid"
            ? "bg-green-100 text-green-700"
            : value === "Unpaid"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700";

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}
          >
            {value}
          </span>
        );
      },
    },
    {
      header: "",
      render: () => (
        <BsThreeDotsVertical className="text-gray-500 cursor-pointer" />
      ),
    },
  ];

  return (
    <div className="min-h-screen px-2 py-2 lg:px-2 md:py-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-6">
        <h1 className="text-xl primary-font text-gray-800">
          Purchase Invoices
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            className="flex items-center secondary-font gap-2 justify-center w-full sm:w-auto cursor-pointer"
          >
            <FiDownload className="text-gray-500" /> Reports
          </Button>
          <Button
            variant="outline"
            className="flex items-center secondary-font gap-2 justify-center w-full sm:w-auto cursor-pointer"
          >
            <FiSettings className="text-gray-500" /> Settings
          </Button>
          <Button
            variant="outline"
            className="flex items-center secondary-font gap-2 justify-center w-full sm:w-auto cursor-pointer"
          >
            <MdOutlineMoreVert className="text-gray-500" /> More
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="w-full bg-white p-4 rounded-md shadow-sm border border-gray-200 hover:border-blue-500 transition-all cursor-pointer">
          <div className="flex items-center gap-1 text-blue-700 mb-1">
            <MdShoppingCartCheckout className="text-base" />
            <p className="text-sm secondary-font">Total Purchases</p>
          </div>
          <div className="text-black secondary-font text-lg ml-[2px]">
            ₹ {totalPurchases.toFixed(2)}
          </div>
        </div>

        <div className="w-full bg-white p-4 rounded-md shadow-sm border border-gray-200 hover:border-green-500 transition-all cursor-pointer">
          <div className="flex items-center  gap-1 text-emerald-500 mb-1">
            <MdOutlinePayment className="text-base" />
            <p className="text-sm secondary-font">Paid</p>
          </div>
          <div className="text-black secondary-font text-lg ml-[2px]">
            ₹ {totalPaid.toFixed(2)}
          </div>
        </div>

        <div className="w-full bg-white p-4 rounded-md shadow-sm border border-gray-200 hover:border-red-500 transition-all cursor-pointer">
          <div className="flex items-center gap-1 text-red-500 mb-1">
            <MdMoneyOff className="text-base" />
            <p className="text-sm secondary-font">Unpaid</p>
          </div>
          <div className="text-black secondary-font text-lg ml-[2px]">
            ₹ {totalUnpaid.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Filters + Actions */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="w-full lg:w-1/2">
          <SearchDateFilter
            filterValue={filter}
            onFilterChange={setFilter}
            placeholder="Search Purchase Invoice"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <Button
            variant="outline"
            className="w-full primary-font sm:w-auto cursor-pointer"
          >
            Bulk Actions
          </Button>
          <Button
            onClick={() => navigate("/purchase/create-invoice")}
            className="w-full primary-font sm:w-auto cursor-pointer"
          >
            Create Purchase Invoice
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        {isLoading ? (
          <p className="text-center text-gray-400 py-10">Loading invoices...</p>
        ) : isError ? (
          <p className="text-center text-red-500 py-10">
            Failed to load invoices.
          </p>
        ) : tableData.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-gray-500 text-center">
            <MdOutlineFileCopy className="text-5xl text-gray-300 mb-3" />
            <p className="text-sm secondary-font">
              No Transactions Matching the current filter
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              data={tableData}
              rowClick={(rowIndex) => {
                const selectedInvoice = tableData[rowIndex];
                navigate(`/purchases/invoice/${selectedInvoice.id}`);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchasesInvoice;