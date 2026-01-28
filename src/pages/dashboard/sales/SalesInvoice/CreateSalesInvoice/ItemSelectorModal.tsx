import { Dialog } from "@headlessui/react";
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useGetItemsQuery } from "../../../../../features/item/itemApiSlice";
import {
  FaTimes,
  FaPlus,
  FaMinus,
  FaSearch,
  FaTag,
  FaBoxOpen,
  FaList,
  FaExclamationCircle,
  FaLayerGroup,
  FaCube,
  FaClipboardList,
} from "react-icons/fa";
import { RiMoneyRupeeCircleFill } from "react-icons/ri";
import { SerialSelectorModal } from "./SerialSelectorModal";
import { CreateItemModal } from "../../../../../components/UI/CreateItemModal";
import AdjustStockPurchaseModal from "../../../Purchace/PurchaseCreate/AdjustStockPurchaseModal";

export const ItemSelectorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect: (items: any[]) => void;
  onCreateNewItem?: () => void;
}> = ({ isOpen, onClose, onSelect }) => {
  const { data, isLoading, error, refetch } = useGetItemsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const items = data?.data || [];

  const location = useLocation();
  const isPurchasePage = location.pathname.includes("/purchase");

  const [search, setSearch] = useState("");
  const [isCreateItemModalOpen, setCreateItemModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<
    {
      id: string;
      name: string;
      hasSerialNo: boolean;
      quantity: number;
      serialNos: string[];
      salePrice: number;
      hsnCode?: string;
      taxPercentage?: number;
      isSaleTaxApplicable?: boolean;
      itemProductType?: string;
      purchasePrice?: number;
    }[]
  >([]);

  const [serialModalOpen, setSerialModalOpen] = useState(false);
  const [currentSerialItem, setCurrentSerialItem] = useState<any>(null);

  // refetch whenever modal opens
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    return items.filter((it: any) =>
      (it.itemName || it.serviceName || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [items, search]);

  if (!isOpen) return null;

  const openSerialModal = (item: any) => {
    setCurrentSerialItem(item);
    setSerialModalOpen(true);
  };

  const handleAddClick = (item: any) => {
    const existing = selectedItems.find((si) => si.id === item.id);

    if (item.hasSerialisation) {
      openSerialModal(item);
    } else {
      if (existing) {
        setSelectedItems((prev) =>
          prev.map((si) =>
            si.id === item.id ? { ...si, quantity: si.quantity + 1 } : si
          )
        );
      } else {
        setSelectedItems((prev) => [
          ...prev,
          {
            id: item.id,
            name: item.itemName || item.serviceName,
            hasSerialNo: false,
            quantity: 1,
            serialNos: [],
            salePrice: item.salePrice || 0,
            hsnCode: item.hsnCode || "",
            taxPercentage: item.gstRate?.value || 0,
          },
        ]);
      }
    }
  };

  const handleSerialSave = (serials: string[]) => {
    if (!currentSerialItem) return;

    setSelectedItems((prev) => {
      const existing = prev.find((si) => si.id === currentSerialItem.id);
      if (serials.length === 0) {
        return prev.filter((si) => si.id !== currentSerialItem.id);
      }
      if (existing) {
        return prev.map((si) =>
          si.id === currentSerialItem.id
            ? { ...si, serialNos: serials, quantity: serials.length }
            : si
        );
      } else {
        return [
          ...prev,
          {
            id: currentSerialItem.id,
            name: currentSerialItem.itemName || currentSerialItem.serviceName,
            hasSerialNo: true,
            quantity: serials.length,
            serialNos: serials,
            salePrice: currentSerialItem.salePrice || 0,
            hsnCode: currentSerialItem.hsnCode || "",
            taxPercentage: currentSerialItem.gstRate?.value || 0,
            isSaleTaxApplicable: currentSerialItem.isSaleTaxApplicable,
            itemProductType: currentSerialItem.itemProductType,
            purchasePrice: currentSerialItem.purchasePrice || 0,
          },
        ];
      }
    });

    setSerialModalOpen(false);
    setCurrentSerialItem(null);
  };

  const handleAdjustStockSave = (serials: string[], quantity: number) => {
    if (!currentSerialItem) return;

    setSelectedItems((prev) => {
      const existing = prev.find((si) => si.id === currentSerialItem.id);
      if (existing) {
        return prev.map((si) =>
          si.id === currentSerialItem.id
            ? { ...si, serialNos: serials, quantity }
            : si
        );
      }
      return [
        ...prev,
        {
          id: currentSerialItem.id,
          name: currentSerialItem.itemName || currentSerialItem.serviceName,
          hasSerialNo: true,
          quantity,
          serialNos: serials,
          salePrice: currentSerialItem.salePrice || 0,
          hsnCode: currentSerialItem.hsnCode || "",
          taxPercentage: currentSerialItem.gstRate?.value || 0,
          isSaleTaxApplicable: currentSerialItem.isSaleTaxApplicable,
          itemProductType: currentSerialItem.itemProductType,
          purchasePrice: currentSerialItem.purchasePrice || 0,
        },
      ];
    });

    setSerialModalOpen(false);
    setCurrentSerialItem(null);

    // refetch immediately so Stock shows updated
    refetch();
  };

  const handlePlusClick = (item: any) => {
    if (item.hasSerialisation) {
      openSerialModal(item);
    } else {
      setSelectedItems((prev) =>
        prev.map((si) =>
          si.id === item.id ? { ...si, quantity: si.quantity + 1 } : si
        )
      );
    }
  };

  const handleMinusClick = (itemId: string) => {
    const item = items.find((i: any) => i.id === itemId);
    if (item?.hasSerialisation) {
      if (item) openSerialModal(item);
    } else {
      setSelectedItems((prev) =>
        prev
          .map((si) =>
            si.id === itemId
              ? { ...si, quantity: Math.max(0, si.quantity - 1) }
              : si
          )
          .filter((si) => si.quantity > 0)
      );
    }
  };

  const finalizeSelection = () => {
    onSelect(selectedItems);
    setSelectedItems([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white max-w-4xl w-full rounded-xl shadow-2xl p-6 flex flex-col border border-gray-200 h-[80vh]">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FaClipboardList /> Select Items
            </h2>
            <button
              className="text-gray-500 hover:text-gray-800 transition"
              onClick={onClose}
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Search + Create */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-100">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-100 rounded-lg pl-10 pr-3 py-2 w-full text-sm outline-none"
              />
            </div>
            <button
              onClick={() => setCreateItemModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <span>
                <FaPlus />
              </span>{" "}
              <span>Create Item</span>
            </button>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg mb-4 bg-gray-50">
            {isLoading ? (
              <p className="p-4 text-gray-500 flex items-center gap-2">
                <FaLayerGroup /> Loading…
              </p>
            ) : error ? (
              <p className="p-4 text-red-500 flex items-center gap-2">
                <FaExclamationCircle /> Failed to load items
              </p>
            ) : filteredItems.length === 0 ? (
              <p className="p-4 text-gray-500 text-center flex items-center justify-center gap-2">
                <FaBoxOpen /> No items found
              </p>
            ) : (
              <ul>
                {filteredItems.map((it: any) => {
                  return (
                    <li
                      key={it.id}
                      className="p-3 border-b border-gray-200 flex justify-between items-center bg-white hover:bg-gray-50 transition"
                    >
                      <div>
                        <div className="font-medium flex items-center gap-2 text-gray-800">
                          <FaCube className="text-gray-500" />
                          {it.itemName || it.serviceName}
                          {it.hasSerialisation && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 text-xs rounded-full flex items-center gap-1">
                              <FaTag /> Serialized
                            </span>
                          )}
                          {it.itemProductType && (
                            <span
                              className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${
                                it.itemProductType === "NEW"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {it.itemProductType}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {it.itemName && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <FaList /> Stock: {it.netQuantity}
                            </div>
                          )}
                          {it.salePrice && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <RiMoneyRupeeCircleFill /> Price: {it.salePrice}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition"
                        onClick={() => handleAddClick(it)}
                      >
                        <FaPlus /> Add
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer Selected Items */}
          {selectedItems.length > 0 && (
            <div className="border-t border-gray-200 pt-3 mt-auto bg-white sticky bottom-0">
              {selectedItems.map((si) => (
                <div
                  key={si.id}
                  className="flex justify-between items-center text-sm py-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 flex items-center gap-2">
                      <FaCube /> {si.name}
                    </span>
                    {si.salePrice && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        - Price: {si.salePrice}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="p-1 border rounded-lg hover:bg-gray-100 transition"
                      onClick={() => handleMinusClick(si.id)}
                    >
                      <FaMinus />
                    </button>
                    <span className="font-medium text-gray-700">
                      {si.quantity}
                    </span>
                    <button
                      className="p-1 border rounded-lg hover:bg-gray-100 transition"
                      onClick={() =>
                        handlePlusClick(
                          items.find((i: any) => i.id === si.id) || si
                        )
                      }
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-end pt-3">
                <button
                  onClick={finalizeSelection}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-sm transition flex items-center gap-2"
                >
                  Add Items
                </button>
              </div>
            </div>
          )}
        </Dialog.Panel>
      </div>

      {/* Serial / AdjustStock Modal */}
      {currentSerialItem?.hasSerialisation &&
        (isPurchasePage ? (
          <AdjustStockPurchaseModal
            open={serialModalOpen}
            setOpen={setSerialModalOpen}
            item={currentSerialItem}
            onConfirm={handleAdjustStockSave}
          />
        ) : (
          <SerialSelectorModal
            isOpen={serialModalOpen}
            onClose={() => setSerialModalOpen(false)}
            serialNumbers={(currentSerialItem?.itemSerialNo || []).map(
              (s: any) => s.serialNo
            )}
            preSelected={
              selectedItems.find((si) => si.id === currentSerialItem?.id)
                ?.serialNos || []
            }
            selectedSerials={
              selectedItems.find((si) => si.id === currentSerialItem?.id)
                ?.serialNos || []
            }
            onConfirm={handleSerialSave}
          />
        ))}

      {/* Create Item Modal */}
      <CreateItemModal
        isOpen={isCreateItemModalOpen}
        onClose={() => setCreateItemModalOpen(false)}
      />
    </Dialog>
  );
};
