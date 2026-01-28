import { useState } from "react";
import { MdOutlineFileCopy } from "react-icons/md";
import { SearchDateFilter } from "../Filter/SearchDateFilter";
import { Button } from "../UI/Button";
import { Table } from '../Table/Table';
import type { Column } from '../Table/Table';

type ProformaInvoiceEntry = {
  date: string;
  invoiceNumber: string;
  partyName: string;
  dueIn: string;
  amount: string;
  status: 'Draft' | 'Sent' | 'Cancelled';
};

const ProformaInvoice = () => {
  const data: ProformaInvoiceEntry[] = [];
  const [filter, setFilter] = useState('Last 365 Days');

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
        const color =
          value === 'Sent'
            ? 'bg-green-100 text-green-700'
            : value === 'Cancelled'
            ? 'bg-red-100 text-red-700'
            : 'bg-yellow-100 text-yellow-700';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
            {value}
          </span>
        );
      }
    }
  ];

  return (
    <div className="bg-[#f9fafc] min-h-screen px-2 py-2 md:px-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1  className="text-xl primary-font  text-gray-800">Proforma Invoice</h1>
        <Button  className="w-full primary-font sm:w-auto cursor-pointer">Create Proforma Invoice</Button>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <div className="flex items-center text-[#5c27fe] font-medium text-sm gap-2 border-b-2 border-[#5c27fe] pb-1">
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

      <div className="bg-white rounded-lg shadow-sm p-4">
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
      </div>
    </div>
  );
};

export default ProformaInvoice;
