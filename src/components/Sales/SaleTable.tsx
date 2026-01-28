import { useGetSaleInvoicesQuery } from "../../features/sales/saleApiSlice";
import { Table } from "../Table/Table";
import type { Column } from "../Table/Table";
import { format } from "date-fns";
import { MdOutlineFileCopy } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

type SalesInvoice = {
  id: string;
  date: string;
  invoiceNumber: string;
  partyName: string;
  dueIn: string;
  amount: string;
  status: "Paid" | "Unpaid" | "Overdue";
  invioceDate: string;
};

export const SaleTable = () => {
  const { data: response, isLoading, isError } = useGetSaleInvoicesQuery(undefined);
  const navigate = useNavigate();
  const invoicesData = response?.data || [];

  const tableData: SalesInvoice[] = invoicesData.map((invoice: any) => {
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;
    const invoiceDate = invoice.invioceDate ? new Date(invoice.invioceDate) : null;

    return {
      id: invoice.id,
      date: dueDate ? format(dueDate, "dd MMM yyyy") : "-",
      invoiceNumber: invoice.invioceNo || "-",
      partyName: invoice.party?.name || "-",
      dueIn: dueDate ? format(dueDate, "PPP") : "No Due Date",
      amount: `₹${invoice.totalSaleAmount ?? "-"}`,
      status: invoice.isFullyPaid
        ? "Paid"
        : invoice.dueAmount > 0
        ? "Unpaid"
        : "Overdue",
      invioceDate: invoiceDate ? format(invoiceDate, "dd MMM yyyy") : "-",
    };
  });

  const columns: Column<SalesInvoice>[] = [
    { header: "Date", accessor: "invioceDate" },
    { header: "Invoice Number", accessor: "invoiceNumber" },
    { header: "Party Name", accessor: "partyName" },
    { header: "Due In", accessor: "dueIn" },
    { header: "Amount", accessor: "amount" },
    {
      header: "Status",
      accessor: "status",
      render: (value) => {
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

  if (isLoading) {
    return (
      <p className="text-center text-gray-400 py-10">Loading invoices...</p>
    );
  }

  if (isError) {
    return (
      <p className="text-center text-red-500 py-10">Failed to load invoices.</p>
    );
  }

  if (invoicesData.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 text-gray-500 text-center">
        <MdOutlineFileCopy className="text-5xl text-gray-300 mb-3" />
        <p className="text-sm secondary-font">
          No Transactions Matching the current filter
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table
        columns={columns}
        data={tableData}
        rowClick={(rowIndex) => {
          const selectedInvoice = tableData[rowIndex];
          navigate(`/sales/invoice/${selectedInvoice.id}`);
        }}
      />
    </div>
  );
};
