import { useState } from "react";
import { MdOutlineFileCopy } from 'react-icons/md';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import { SearchDateFilter } from '../Filter/SearchDateFilter';
import { Table } from '../Table/Table';
import type { Column } from '../Table/Table';
import { useNavigate } from "react-router-dom";
import { useGetDocumentsQuery } from "../../features/document/documentApiSlice";

type CreditNoteEntry = {
  date: string;
  creditNoteNumber: string;
  partyName: string;
  invoiceNo: string;
  amount: string;
  status: 'Open' | 'Closed' | 'Cancelled';
};

const CreditNote = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Last 365 Days');

  const { data: res } = useGetDocumentsQuery("CREDIT_NOTE");
  const data: CreditNoteEntry[] = (res?.data || []).map((d: any) => ({
    date: d.docDate ? new Date(d.docDate).toLocaleDateString("en-IN") : "-",
    creditNoteNumber: d.docNo,
    partyName: d.partyName || "-",
    invoiceNo: "-",
    amount: `₹${(d.grandTotal || 0).toLocaleString("en-IN")}`,
    status: d.status || "Open",
  }));

  const columns: Column<CreditNoteEntry>[] = [
    { header: 'Date', accessor: 'date' },
    { header: 'Credit Note Number', accessor: 'creditNoteNumber' },
    { header: 'Party Name', accessor: 'partyName' },
    { header: 'Invoice No', accessor: 'invoiceNo' },
    { header: 'Amount', accessor: 'amount' },
    {
      header: 'Status',
      accessor: 'status',
      render: (value: CreditNoteEntry['status']) => {
        const variant =
          value === 'Closed' ? 'success' : value === 'Cancelled' ? 'danger' : 'warning';
        return <Badge variant={variant}>{value}</Badge>;
      }
    }
  ];

  return (
    <div className='secondary-font min-h-full px-2 py-2 md:px-2'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
        <div className="pr-10 md:pr-0">
          <h1 className="text-xl sm:text-2xl primary-font text-gray-900">Credit Notes</h1>
          <p className="text-sm light-font text-gray-500 mt-0.5">
            Track and manage credit notes issued to your parties
          </p>
        </div>
        <Button
          className="secondary-font w-full sm:w-auto cursor-pointer"
          onClick={() => navigate("/sales/creditnote/create")}
        >
          Create Credit Note
        </Button>
      </div>

      <div className='flex flex-col md:flex-row items-start md:items-center gap-4 mb-6'>
        <div className="flex items-center text-accent font-medium text-sm gap-2 border-b-2 border-accent pb-1">
          <span>●</span>
          <span className="secondary-font">Credit Notes</span>
        </div>
        <div className='w-full md:w-1/2'>
          <SearchDateFilter
            filterValue={filter}
            onFilterChange={setFilter}
            placeholder='Search Credit Note'
          />
        </div>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-4'>
        {data.length === 0 ? (
          <div className='flex flex-col items-center py-16 text-gray-500 text-center'>
            <MdOutlineFileCopy className='text-4xl text-gray-300 mb-3' />
            <p className='text-sm secondary-font'>No Transactions Matching the current filter</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <Table columns={columns} data={data} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditNote;
