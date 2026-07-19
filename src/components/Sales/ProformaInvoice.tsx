import { useState } from "react";
import { MdOutlineFileCopy } from "react-icons/md";
import { SearchDateFilter } from "../Filter/SearchDateFilter";
import { Button } from "../UI/Button";
import { Badge } from "../UI/Badge";
import { Card } from "../UI/Card";
import { Table } from '../Table/Table';
import type { Column } from '../Table/Table';
import { useNavigate } from "react-router-dom";
import { useGetDocumentsQuery } from "../../features/document/documentApiSlice";

type ProformaInvoiceEntry = {
  date: string;
  invoiceNumber: string;
  partyName: string;
  dueIn: string;
  amount: string;
  status: 'Draft' | 'Sent' | 'Cancelled';
};

const ProformaInvoice = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Last 365 Days');

  const { data: res } = useGetDocumentsQuery("PROFORMA");
  const data: ProformaInvoiceEntry[] = (res?.data || []).map((d: any) => ({
    date: d.docDate ? new Date(d.docDate).toLocaleDateString("en-IN") : "-",
    invoiceNumber: d.docNo,
    partyName: d.partyName || "-",
    dueIn: "-",
    amount: `₹${(d.grandTotal || 0).toLocaleString("en-IN")}`,
    status: d.status || "Draft",
  }));

  const columns: Column<ProformaInvoiceEntry>[] = [
    { header: 'Date', accessor: 'date' },
    { header: 'Proforma Invoice Number', accessor: 'invoiceNumber' },
    { header: 'Party Name', accessor: 'partyName' },
    { header: 'Due In', accessor: 'dueIn' },
    { header: 'Amount', accessor: 'amount' },
    {
      header: 'Status',
      accessor: 'status',
      render: (value: ProformaInvoiceEntry['status']) => {
        const variant =
          value === 'Sent' ? 'success' : value === 'Cancelled' ? 'danger' : 'warning';
        return <Badge variant={variant}>{value}</Badge>;
      }
    }
  ];

  return (
    <div className="secondary-font bg-slate-50 min-h-full px-2 py-2 md:px-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="pr-10 md:pr-0">
          <h1 className="text-xl sm:text-2xl primary-font text-gray-900">Proforma Invoice</h1>
          <p className="text-sm light-font text-gray-500 mt-0.5">Manage and track your proforma invoices</p>
        </div>
        <Button
          className="secondary-font w-full sm:w-auto cursor-pointer"
          onClick={() => navigate("/sales/proforma/create")}
        >
          Create Proforma Invoice
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <div className="flex items-center text-accent font-medium text-sm gap-2 border-b-2 border-accent pb-1">
          <span>●</span>
          <span className="secondary-font">Proforma Invoices</span>
        </div>
        <div className="w-full md:w-1/2">
          <SearchDateFilter
            filterValue={filter}
            onFilterChange={setFilter}
            placeholder="Search Proforma Invoice"
          />
        </div>
      </div>

      <Card>
        {data.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-500 text-center">
            <MdOutlineFileCopy className="text-4xl text-gray-300 mb-2" />
            <p className="text-sm secondary-font">No Transactions Matching the current filter</p>
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

export default ProformaInvoice;
