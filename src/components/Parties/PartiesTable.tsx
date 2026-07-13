import { useGetPartiesQuery } from "../../features/party/partyApiSlice";
import { Table } from "../Table/Table";
import type { Column } from "../Table/Table";
import { Badge } from "../UI/Badge";
import { useNavigate } from "react-router-dom";

interface Party {
  name: string;
  category: string;
  mobile: string;
  type: string;
  balance: string;
}

interface PartiesTableProps {
  selectedCategories: string[];
  searchTerm?: string;
}

// Tolerant field readers — the API may return either the write shape
// (partyName/mobileNo) or a mapped read shape (name/mobileNumber).
const partyName = (p: any): string => p.partyName || p.name || "";
const partyMobile = (p: any): string => p.mobileNo || p.mobileNumber || "";
const partyCategoryName = (p: any): string =>
  p.partyCatagory?.catagory || p.partyCatagory?.name || (typeof p.partyCatagory === "string" ? p.partyCatagory : "") || "";

export const PartiesTable: React.FC<PartiesTableProps> = ({
  selectedCategories,
  searchTerm = "",
}) => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetPartiesQuery(undefined);
  const partiesData = data?.data || [];

  const query = searchTerm.trim().toLowerCase();
  const filteredParties = partiesData.filter((p: any) => {
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(p.partyCatagory?.id ?? p.partyCatagory);
    const matchesSearch =
      !query ||
      partyName(p).toLowerCase().includes(query) ||
      partyMobile(p).toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const parties: Party[] = filteredParties.map((party: any) => ({
    name: partyName(party) || "-",
    category: partyCategoryName(party) || "-",
    mobile: partyMobile(party) || "-",
    type: party.partyType === "CUSTOMER" ? "Customer" : "Supplier",
    balance: `${party.openingBalanceType === "TO_COLLECT" ? "+" : "-"} ₹${(
      party.openingBalance || 0
    ).toLocaleString("en-IN")}`,
  }));

  const columns: Column<Party>[] = [
    { header: "Party Name", accessor: "name" },
    { header: "Category", accessor: "category" },
    { header: "Mobile Number", accessor: "mobile" },
    {
      header: "Party Type",
      accessor: "type",
      render: (value: string) => (
        <Badge variant={value === "Customer" ? "info" : "success"}>{value}</Badge>
      ),
    },
    {
      header: "Balance",
      accessor: "balance",
      render: (value: string) => (
        <span
          className={`secondary-font ${
            value.startsWith("+") ? "text-green-600" : "text-red-500"
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  return (
    <div className="py-4 sm:py-6">
      <h2 className="text-lg primary-font text-gray-900 mb-4">Parties List</h2>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="h-5 bg-gray-200 animate-pulse rounded col-span-1" />
              <div className="h-5 bg-gray-200 animate-pulse rounded col-span-1" />
              <div className="h-5 bg-gray-200 animate-pulse rounded col-span-1" />
              <div className="h-5 bg-gray-200 animate-pulse rounded col-span-1" />
              <div className="h-5 bg-gray-200 animate-pulse rounded col-span-1" />
              <div className="h-5 bg-gray-200 animate-pulse rounded col-span-1" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="text-center secondary-font text-red-500 py-4">Failed to load parties.</p>
      ) : (
        <Table
          columns={columns}
          data={parties}
          emptyMessage="No parties available"
          rowClick={(rowIndex) => {
            const selectedParty = filteredParties[rowIndex];
            navigate(`/party/${selectedParty.id}`);
          }}
        />
      )}
    </div>
  );
};
