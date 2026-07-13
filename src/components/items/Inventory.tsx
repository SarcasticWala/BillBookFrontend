import { MdAutoGraph } from "react-icons/md";
import { FaBoxOpen, FaRupeeSign, FaTimes, FaFileExcel } from "react-icons/fa";
import { CategorySelector } from "../Category/CategorySelector";
import { Button } from "../UI/Button";
import { Card } from "../UI/Card";
import { useEffect, useState } from "react";
import { CreateItemModal } from "../UI/CreateItemModal";
import {
  useBulkCreateItemsMutation,
  useGetCategoriesQuery,
} from "../../features/item/itemApiSlice";
import CreateItemCategoryModal from "../UI/CreateItemCategoryModal";
import { ItemsTable } from "../../components/items/ItemsTable";
import BulkUploadModal from "../UI/BulkUploadModal";
import { useGetItemsQuery } from "../../features/item/itemApiSlice";

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

  const { data: itemsData, isLoading } = useGetItemsQuery();
  const items = itemsData?.data || [];

  const stockValue = items.reduce((acc: number, item: any) => {
    const isProduct = !!item.itemName; // products only
    if (isProduct && item.netQuantity && item.salePrice) {
      return acc + item.netQuantity * item.salePrice;
    }
    return acc;
  }, 0);

  const lowStockCount = items.filter(
    (item: any) =>
      item.isAlertEnabled && item.netQuantity <= item.productAlertValue
  ).length;

  const StatSkeleton = () => (
    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
  );

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
      <h1 className="text-xl primary-font mb-5 sm:mb-6 text-gray-900">Items</h1>

      {/* Stat Cards */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Card className="w-full md:w-1/2">
          <div className="flex items-center gap-1.5 text-primary mb-1">
            <MdAutoGraph className="text-base" />
            <p className="text-sm secondary-font">Stock Value</p>
          </div>
          <div className="flex items-baseline gap-1 text-gray-900 primary-font text-xl">
            <FaRupeeSign className="text-base" />
            {isLoading ? (
              <StatSkeleton />
            ) : (
              <span>{stockValue.toLocaleString("en-IN")}</span>
            )}
          </div>
        </Card>

        <Card className="w-full md:w-1/2">
          <div className="flex items-center gap-1.5 text-yellow-500 mb-1">
            <FaBoxOpen className="text-base" />
            <p className="text-sm secondary-font">Low Stock</p>
          </div>
          <div className="text-gray-900 primary-font text-xl">
            {isLoading ? <StatSkeleton /> : lowStockCount}
          </div>
        </Card>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative w-full sm:w-[200px]">
          <input
            type="text"
            name="inventory-search"
            placeholder={rotatingPlaceholders[placeholderIndex]}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                className="flex items-center bg-blue-50 text-primary border border-blue-100 px-2.5 py-1 rounded-full text-sm secondary-font"
              >
                {category?.catagory || "Unknown"}
                <button
                  onClick={() => handleCategoryRemove(id)}
                  className="ml-2 text-primary hover:text-primary-hover cursor-pointer"
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
      <ItemsTable
        selectedCategories={selectedItemCategories}
        showLowStockOnly={showLowStockOnly}
        searchTerm={debouncedSearch}
      />
    </div>
  );
};

export default Inventory;
