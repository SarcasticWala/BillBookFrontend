import { useGetItemsQuery } from "../../features/item/itemApiSlice";
import { Table } from "../Table/Table";
import type { Column } from "../Table/Table";
import { useNavigate } from "react-router-dom";
import { FaBoxes, FaBox, FaArrowDown } from "react-icons/fa";
import { useState } from "react";
import AdjustStockModal from "./AdjustStockModal";

interface Item {
  name: string;
  code: string;
  category: string;
  salePrice: string;
  purchasePrice: string;
}

interface ItemsTableProps {
  selectedCategories: string[];
  showLowStockOnly: boolean;
  searchTerm: string;
}

export const ItemsTable: React.FC<ItemsTableProps> = ({
  selectedCategories,
  showLowStockOnly,
  searchTerm,
}) => {
  const { data, isLoading, isError } = useGetItemsQuery();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);

  const itemsData = data?.data || [];

  const filteredItemsData = itemsData.filter((item: any) => {
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(item.itemCatagory?.id);

    const matchesLowStock =
      !showLowStockOnly ||
      (item.isAlertEnabled && item.netQuantity <= item.productAlertValue);

    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !query ||
      item.itemName?.toLowerCase().includes(query) ||
      item.serviceName?.toLowerCase().includes(query) ||
      item.itemCode?.toLowerCase().includes(query) ||
      item.serviceCode?.toLowerCase().includes(query);

    return matchesCategory && matchesLowStock && matchesSearch;
  });

  const items: Item[] = filteredItemsData.map((item: any) => ({
    name: item.itemName || item.serviceName || "-",
    code: item.itemCode || item.serviceCode || "-",
    category: item.itemCatagory?.catagory || "-",
    salePrice: item.salePrice ? `₹${item.salePrice}` : "-",
    purchasePrice: item.purchasePrice ? `₹${item.purchasePrice}` : "-",
  }));

  const columns: Column<Item>[] = [
    {
      header: "Item Name",
      render: (_: any, _row: Item, rowIndex: number) => {
        const currentItem = filteredItemsData[rowIndex];
        const name = currentItem.itemName || currentItem.serviceName || "-";
        const type = currentItem.itemProductType || "NEW"; // fallback
        const isProduct = !!currentItem.itemName;

        return (
          <div className="flex items-center gap-2">
            <span>{name}</span>
            {isProduct && (
              <span
                className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                  type === "OLD"
                    ? "bg-gray-200 text-gray-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {type}
              </span>
            )}
          </div>
        );
      },
    },
    { header: "Item Code", accessor: "code" },
    { header: "Category", accessor: "category" },
    { header: "Sale Price", accessor: "salePrice" },
    { header: "Purchase Price", accessor: "purchasePrice" },
    {
      header: "Stock",
      render: (_: any, _row: Item, rowIndex: number) => {
        const currentItem = filteredItemsData[rowIndex];

        const isProduct = !!currentItem.itemName;
        const isNew = currentItem.itemProductType !== "OLD";
        const isLowStock =
          currentItem.isAlertEnabled &&
          currentItem.netQuantity <= currentItem.productAlertValue;

        return (
          <div className="flex items-center gap-2">
            {isProduct && isNew && (
              <FaBox
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItem(currentItem);
                  setOpenModal(true);
                }}
              />
            )}
            {isLowStock && (
              <FaArrowDown className="text-orange-500" title="Low Stock" />
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="py-6">
      <h2 className="text-lg font-semibold mb-4">Inventory List</h2>

      {isLoading ? (
        <div className="space-y-4">{/* Loading skeleton */}</div>
      ) : isError ? (
        <p className="text-center text-red-500 py-4">Failed to load items.</p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-16 text-center">
          <FaBoxes className="text-5xl text-yellow-500 mb-4" />
          <p className="text-lg font-semibold mb-2">
            Add all your Items at once!
          </p>
          <p className="text-sm text-gray-500 mb-6">
            For quicker and easier experience of creating sales invoices
          </p>
        </div>
      ) : (
        <Table
          columns={columns}
          data={items}
          emptyMessage="No items found."
          rowClick={(rowIndex) => {
            const selectedItem = filteredItemsData[rowIndex];
            const type = selectedItem.itemName ? "PRODUCT" : "SERVICE";
            navigate(`/items/inventory/${selectedItem.id}?itemType=${type}`);
          }}
        />
      )}

      {openModal && selectedItem && (
        <AdjustStockModal
          open={openModal}
          setOpen={setOpenModal}
          item={selectedItem}
        />
      )}
    </div>
  );
};
