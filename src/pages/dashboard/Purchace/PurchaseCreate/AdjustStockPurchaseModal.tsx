import { Dialog } from "@headlessui/react";
import { useState, useEffect } from "react";
import { Button } from "../../../../components/UI/Button";
import { FaTimes } from "react-icons/fa";

interface AdjustStockPurchaseModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  item: any;
  onConfirm: (serials: string[], quantity: number) => void;
}

const AdjustStockPurchaseModal: React.FC<AdjustStockPurchaseModalProps> = ({
  open,
  setOpen,
  item,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState(0);
  const [itemSerialNos, setItemSerialNos] = useState<string[]>([]);

  const hasSerialisation = item?.hasSerialisation;

  useEffect(() => {
    if (hasSerialisation && quantity > 0) {
      setItemSerialNos((prev) =>
        Array.from({ length: quantity }, (_, i) => prev[i] || "")
      );
    } else {
      setItemSerialNos([]);
    }
  }, [quantity, hasSerialisation]);

  const handleSave = () => {
    const serials = hasSerialisation
      ? itemSerialNos.map((s) => s.trim()).filter(Boolean)
      : [];
    onConfirm(serials, quantity);
    setQuantity(0);
    setItemSerialNos([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/20" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-bold">
              Add Stock for Purchase
            </Dialog.Title>
            <FaTimes className="cursor-pointer" onClick={() => setOpen(false)} />
          </div>

          <div className="space-y-3">
            <label className="block text-sm">Quantity</label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="input-field w-full"
            />
            {hasSerialisation && quantity >= 1 ? (
              <div>
                <label className="block text-sm">Serial Numbers</label>
                <div className="grid grid-cols-2 gap-2">
                  {itemSerialNos.map((s, i) => (
                    <input
                      key={i}
                      type="text"
                      value={s}
                      placeholder={`Serial ${i + 1}`}
                      onChange={(e) => {
                        const copy = [...itemSerialNos];
                        copy[i] = e.target.value;
                        setItemSerialNos(copy);
                      }}
                      className="input-field"
                    />
                  ))}
                </div>
              </div> 
            ): null}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
                setQuantity(0);
                setItemSerialNos([]);
                setOpen(false);
              }}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={quantity <= 0}>
              Save
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AdjustStockPurchaseModal;