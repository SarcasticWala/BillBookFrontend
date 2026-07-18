import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { Input } from "../UI/Input";
import { Select } from "../UI/Select";
import { Textarea } from "../UI/Textarea";
import { Button } from "../UI/Button";
import { PageHeader } from "../UI/PageHeader";
import { FormSection } from "../UI/FormSection";
import { useGetPartiesQuery } from "../../features/party/partyApiSlice";
import { useGetItemsQuery } from "../../features/item/itemApiSlice";
import { useCreateDocumentMutation } from "../../features/document/documentApiSlice";

interface Row {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  taxRate: number;
}

interface DocumentFormProps {
  type: string; // e.g. "QUOTATION"
  title: string; // e.g. "Quotation"
  backTo: string; // list route
  numberPrefix: string; // e.g. "QUO"
  partyLabel?: string; // "Customer" | "Supplier"
}

const emptyRow: Row = { itemId: "", name: "", quantity: 1, price: 0, taxRate: 0 };
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const today = () => new Date().toISOString().slice(0, 10);

const DocumentForm: React.FC<DocumentFormProps> = ({
  type,
  title,
  backTo,
  numberPrefix,
  partyLabel = "Party",
}) => {
  const navigate = useNavigate();
  const { data: partiesRes } = useGetPartiesQuery(undefined);
  const { data: itemsRes } = useGetItemsQuery();
  const [createDocument, { isLoading }] = useCreateDocumentMutation();

  const parties: any[] = partiesRes?.data || [];
  const items: any[] = itemsRes?.data || [];

  const [partyId, setPartyId] = useState("");
  const [docNo, setDocNo] = useState(`${numberPrefix}-${today().replace(/-/g, "").slice(2)}`);
  const [docDate, setDocDate] = useState(today());
  const [rows, setRows] = useState<Row[]>([{ ...emptyRow }]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const partyOptions = parties.map((p) => ({
    value: p.id,
    label: p.partyName || p.name || "(unnamed)",
  }));
  const itemOptions = items.map((it) => ({
    value: it.id,
    label: it.itemName || it.serviceName || "(item)",
  }));

  const updateRow = (idx: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const onSelectItem = (idx: number, itemId: string) => {
    const it = items.find((x) => x.id === itemId);
    if (!it) return updateRow(idx, { itemId: "", name: "" });
    updateRow(idx, {
      itemId,
      name: it.itemName || it.serviceName || "",
      price: Number(it.salePrice) || 0,
      taxRate: Number(it.gstRate?.value) || 0,
    });
  };

  const addRow = () => setRows((prev) => [...prev, { ...emptyRow }]);
  const removeRow = (idx: number) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

  const totals = useMemo(() => {
    let subTotal = 0;
    let totalTax = 0;
    rows.forEach((r) => {
      const amount = round2(r.quantity * r.price);
      subTotal += amount;
      totalTax += round2((amount * r.taxRate) / 100);
    });
    subTotal = round2(subTotal);
    totalTax = round2(totalTax);
    return { subTotal, totalTax, grandTotal: round2(subTotal + totalTax) };
  }, [rows]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!partyId) e.partyId = `${partyLabel} is required`;
    if (!docNo.trim()) e.docNo = "Number is required";
    if (!docDate) e.docDate = "Date is required";
    const validRows = rows.filter((r) => r.name.trim() && r.quantity > 0);
    if (!validRows.length) e.items = "Add at least one item with a quantity";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    try {
      await createDocument({
        type,
        docNo: docNo.trim(),
        docDate,
        partyId,
        notes: notes.trim(),
        items: rows
          .filter((r) => r.name.trim() && r.quantity > 0)
          .map((r) => ({
            itemId: r.itemId || null,
            name: r.name.trim(),
            quantity: r.quantity,
            price: r.price,
            taxRate: r.taxRate,
          })),
      }).unwrap();
      toast.success(`${title} created successfully`);
      navigate(backTo);
    } catch (err: any) {
      toast.error(err?.data?.message || `Failed to create ${title.toLowerCase()}`);
    }
  };

  return (
    <div className="secondary-font">
      <PageHeader
        title={`Create ${title}`}
        subtitle="Fill in the details below"
        onBack={() => navigate(backTo)}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(backTo)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" form="document-form" loading={isLoading}>
              {isLoading ? "Saving..." : `Save ${title}`}
            </Button>
          </>
        }
      />

      <form
        id="document-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5 max-w-5xl"
      >
        {/* Header details */}
        <FormSection title="Document Details" layout="plain">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-4">
            <Select
              label={partyLabel}
              value={partyId}
              onChange={(e) => {
                setPartyId(e.target.value);
                setErrors((p) => ({ ...p, partyId: "" }));
              }}
              options={partyOptions}
              placeholder={`Select ${partyLabel.toLowerCase()}`}
              error={errors.partyId}
              required
            />
            <Input
              label={`${title} Number`}
              value={docNo}
              onChange={(e) => setDocNo(e.target.value)}
              error={errors.docNo}
              required
            />
            <Input
              label="Date"
              type="date"
              value={docDate}
              onChange={(e) => setDocDate(e.target.value)}
              error={errors.docDate}
              required
            />
          </div>
        </FormSection>

        {/* Items */}
        <FormSection
          title="Items"
          layout="plain"
          aside={
            <Button type="button" variant="outline" size="sm" onClick={addRow}>
              <FiPlus /> Add Item
            </Button>
          }
        >
          {errors.items && (
            <p className="mb-3 text-sm text-red-500">{errors.items}</p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-2.5 pr-2 min-w-[220px]">Item</th>
                  <th className="py-2.5 px-2 w-20">Qty</th>
                  <th className="py-2.5 px-2 w-28">Price</th>
                  <th className="py-2.5 px-2 w-24">Tax %</th>
                  <th className="py-2.5 px-2 w-28 text-right">Amount</th>
                  <th className="py-2.5 pl-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => {
                  const amount = round2(
                    r.quantity * r.price * (1 + r.taxRate / 100)
                  );
                  return (
                    <tr key={idx} className="border-b border-gray-100 align-top">
                      <td className="py-2 pr-2">
                        <select
                          value={r.itemId}
                          onChange={(e) => onSelectItem(idx, e.target.value)}
                          className="input-field bg-white mb-1"
                        >
                          <option value="">Select item (optional)</option>
                          {itemOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <input
                          value={r.name}
                          onChange={(e) => updateRow(idx, { name: e.target.value })}
                          placeholder="Item name"
                          className="input-field"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min={0}
                          value={r.quantity}
                          onChange={(e) =>
                            updateRow(idx, { quantity: Number(e.target.value) })
                          }
                          className="input-field text-right"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min={0}
                          value={r.price}
                          onChange={(e) =>
                            updateRow(idx, { price: Number(e.target.value) })
                          }
                          className="input-field text-right"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min={0}
                          value={r.taxRate}
                          onChange={(e) =>
                            updateRow(idx, { taxRate: Number(e.target.value) })
                          }
                          className="input-field text-right"
                        />
                      </td>
                      <td className="py-2 px-2 text-right font-medium text-gray-800">
                        ₹{amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2 pl-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeRow(idx)}
                          className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] p-2 text-gray-400 hover:text-red-500 transition"
                          title="Remove"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mt-5">
            <div className="w-full max-w-xs rounded-xl bg-slate-50 border border-slate-200/80 p-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Sub Total</span>
                <span className="secondary-font text-gray-800">₹{totals.subTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span className="secondary-font text-gray-800">₹{totals.totalTax.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center pt-2.5 mt-0.5 border-t border-slate-200 text-gray-900">
                <span className="secondary-font">Grand Total</span>
                <span className="text-lg primary-font text-primary">₹{totals.grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </FormSection>

        {/* Notes */}
        <FormSection title="Notes" layout="plain">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Optional notes / terms"
            maxLength={500}
          />
        </FormSection>
      </form>
    </div>
  );
};

export default DocumentForm;
