import { useEffect, useState } from "react";
import { FiDownload, FiSettings } from "react-icons/fi";
import {
  MdOutlineMoreVert,
  MdAttachMoney,
  MdOutlinePayment,
  MdMoneyOff,
} from "react-icons/md";
import { SearchDateFilter } from "../Filter/SearchDateFilter";
import { Button } from "../UI/Button";
import { Card } from "../UI/Card";
import { useNavigate } from "react-router-dom";
import { SaleTable } from "./SaleTable";
import { useGetSaleInvoicesQuery } from "../../features/sales/saleApiSlice";

const SalesInvoices = () => {
  const { data: response } = useGetSaleInvoicesQuery(undefined);
  const [filter, setFilter] = useState("Last 365 Days");
  const navigate = useNavigate();
  const [totalSale, setTotalSale] = useState(0);
  const [totalPaidAmont, setTotalPaidAmount] = useState(0);
  const [totalDueAmount, setTotalDueAmount] = useState(0);

  useEffect(() => {
    const data = response?.data;
    if (data) {
      const totalSaleAmount = data.reduce((acc: number, current: any) => acc + current.totalSaleAmount, 0);
      const totalPaidAmount = data.reduce((acc: number, current: any) => acc + (current.recievedAmount || 0), 0);
      const totalDueAmount = data.reduce((acc : number, current: any) => acc + current.dueAmount, 0);

      setTotalSale(totalSaleAmount);
      setTotalPaidAmount(totalPaidAmount);
      setTotalDueAmount(totalDueAmount);
    }
  }, [response]);
  
  
  return (
    <div className="min-h-screen  px-2 py-2 lg:px-2 md:py-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-6">
        <h1 className="text-xl primary-font text-gray-900">Sales Invoices</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            className="flex items-center secondary-font gap-2 justify-center w-full sm:w-auto cursor-pointer"
          >
            <FiDownload className="text-gray-500 " /> Reports
          </Button>
          <Button
            variant="outline"
            className="flex items-center secondary-font gap-2 justify-center w-full sm:w-auto cursor-pointer"
          >
            <FiSettings className="text-gray-500 " /> Settings
          </Button>
          <Button
            variant="outline"
            className="flex items-center secondary-font gap-2 justify-center w-full sm:w-auto cursor-pointer"
          >
            <MdOutlineMoreVert className="text-gray-500 " /> More
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="hover:border-primary transition-colors cursor-pointer">
          <div className="flex items-center gap-1.5 text-primary mb-1">
            <MdAttachMoney className="text-base" />
            <p className="text-sm secondary-font">Total Sales</p>
          </div>
          <div className="text-gray-900 primary-font text-lg">₹ {totalSale}</div>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer">
          <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
            <MdOutlinePayment className="text-base" />
            <p className="text-sm secondary-font">Paid</p>
          </div>
          <div className="text-gray-900 primary-font text-lg">₹ {totalPaidAmont}</div>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer">
          <div className="flex items-center gap-1.5 text-red-500 mb-1">
            <MdMoneyOff className="text-base" />
            <p className="text-sm secondary-font">Unpaid</p>
          </div>
          <div className="text-gray-900 primary-font text-lg">₹ {totalDueAmount}</div>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="w-full lg:w-1/2">
          <SearchDateFilter
            filterValue={filter}
            onFilterChange={setFilter}
            placeholder="Search Sales Invoice"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* <Button
            variant="outline"
            className="w-full light-font sm:w-auto cursor-pointer"
          >
            Bulk Actions
          </Button> */}
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
          <SaleTable />
        </div>
      </Card>
    </div>
  );
};

export default SalesInvoices;
