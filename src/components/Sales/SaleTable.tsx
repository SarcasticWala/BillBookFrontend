import { useDeleteSaleMutation } from "../../features/sales/saleApiSlice";
import { Table } from "../Table/Table";
import { Badge } from "../UI/Badge";
import type { Column } from "../Table/Table";
import { format } from "date-fns";
import {
  MdOutlineFileCopy,
  MdOutlineVisibility,
  MdEdit,
  MdDeleteOutline,
} from "react-icons/md";
import { toast } from "react-toastify";
import { RowActionsMenu } from "../UI/RowActionsMenu";
import { useNavigate } from "react-router-dom";

type SalesInvoice = {
  id: string;
  date: string;
  invoiceNumber: string;
  partyName: string;
  dueIn: string;
  amount: string;
  status: "Paid" | "Unpaid" | "Overdue" | "Void";
  invioceDate: string;
};

export const SaleTable = ({
  invoices,
  isLoading,
  isError,
}: {
  invoices: any[];
  isLoading: boolean;
  isError: boolean;
}) => {
  const navigate = useNavigate();
  const [deleteSale] = useDeleteSaleMutation();

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Void this invoice? It will be kept for your records but its stock and party-balance effects will be reversed. This can't be undone."
      )
    )
      return;
    try {
      await deleteSale(id).unwrap();
      toast.success("Invoice voided");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to void invoice");
    }
  };

  const tableData: SalesInvoice[] = invoices.map((invoice: any) => {
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;
    const invoiceDate = invoice.invioceDate ? new Date(invoice.invioceDate) : null;
    return {
      id: invoice.id,
      date: dueDate ? format(dueDate, "dd MMM yyyy") : "-",
      invoiceNumber: invoice.invioceNo || "-",
      partyName:
        invoice.partyName || invoice.partyId?.partyName || invoice.party?.name || "-",
      dueIn: dueDate ? format(dueDate, "PPP") : "No Due Date",
      amount: `₹${invoice.totalSaleAmount ?? "-"}`,
      status:
        invoice.status === "VOID"
          ? "Void"
          : invoice.isFullyPaid
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
        const variant =
          value === "Paid"
            ? "success"
            : value === "Unpaid"
            ? "warning"
            : value === "Void"
            ? "neutral"
            : "danger";
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
    {
      header: "",
      render: (_value, row) => {
        const isVoid = row.status === "Void";
        return (
          <RowActionsMenu
            actions={[
              {
                label: "View details",
                icon: <MdOutlineVisibility className="text-base" />,
                onClick: () => navigate(`/sales/invoice/${row.id}`),
              },
              // A voided invoice is a locked audit record — no edit/void.
              ...(isVoid
                ? []
                : [
                    {
                      label: "Edit",
                      icon: <MdEdit className="text-base" />,
                      onClick: () => navigate(`/sales/invoice/${row.id}/edit`),
                    },
                    {
                      label: "Void",
                      icon: <MdDeleteOutline className="text-base" />,
                      danger: true,
                      onClick: () => handleDelete(row.id),
                    },
                  ]),
            ]}
          />
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <p className="text-center text-gray-400 py-12 text-sm secondary-font">
        Loading invoices...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="text-center text-red-500 py-12 text-sm secondary-font">
        Failed to load invoices.
      </p>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-gray-500 text-center">
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
        rowClick={(rowIndex) => navigate(`/sales/invoice/${tableData[rowIndex].id}`)}
      />
    </div>
  );
};
