import { MdAutoGraph } from "react-icons/md";
import { FaBoxOpen, FaRupeeSign, FaTimes } from "react-icons/fa";
import { CategorySelector } from "../Category/CategorySelector";
import { Button } from "../UI/Button";
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
    <div className="p-6 min-h-screen">
      <h1 className="text-xl primary-font mb-6 text-gray-800">Items</h1>

      {/* Stat Cards */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="w-full md:w-1/2 bg-white p-4 rounded-md shadow-sm border border-gray-200 hover:border-blue-500 transition-all cursor-pointer">
          <div className="flex items-center gap-1 text-blue-600 mb-1">
            <MdAutoGraph className="text-base" />
            <p className="text-sm secondary-font">Stock Value</p>
          </div>
          <div className="flex items-baseline gap-1 text-black secondary-font text-lg">
            <FaRupeeSign className="text-base" />
            {isLoading ? (
              <StatSkeleton />
            ) : (
              <span>{stockValue.toLocaleString()}</span>
            )}
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-white p-4 rounded-md shadow-sm border border-gray-200 hover:border-yellow-500 transition-all cursor-pointer">
          <div className="flex items-center gap-1 text-yellow-500 mb-1">
            <FaBoxOpen className="text-base" />
            <p className="text-sm secondary-font">Low Stock</p>
          </div>
          <div className="text-black secondary-font text-lg">
            {isLoading ? <StatSkeleton /> : lowStockCount}
          </div>
        </div>
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
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
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
                className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
              >
                {category?.catagory || "Unknown"}
                <button
                  onClick={() => handleCategoryRemove(id)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  &times;
                </button>
              </span>
            );
          })}
        </div>

        <button
          onClick={() => setShowLowStockOnly((prev) => !prev)}
          className="bg-white light-font text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 transition cursor-pointer"
        >
          {showLowStockOnly ? "Show All Items" : "Show Low Stock"}
        </button>

        <div className="ml-auto flex gap-2">
          {/* Bulk Upload Button */}
          {/******************************  Bulk Upload Button ADD IN FUTURE *********************************/}
          {/* <button
            onClick={() => setIsBulkModalOpen(true)}
            className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-700 shadow-sm hover:bg-gray-100 flex gap-1 items-center cursor-pointer"
          >
            <FaFileExcel />
            <span className="light-font">Bulk Add Items</span>
          </button> */}

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
            className="cursor-pointer primary-font"
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
