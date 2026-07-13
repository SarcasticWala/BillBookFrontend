import { Dialog } from "@headlessui/react";
import { useState, useEffect } from "react";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { Select } from "../UI/Select";
import { Textarea } from "../UI/Textarea";
import { FaTimes } from "react-icons/fa";
import {
  useUpdateItemStockMutation,
  useGetItemByIdQuery,
  itemApi,
} from "../../features/item/itemApiSlice";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../app/store";

interface AdjustStockModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  item: {
    id: string;
    name: string;
    currentStock: number;
    itemName?: string;
    serviceName?: string;
    netQuantity?: number;
    itemSerialNo?: { id: string; serialNo: string }[];
    [key: string]: any;
  };
}

const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
  open,
  setOpen,
  item,
}) => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [actionType, setActionType] = useState("add");
  const [quantity, setQuantity] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [itemSerialNos, setItemSerialNos] = useState<string[]>([]);
  const [selectedSerials, setSelectedSerials] = useState<string[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  const [updateItemStock] = useUpdateItemStockMutation();

  // Subscribe to the latest item so netQuantity is always up-to-date
  const { data: latestItem } = useGetItemByIdQuery({
    id: item.id,
    itemType: item.itemName ? "PRODUCT" : "SERVICE",
  });

  const hasSerialisation = item?.hasSerialisation;
    // Array.isArray(item.itemSerialNo) && item.itemSerialNo.length > 0;

  useEffect(() => {
    if (hasSerialisation && actionType === "add") {
      setItemSerialNos((prev) =>
        Array.from({ length: quantity }, (_, i) => prev[i] || "")
      );
    } else {
      setItemSerialNos([]);
    }
  }, [quantity, hasSerialisation, actionType]);

  const handleSerialChange = (index: number, value: string) => {
    const updated = [...itemSerialNos];
    updated[index] = value;
    setItemSerialNos(updated);
  };

  const handleToggleSerialSelect = (serialNo: string) => {
    setSelectedSerials((prev) =>
      prev.includes(serialNo)
        ? prev.filter((s) => s !== serialNo)
        : [...prev, serialNo]
    );
  };

  const isSaveDisabled =
    (actionType === "add" &&
      (quantity <= 0 || itemSerialNos.some((s) => s.trim() === ""))) ||
    (actionType === "reduce" &&
      hasSerialisation &&
      selectedSerials.length === 0);

  const handleSave = async () => {
    try {
      const payload: any = {
        id: item.id,
        actionType,
        remarks,
        asOfDate: date,
        hasSerialisationOn: hasSerialisation,
      };

      if (actionType === "add") {
        if (quantity <= 0) {
          return toast.error("Quantity must be greater than 0.");
        }
        payload.quantity = quantity;
        if (hasSerialisation) {
          payload.itemSerialNos = itemSerialNos
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }

      if (actionType === "reduce") {
        if (hasSerialisation) {
          payload.itemSerialNos = selectedSerials;
          payload.quantity = payload.itemSerialNos.length;
        } else {
          if (quantity <= 0) {
            return toast.error("Quantity must be greater than 0.");
          }
          payload.quantity = quantity;
        }
      }

      const res: any = await updateItemStock(payload);

      if (res.data?.success) {
        toast.success("Stock updated successfully");

        // Optimistically update the cache
        dispatch(
          itemApi.util.updateQueryData("getItems", undefined, (draft: any) => {
            const found = draft.data.find((i: any) => i.id === item.id);
            if (found) {
              if (actionType === "add") {
                found.netQuantity = (found.netQuantity ?? 0) + payload.quantity;
              } else if (actionType === "reduce") {
                found.netQuantity = (found.netQuantity ?? 0) - payload.quantity;
              }
            }
          })
        );

        // Invalidate to ensure fresh fetch
        dispatch(itemApi.util.invalidateTags(["Item"]));

        setSelectedSerials([]);
        setItemSerialNos([]);
        setQuantity(0);
        setOpen(false);
      } else {
        toast.error(res.data?.message || "Error updating stock");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  // Always take the latest stock from the query
  const netQty = latestItem?.data?.netQuantity ?? item?.netQuantity ?? 0;

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="secondary-font bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b border-gray-200">
            <Dialog.Title className="text-lg primary-font text-gray-900">
              Adjust Stock Quantity
            </Dialog.Title>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center h-11 w-11 -mr-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          <div className="px-4 sm:px-6 py-5 space-y-5">
            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Select
                label="Action"
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
              >
                <option value="add">Add (+)</option>
                <option value="reduce">Reduce (-)</option>
              </Select>

              {actionType === "add" ||
              (actionType === "reduce" && !hasSerialisation) ? (
                <Input
                  label="Quantity"
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              ) : null}

              <Textarea
                label="Remarks (Optional)"
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                containerClassName={
                  actionType === "add" ? "md:col-span-2" : "col-span-2"
                }
              />
            </div>

            {/* Serial No. inputs */}
            {hasSerialisation && actionType === "add" && quantity > 0 && (
              <div>
                <label className="input-label">
                  IMEI number / Serial numbers
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {itemSerialNos.map((serial, index) => (
                    <Input
                      key={index}
                      type="text"
                      value={serial}
                      placeholder={`Serial ${index + 1}`}
                      onChange={(e) => handleSerialChange(index, e.target.value)}
                    />
                  ))}
                </div>
              </div>
            )}

            {hasSerialisation &&
              actionType === "reduce" &&
              (item.itemSerialNo ?? []).length > 0 && (
                <div>
                  <label className="input-label">
                    Select serials to remove
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {item.itemSerialNo?.map((serialObj) => (
                      <label
                        key={serialObj.id}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm cursor-pointer transition-colors ${
                          selectedSerials.includes(serialObj.serialNo)
                            ? "bg-red-50 border-red-400 text-red-700"
                            : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSerials.includes(serialObj.serialNo)}
                          onChange={() =>
                            handleToggleSerialSelect(serialObj.serialNo)
                          }
                        />
                        <span>{serialObj.serialNo}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="space-y-0.5">
              <p className="text-sm text-gray-600">
                Item Name:{" "}
                <strong className="text-gray-900">
                  {item?.itemName || item?.serviceName || item?.name}
                </strong>
              </p>
              <p className="text-sm text-gray-600">
                Current Stock:{" "}
                <strong className="text-gray-900">{netQty} PCS</strong>
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 sm:flex-none"
              >
                Close
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaveDisabled}
                className="flex-1 sm:flex-none"
              >
                Save
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AdjustStockModal;
