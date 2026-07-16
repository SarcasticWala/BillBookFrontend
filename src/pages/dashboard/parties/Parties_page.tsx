import { PartiesTable } from "../../../components/Parties/PartiesTable";
import { PartiesHeader } from "../../../components/Parties/PartiesHeader";
import { Card } from "../../../components/UI/Card";
import { Pagination } from "../../../components/UI/Pagination";
import { useState } from "react";
import { useGetPartiesPagedQuery } from "../../../features/party/partyApiSlice";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";

const PAGE_SIZE = 10;

export const Parties_Page = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(searchTerm, 350);

  const { data: response, isLoading, isError } = useGetPartiesPagedQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    categories: selectedCategories.join(","),
  });

  const parties: any[] = response?.data?.items || [];
  const stats = response?.data?.stats || { count: 0, toCollect: 0, toPay: 0 };
  const totalPages = response?.data?.totalPages || 1;
  const total = response?.data?.total || 0;

  // Any filter change resets to the first page.
  const setSearch: React.Dispatch<React.SetStateAction<string>> = (v) => {
    setSearchTerm(v);
    setPage(1);
  };
  const setCategories: React.Dispatch<React.SetStateAction<string[]>> = (v) => {
    setSelectedCategories(v);
    setPage(1);
  };

  return (
    <div className="secondary-font space-y-6">
      <div>
        <h1 className="text-xl primary-font text-gray-900">Parties</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage your customers and suppliers
        </p>
      </div>

      <PartiesHeader
        selectedCategories={selectedCategories}
        setSelectedCategories={setCategories}
        searchTerm={searchTerm}
        setSearchTerm={setSearch}
        stats={stats}
        statsLoading={isLoading}
      />

      <Card>
        <PartiesTable parties={parties} isLoading={isLoading} isError={isError} />
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
export default Parties_Page;
