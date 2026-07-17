import { useState } from "react";
import { MdOutlineFileCopy, MdDeleteOutline } from "react-icons/md";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { SearchDateFilter } from "../../../components/Filter/SearchDateFilter";
import { Table } from "../../../components/Table/Table";
import type { Column } from "../../../components/Table/Table";
import { Button } from "../../../components/UI/Button";
import { Card } from "../../../components/UI/Card";
import { Pagination } from "../../../components/UI/Pagination";
import { RowActionsMenu } from "../../../components/UI/RowActionsMenu";
import { CreateExpenseModal } from "../../../components/expenses/CreateExpenseModal";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import {
  useGetExpensesQuery,
  useDeleteExpenseMutation,
} from "../../../features/expense/expenseApiSlice";

const PAGE_SIZE = 10;
const inr = (v: unknown) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

type ExpenseRow = {
  id: string;
  date: string;
  expenseNumber: string;
  partyName: string;
  category: string;
  amount: string;
};

const ExpensesPage = () => {
  const [filter, setFilter] = useState("Last 365 Days");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 350);
  const { data: resp, isLoading } = useGetExpensesQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
  });
  const [deleteExpense] = useDeleteExpenseMutation();

  const items: any[] = resp?.data?.items || [];
  const total = resp?.data?.total || 0;
  const totalPages = resp?.data?.totalPages || 1;
  const summaryTotal = resp?.data?.summary?.total || 0;

  const onSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this expense? This cannot be undone.")) return;
    try {
      await deleteExpense(id).unwrap();
      toast.success("Expense deleted");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete expense");
    }
  };

  const data: ExpenseRow[] = items.map((e) => ({
    id: e.id,
    date: e.expenseDate ? format(new Date(e.expenseDate), "dd MMM yyyy") : "-",
    expenseNumber: e.expenseNumber || "-",
    partyName: e.partyName || "-",
    category: e.category || "-",
    amount: inr(e.amount),
  }));

  const columns: Column<ExpenseRow>[] = [
    { header: "Date", accessor: "date" },
    { header: "Expense Number", accessor: "expenseNumber" },
    { header: "Paid To", accessor: "partyName" },
    { header: "Category", accessor: "category" },
    {
      header: "Amount",
      render: (_v, row) => (
        <div className="text-right font-medium text-red-600">{row.amount}</div>
      ),
    },
    {
      header: "",
      render: (_v, row) => (
        <RowActionsMenu
          actions={[
            {
              label: "Delete",
              icon: <MdDeleteOutline className="text-base" />,
              danger: true,
              onClick: () => handleDelete(row.id),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="secondary-font space-y-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h1 className="text-xl primary-font text-gray-900">Expenses</h1>
        <Button size="sm" onClick={() => setShowCreate(true)} className="w-full sm:w-auto">
          + Create Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <p className="text-sm secondary-font text-gray-500 mb-1">Total Expenses</p>
          <p className="text-xl primary-font text-red-600">{inr(summaryTotal)}</p>
        </Card>
        <Card>
          <p className="text-sm secondary-font text-gray-500 mb-1">Records</p>
          <p className="text-xl primary-font text-gray-900">{total}</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="w-full lg:w-1/2">
            <SearchDateFilter
              filterValue={filter}
              onFilterChange={setFilter}
              placeholder="Search by number, party or category"
              searchValue={search}
              onSearchChange={onSearch}
            />
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-400 py-10 text-sm">Loading expenses…</p>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-500 text-center">
            <MdOutlineFileCopy className="text-4xl text-gray-300 mb-2" />
            <p className="text-sm secondary-font">
              No expenses yet — click “Create Expense” to add one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table columns={columns} data={data} />
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

      {showCreate && <CreateExpenseModal onClose={() => setShowCreate(false)} />}
    </div>
  );
};

export default ExpensesPage;
