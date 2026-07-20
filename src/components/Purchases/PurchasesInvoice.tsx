import { useState } from "react";
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
import { Badge } from "../UI/Badge";
import { Button } from "../UI/Button";
import { Card } from "../UI/Card";
import { StatCard } from "../UI/StatCard";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { MdOutlineVisibility, MdEdit, MdDeleteOutline } from "react-icons/md";
import { toast } from "react-toastify";
import { RowActionsMenu } from "../UI/RowActionsMenu";
import { Pagination } from "../UI/Pagination";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import {
  useGetPurchaseInvoicesPagedQuery,
  useDeletePurchaseMutation,
} from "../../features/purchase/purchaseApiSlice";

const PAGE_SIZE = 10;
const inr = (v: unknown) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

type PurchaseInvoice = {
  id: string;
  date: string;
  invoiceNumber: string;
  partyName: string;
  dueIn: string;
  amount: string;
  status: "Paid" | "Unpaid" | "Overdue" | "Void";
};

const PurchasesInvoice = () => {
  const [filter, setFilter] = useState("Last 365 Days");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const debouncedSearch = useDebouncedValue(search, 350);

  const {
    data: response,
    isLoading,
    isError,
  } = useGetPurchaseInvoicesPagedQuery({ page, limit: PAGE_SIZE, search: debouncedSearch });
  const invoicesData = response?.data?.items || [];
  const summary = response?.data?.summary || { total: 0, paid: 0, due: 0 };
  const totalPages = response?.data?.totalPages || 1;
  const total = response?.data?.total || 0;

  const onSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  const [deletePurchase] = useDeletePurchaseMutation();

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Void this invoice? It will be kept for your records but its stock and party-balance effects will be reversed. This can't be undone."
      )
    )
      return;
    try {
      await deletePurchase(id).unwrap();
      toast.success("Invoice voided");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to void invoice");
    }
  };

  // Table data mapping
  const tableData: PurchaseInvoice[] = invoicesData.map((invoice: any) => {
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;
    return {
      id: invoice.id,
      date: invoice.invioceDate
        ? format(new Date(invoice.invioceDate), "dd MMM yyyy")
        : "-",
      invoiceNumber: invoice.invioceNo || "-",
      partyName:
        invoice.partyName || invoice.partyId?.partyName || invoice.party?.name || "-",
      dueIn: dueDate ? format(dueDate, "PPP") : "No Due Date",
      amount: `₹${invoice.totalPurchaseAmount ?? "-"}`,
      status:
        invoice.status === "VOID"
          ? "Void"
          : invoice.isFullyPaid
            ? "Paid"
            : invoice.dueAmount > 0
              ? "Unpaid"
              : "Overdue",
    };
  });

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
                onClick: () => navigate(`/purchases/invoice/${row.id}`),
              },
              ...(isVoid
                ? []
                : [
                    {
                      label: "Edit",
                      icon: <MdEdit className="text-base" />,
                      onClick: () => navigate(`/purchases/invoice/${row.id}/edit`),
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

  return (
    <div className="secondary-font min-h-full px-2 py-2 lg:px-2 md:py-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="pr-10 md:pr-0">
          <h1 className="text-xl sm:text-2xl primary-font text-gray-900">Purchase Invoices</h1>
          <p className="text-sm light-font text-gray-500 mt-0.5">Track, filter and manage your purchase invoices</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
          <Button variant="outline" className="secondary-font w-full sm:w-auto cursor-pointer">
            <FiDownload className="text-gray-500" /> Reports
          </Button>
          <Button variant="outline" className="secondary-font w-full sm:w-auto cursor-pointer">
            <FiSettings className="text-gray-500" /> Settings
          </Button>
          <Button variant="outline" className="secondary-font w-full sm:w-auto cursor-pointer">
            <MdOutlineMoreVert className="text-gray-500" /> More
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Purchases" tone="primary" icon={<MdShoppingCartCheckout />} value={inr(summary.total)} />
        <StatCard label="Paid" tone="success" colorValue icon={<MdOutlinePayment />} value={inr(summary.paid)} />
        <StatCard label="Unpaid" tone="danger" colorValue icon={<MdMoneyOff />} value={inr(summary.due)} />
      </div>

      {/* Filters + Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="w-full lg:w-1/2">
          <SearchDateFilter
            filterValue={filter}
            onFilterChange={setFilter}
            placeholder="Search by invoice no. or party"
            searchValue={search}
            onSearchChange={onSearch}
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
      <Card>
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
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={PAGE_SIZE}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
};

export default PurchasesInvoice;