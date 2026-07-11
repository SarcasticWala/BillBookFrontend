import { useState } from 'react';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import { LuShoppingCart } from 'react-icons/lu';
import { SearchDateFilter } from '../Filter/SearchDateFilter';
import { Table } from '../Table/Table';
import type { Column } from '../Table/Table';
import { useNavigate } from "react-router-dom";
import { useGetDocumentsQuery } from "../../features/document/documentApiSlice";

type DebitNoteEntry = {
  date: string;
  debitNoteNumber: string;
  partyName: string;
  purchaseNo: string;
  amount: string;
  status: 'Open' | 'Closed' | 'Cancelled';
};

const DebitNote = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Last 365 Days');

  const { data: res } = useGetDocumentsQuery("DEBIT_NOTE");
  const data: DebitNoteEntry[] = (res?.data || []).map((d: any) => ({
    date: d.docDate ? new Date(d.docDate).toLocaleDateString("en-IN") : "-",
    debitNoteNumber: d.docNo,
    partyName: d.partyName || "-",
    purchaseNo: "-",
    amount: `₹${(d.grandTotal || 0).toLocaleString("en-IN")}`,
    status: d.status || "Open",
  }));

  const columns: Column<DebitNoteEntry>[] = [
    { header: 'Date', accessor: 'date' },
    { header: 'Debit Note Number', accessor: 'debitNoteNumber' },
    { header: 'Party Name', accessor: 'partyName' },
    { header: 'Purchase No', accessor: 'purchaseNo' },
    { header: 'Amount', accessor: 'amount' },
    {
      header: 'Status',
      accessor: 'status',
      render: (value: DebitNoteEntry['status']) => {
        const variant =
          value === 'Closed' ? 'success' : value === 'Cancelled' ? 'danger' : 'warning';
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
  ];

  return (
    <div className="bg-[#f9fafc] min-h-screen px-2 py-2 md:px-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 
          className="text-xl primary-font text-gray-800">Debit Note</h1>
        <Button
          className="w-full sm:w-auto cursor-pointer"
          onClick={() => navigate("/purchases/debitnote/create")}
        >
          Create Debit Note
        </Button>
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <div className="flex items-center text-accent font-medium text-sm gap-2 border-b-2 border-accent pb-1">
          <span>●</span>
          <span className="secondary-font">Debit Notes</span>
        </div>
        <div className="w-full md:w-1/2">
          <SearchDateFilter
            filterValue={filter}
            onFilterChange={setFilter}
            placeholder="Search Debit Note"
          />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4">
        {data.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-500 text-center">
            <LuShoppingCart className="text-5xl text-gray-300 mb-3" />
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

export default DebitNote;
