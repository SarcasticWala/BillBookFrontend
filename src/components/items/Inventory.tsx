import { MdAutoGraph, MdSearch } from "react-icons/md";
import { FaBoxOpen, FaTimes, FaFileExcel } from "react-icons/fa";
import { CategorySelector } from "../Category/CategorySelector";
import { Button } from "../UI/Button";
import { StatCard } from "../UI/StatCard";
import { useEffect, useState } from "react";
import { CreateItemModal } from "../UI/CreateItemModal";
import {
  useBulkCreateItemsMutation,
  useGetCategoriesQuery,
  useGetItemsPagedQuery,
} from "../../features/item/itemApiSlice";
import CreateItemCategoryModal from "../UI/CreateItemCategoryModal";
import { ItemsTable } from "../../components/items/ItemsTable";
import BulkUploadModal from "../UI/BulkUploadModal";
import { Pagination } from "../UI/Pagination";

const PAGE_SIZE = 10;

const Inventory = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedItemCategories, setSelectedItemCategories] = useState<
    string[]
  >([]);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const rotatingPlaceholders = ["Search item name", "Search item code"];

  const { data: categoriesData } = useGetCategoriesQuery();
  const itemCategoryOptions = categoriesData?.data || [];

  const [bulkItemUpload] = useBulkCreateItemsMutation();

  const handleItemUpload = async (formData: FormData) => {
    try {
      const res = await bulkItemUpload(formData).unwrap();
      return res;
    } catch (error: any) {
      throw error;
    }
  };

  const handleCategorySelect = (val: string) => {
    if (!selectedItemCategories.includes(val)) {
      setSelectedItemCategories([...selectedItemCategories, val]);
    }
  };

  const handleCategoryRemove = (id: string) => {
    setSelectedItemCategories(
      selectedItemCategories.filter((cid) => cid !== id)
    );
  };

  const [page, setPage] = useState(1);

  // Convert the selected category ids to names for the server filter
  // (items store their category as a name string).
  const categoryNames = selectedItemCategories
    .map((id) => itemCategoryOptions.find((c: any) => c.id === id)?.name)
    .filter(Boolean)
    .join(",");

  const {
    data: pagedResp,
    isLoading,
    isError,
  } = useGetItemsPagedQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    categories: categoryNames,
    lowStock: showLowStockOnly,
  });

  const items = pagedResp?.data?.items || [];
  const totalPages = pagedResp?.data?.totalPages || 1;
  const total = pagedResp?.data?.total || 0;
  const stockValue = pagedResp?.data?.stats?.stockValue || 0;
  const lowStockCount = pagedResp?.data?.stats?.lowStockCount || 0;

  // Reset to the first page whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, showLowStockOnly, selectedItemCategories.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % rotatingPlaceholders.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim().toLowerCase());
    }, 300); // Debounce after 300ms

    return () => clearTimeout(handler);
  }, [searchQuery]);

  return (
    <div className="secondary-font p-4 sm:p-6">
      <div className="mb-5 sm:mb-6 pr-10 md:pr-0">
        <h1 className="text-xl sm:text-2xl primary-font text-gray-900">Items</h1>
        <p className="text-sm light-font text-gray-500 mt-0.5">Manage your inventory, stock value and low-stock alerts</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <StatCard
          label="Stock Value"
          tone="primary"
          icon={<MdAutoGraph />}
          loading={isLoading}
          value={`₹${stockValue.toLocaleString("en-IN")}`}
        />
        <StatCard
          label="Low Stock"
          tone="warning"
          colorValue
          icon={<FaBoxOpen />}
          loading={isLoading}
          value={lowStockCount}
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative w-full sm:w-[240px]">
          <MdSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-gray-400" />
          <input
            type="text"
            name="inventory-search"
            placeholder={rotatingPlaceholders[placeholderIndex]}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <CategorySelector
          value=""
          onChange={handleCategorySelect}
          options={itemCategoryOptions}
          CreateModalComponent={CreateItemCategoryModal}
        />

        {/* Selected Category Chips */}
        <div className="flex flex-wrap gap-2">
          {selectedItemCategories.map((id) => {
            const category = itemCategoryOptions.find((c: any) => c.id === id);
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/15 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium"
              >
                {category?.name || category?.catagory || category?.label || "Unknown"}
                <button
                  onClick={() => handleCategoryRemove(id)}
                  aria-label="Remove filter"
                  className="inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-500 hover:bg-blue-100 hover:text-blue-800 transition-colors cursor-pointer"
                >
                  &times;
                </button>
              </span>
            );
          })}
        </div>

        <Button
          variant="outline"
          onClick={() => setShowLowStockOnly((prev) => !prev)}
          className="cursor-pointer"
        >
          {showLowStockOnly ? "Show All Items" : "Show Low Stock"}
        </Button>

        <div className="w-full sm:w-auto sm:ml-auto flex flex-wrap gap-2">
          {/* Bulk Upload trigger */}
          <Button
            variant="outline"
            onClick={() => setIsBulkModalOpen(true)}
            className="cursor-pointer flex-1 sm:flex-none justify-center"
          >
            <FaFileExcel />
            <span>Bulk Add Items</span>
          </Button>

          <BulkUploadModal
            isOpen={isBulkModalOpen}
            onClose={() => setIsBulkModalOpen(false)}
            onUpload={handleItemUpload}
            sampleFileName="bulk_item"
            title="Bulk Add Items"
            description="Upload items in bulk using an Excel sheet"
          />

          <Button
            variant="primary"
            onClick={() => setModalOpen(true)}
            className="cursor-pointer primary-font flex-1 sm:flex-none justify-center"
          >
            Create Item
          </Button>

          <CreateItemModal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
          />
        </div>
      </div>

      {/* Table */}
      <ItemsTable items={items} isLoading={isLoading} isError={isError} />
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
};

export default Inventory;
