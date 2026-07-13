import { useState } from "react";
import {
  MdFilterList,
  MdOutlineFileCopy,
  MdOutlineMoreVert,
} from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import { SearchDateFilter } from "../../../components/Filter/SearchDateFilter";
import { Table } from "../../../components/Table/Table";
import type { Column } from "../../../components/Table/Table";
import { Button } from "../../../components/UI/Button";
import { Card } from "../../../components/UI/Card";
import { FiDownload, FiSettings } from "react-icons/fi";

type Expense = {
  date: string;
  expenseNumber: string;
  partyName: string;
  category: string;
  amount: string;
};

const ExpensesPage = () => {
  const [filter, setFilter] = useState("Last 365 Days");

  const data: Expense[] = [];

  const columns: Column<Expense>[] = [
    { header: "Date", accessor: "date" },
    { header: "Expense Number", accessor: "expenseNumber" },
    { header: "Party Name", accessor: "partyName" },
    { header: "Category", accessor: "category" },
    { header: "Amount", accessor: "amount" },
  ];

  return (
    <div className="secondary-font space-y-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h1 className="text-xl primary-font text-gray-900">Expenses</h1>

        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 justify-center w-full sm:w-auto"
          >
            <FiDownload className="text-gray-500" /> Reports
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 justify-center w-full sm:w-auto"
          >
            <FiSettings className="text-gray-500" /> Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 justify-center w-full sm:w-auto"
          >
            <MdOutlineMoreVert className="text-gray-500" /> More
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="w-full lg:w-1/2">
            <SearchDateFilter
              filterValue={filter}
              onFilterChange={setFilter}
              placeholder="Search Quotation"
            />
          </div>

          <div className="flex items-center gap-2 bg-white input-field !py-2 text-sm w-full sm:w-64 cursor-pointer">
            <MdFilterList className="text-gray-500" />
            <span className="secondary-font whitespace-nowrap">
              All Expenses Categories
            </span>
            <IoIosArrowDown className="text-gray-500 ml-auto" />
          </div>

          <div className="w-full sm:w-auto">
            <Button size="sm" className="w-full sm:w-auto">
              Create Expense
            </Button>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-500 text-center">
            <MdOutlineFileCopy className="text-4xl text-gray-300 mb-2" />
            <p className="text-sm secondary-font">
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

export default ExpensesPage;
