import { useState } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiUser } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import { Button } from "../../../components/UI/Button";
import { Card } from "../../../components/UI/Card";
import { Input } from "../../../components/UI/Input";
import { newIdempotencyKey } from "../../../lib/idempotency";
import { useCreateTemplateMutation } from "../../../features/automatedBills/automatedBillApiSlice";
import { ItemSelectorModal } from "../sales/SalesInvoice/CreateSalesInvoice/ItemSelectorModal";
import { PartySelectorModal } from "../sales/SalesInvoice/CreateSalesInvoice/PartySelectorModal";

const FREQUENCIES = ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"] as const;
const inr = (v: unknown) => `₹${Number(v || 0).toFixed(2)}`;

// Same tax-inclusive-price math the Sales Invoice item picker uses.
function buildRow(it: any) {
  const taxRate = it.taxPercentage || 0;
  let pricePerItem = it.salePrice || 0;
  let taxAmount = 0;
  let totalAmount = 0;
  if (it.isSaleTaxApplicable) {
    const taxablePrice = parseFloat(((pricePerItem * 100) / (100 + taxRate)).toFixed(2));
    taxAmount = parseFloat(((taxablePrice * taxRate) / 100).toFixed(2));
    totalAmount = taxablePrice + taxAmount;
    pricePerItem = taxablePrice;
  } else {
    taxAmount = parseFloat(((pricePerItem * taxRate) / 100).toFixed(2));
    totalAmount = pricePerItem + taxAmount;
  }
  const quantity = it.quantity || 1;
  return {
    itemId: it.id,
    itemName: it.name,
    hsnCode: it.hsnCode || "",
    quantity,
    pricePerItem,
    taxAmount,
    taxPercentage: taxRate,
    totalAmount: parseFloat((totalAmount * quantity).toFixed(2)),
  };
}

export function CreateAutomatedBillForm({ onDone }: { onDone: () => void }) {
  const [party, setParty] = useState<{ id: string; name: string } | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isPartyModalOpen, setPartyModalOpen] = useState(false);
  const [isItemModalOpen, setItemModalOpen] = useState(false);
  const [frequency, setFrequency] = useState<(typeof FREQUENCIES)[number]>("MONTHLY");
  const [startDate, setStartDate] = useState("");
  const [endMode, setEndMode] = useState<"NEVER" | "DATE" | "COUNT">("NEVER");
  const [endDate, setEndDate] = useState("");
  const [occurrenceCount, setOccurrenceCount] = useState(1);
  const [autoPost, setAutoPost] = useState(false);

  const [createTemplate, { isLoading }] = useCreateTemplateMutation();
  const total = items.reduce((a, r) => a + r.totalAmount, 0);

  const handleSubmit = async () => {
    if (!party) return toast.error("Select a party");
    if (!items.length) return toast.error("Add at least one item");
    if (!startDate) return toast.error("Pick a start date");

    try {
      await createTemplate({
        partyId: party.id,
        itemDetails: items,
        frequency,
        startDate,
        endDate: endMode === "DATE" ? endDate : undefined,
        occurrenceCount: endMode === "COUNT" ? occurrenceCount : undefined,
        autoPost,
        __idempotencyKey: newIdempotencyKey(),
      }).unwrap();
      toast.success("Recurring bill template created");
      onDone();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create template");
    }
  };

  return (
    <Card className="p-4 sm:p-6 space-y-5">
      <ItemSelectorModal
        isOpen={isItemModalOpen}
        onClose={() => setItemModalOpen(false)}
        onSelect={(sel) => setItems((prev) => [...prev, ...sel.map(buildRow)])}
      />
      <PartySelectorModal
        isOpen={isPartyModalOpen}
        onClose={() => setPartyModalOpen(false)}
        onSelect={(p) => setParty({ id: p.id, name: p.partyName || p.name })}
      />

      <div>
        <label className="input-label">Party</label>
        {party ? (
          <div className="mt-1 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="flex items-center gap-2 text-sm">
              <FiUser /> {party.name}
            </span>
            <Button variant="outline" size="sm" onClick={() => setPartyModalOpen(true)}>
              Change
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="mt-1" onClick={() => setPartyModalOpen(true)}>
            <FiUser /> Select Party
          </Button>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="input-label">Line Items</label>
          <Button variant="outline" size="sm" onClick={() => setItemModalOpen(true)}>
            <FiPlus /> Add Item
          </Button>
        </div>
        <div className="mt-2 space-y-1.5">
          {items.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-sm rounded-lg border border-slate-200 px-3 py-2"
            >
              <span>
                {r.itemName} × {r.quantity}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-medium">{inr(r.totalAmount)}</span>
                <button onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}>
                  <FaTrash size={12} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
          {items.length > 0 && (
            <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
              <span className="primary-font">Total per bill</span>
              <span className="primary-font text-primary">{inr(total)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="input-label">Frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as any)}
            className="input-field mt-1"
          >
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {f.charAt(0) + f.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Start Date"
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div>
        <label className="input-label">Ends</label>
        <div className="mt-1 flex flex-wrap gap-4 text-sm">
          {(["NEVER", "DATE", "COUNT"] as const).map((m) => (
            <label key={m} className="flex items-center gap-1.5">
              <input type="radio" checked={endMode === m} onChange={() => setEndMode(m)} />
              {m === "NEVER" ? "Never" : m === "DATE" ? "On date" : "After N bills"}
            </label>
          ))}
        </div>
        {endMode === "DATE" && (
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field mt-2"
          />
        )}
        {endMode === "COUNT" && (
          <input
            type="number"
            min={1}
            value={occurrenceCount}
            onChange={(e) => setOccurrenceCount(Math.max(1, Number(e.target.value) || 1))}
            className="input-field mt-2 w-32"
          />
        )}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={autoPost} onChange={(e) => setAutoPost(e.target.checked)} />
        Auto-post each generated bill (unchecked = review as a draft first)
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button loading={isLoading} onClick={handleSubmit}>
          Create Template
        </Button>
      </div>
    </Card>
  );
}
