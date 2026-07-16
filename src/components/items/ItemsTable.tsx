import { Table } from "../Table/Table";
import type { Column } from "../Table/Table";
import { useNavigate } from "react-router-dom";
import { FaBoxes, FaBox, FaArrowDown } from "react-icons/fa";
import { useState } from "react";
import AdjustStockModal from "./AdjustStockModal";
import { Badge } from "../UI/Badge";
import { Shimmer } from "../UI/Shimmer";

interface Item {
  name: string;
  code: string;
  category: string;
  salePrice: string;
  purchasePrice: string;
}

interface ItemsTableProps {
  items: any[];
  isLoading: boolean;
  isError: boolean;
}

export const ItemsTable: React.FC<ItemsTableProps> = ({
  items: itemsData,
  isLoading,
  isError,
}) => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);

  // Filtering/search happen server-side now; render what the server returned.
  const filteredItemsData = itemsData;

  const items: Item[] = filteredItemsData.map((item: any) => ({
    name: item.itemName || item.serviceName || "-",
    code: item.itemCode || item.serviceCode || "-",
    category: item.category || "-",
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
              <Badge variant={type === "OLD" ? "neutral" : "success"}>
                {type}
              </Badge>
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
    <div className="secondary-font py-4 sm:py-6">
      <h2 className="text-xl primary-font text-gray-900 mb-4">Inventory List</h2>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Shimmer key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-center text-red-500 py-4">Failed to load items.</p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-16 text-center">
          <FaBoxes className="text-5xl text-yellow-500 mb-4" />
          <p className="text-lg primary-font text-gray-900 mb-2">
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
