import { Dialog } from "@headlessui/react";
import { useState, useEffect } from "react";
import { Button } from "../UI/Button";
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
      <div className="fixed inset-0 bg-black/20" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-bold">
              Adjust Stock Quantity
            </Dialog.Title>
            <FaTimes
              className="cursor-pointer"
              onClick={() => setOpen(false)}
            />
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="input-label">Action</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="input-field w-full"
              >
                <option value="add">Add (+)</option>
                <option value="reduce">Reduce (-)</option>
              </select>
            </div>

            {actionType === "add" ||
            (actionType === "reduce" && !hasSerialisation) ? (
              <div>
                <label className="input-label">Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="input-field w-full"
                />
              </div>
            ) : null}

            <div
              className={actionType === "add" ? "md:col-span-2" : "col-span-2"}
            >
              <label className="input-label">Remarks (Optional)</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>

          {/* Serial No. inputs */}
          {hasSerialisation && actionType === "add" && quantity > 0 && (
            <div className="mt-4">
              <label className="font-medium text-sm mb-2 block">
                IMEI number / Serial numbers
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {itemSerialNos.map((serial, index) => (
                  <input
                    key={index}
                    type="text"
                    value={serial}
                    placeholder={`Serial ${index + 1}`}
                    onChange={(e) => handleSerialChange(index, e.target.value)}
                    className="input-field w-full"
                  />
                ))}
              </div>
            </div>
          )}

          {hasSerialisation &&
            actionType === "reduce" &&
            (item.itemSerialNo ?? []).length > 0 && (
              <div className="mt-4">
                <label className="font-medium text-sm mb-2 block">
                  Select serials to remove
                </label>
                <div className="flex flex-wrap gap-2">
                  {item.itemSerialNo?.map((serialObj) => (
                    <label
                      key={serialObj.id}
                      className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm cursor-pointer ${
                        selectedSerials.includes(serialObj.serialNo)
                          ? "bg-red-100 border-red-400 text-red-700"
                          : "bg-gray-100 border-gray-300"
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

          {/* Footer */}
          <div className="mt-4 flex justify-between items-center border-t pt-4">
            <div>
              <p className="text-sm text-gray-600">
                Item Name:{" "}
                <strong>
                  {item?.itemName || item?.serviceName || item?.name}
                </strong>
              </p>
              <p className="text-sm text-gray-600">
                Current Stock: <strong>{netQty} PCS</strong>
              </p>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
              <Button onClick={handleSave} disabled={isSaveDisabled}>
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
