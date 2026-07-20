import { useState } from "react";
import { FiDownload, FiSettings } from "react-icons/fi";
import { MdOutlineMoreVert, MdAttachMoney, MdOutlinePayment, MdMoneyOff } from "react-icons/md";
import { SearchDateFilter } from "../Filter/SearchDateFilter";
import { Button } from "../UI/Button";
import { Card } from "../UI/Card";
import { StatCard } from "../UI/StatCard";
import { Pagination } from "../UI/Pagination";
import { useNavigate } from "react-router-dom";
import { SaleTable } from "./SaleTable";
import { useGetSaleInvoicesPagedQuery } from "../../features/sales/saleApiSlice";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

const PAGE_SIZE = 10;
const inr = (v: unknown) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const SalesInvoices = () => {
  const [filter, setFilter] = useState("Last 365 Days");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data: response, isLoading, isError } = useGetSaleInvoicesPagedQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
  });

  const invoices: any[] = response?.data?.items || [];
  const summary = response?.data?.summary || { total: 0, paid: 0, due: 0 };
  const totalPages = response?.data?.totalPages || 1;
  const total = response?.data?.total || 0;

  const onSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  return (
    <div className="min-h-full px-2 py-2 lg:px-2 md:py-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="pr-10 md:pr-0">
          <h1 className="text-xl sm:text-2xl primary-font text-gray-900">Sales Invoices</h1>
          <p className="text-sm light-font text-gray-500 mt-0.5">Track, filter and manage your sales invoices</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Sales" tone="primary" icon={<MdAttachMoney />} value={inr(summary.total)} />
        <StatCard label="Paid" tone="success" colorValue icon={<MdOutlinePayment />} value={inr(summary.paid)} />
        <StatCard label="Unpaid" tone="danger" colorValue icon={<MdMoneyOff />} value={inr(summary.due)} />
      </div>

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
            onClick={() => navigate("/sales/create-invoice")}
            className="w-full primary-font sm:w-auto cursor-pointer"
          >
            Create Sales Invoice
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <SaleTable invoices={invoices} isLoading={isLoading} isError={isError} />
        </div>
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

export default SalesInvoices;
