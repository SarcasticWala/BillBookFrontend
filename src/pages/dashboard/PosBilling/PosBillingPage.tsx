import { useState, useRef, useMemo, lazy, Suspense } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiUser, FiX } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import { MdPointOfSale } from "react-icons/md";
import { Button } from "../../../components/UI/Button";
import { Card } from "../../../components/UI/Card";
import { Table, type Column } from "../../../components/Table/Table";
import { newIdempotencyKey } from "../../../lib/idempotency";
import { useGetAccountsQuery } from "../../../features/account/accountApiSlice";
import { useGetMeQuery } from "../../../features/auth/authApiSlice";
import { useCheckoutPosMutation } from "../../../features/pos/posApiSlice";
import { ItemSelectorModal } from "../sales/SalesInvoice/CreateSalesInvoice/ItemSelectorModal";
import { PartySelectorModal } from "../sales/SalesInvoice/CreateSalesInvoice/PartySelectorModal";

// @react-pdf/renderer is large — only load it once a receipt is actually shown.
const PosReceiptModal = lazy(() =>
  import("../../../components/pos/PosReceiptModal").then((m) => ({
    default: m.PosReceiptModal,
  }))
);

interface CartRow {
  itemId: string;
  itemName: string;
  hsnCode: string;
  quantity: number;
  pricePerItem: number;
  actualPricePerItem: number;
  taxAmount: number;
  taxPercentage: number;
  totalAmount: number;
  isSaleTaxApplicable: boolean;
  isPreowned: boolean;
  purchasePrice: number;
  availableStock: number | null;
}

const inr = (v: unknown) => `₹${Number(v || 0).toFixed(2)}`;

// Mirrors the same tax-inclusive-price math the regular Sales Invoice item
// picker uses (CreateSalesInvoices.tsx) so a POS line and a Sales line for
// the same item price to the exact same total.
function buildRow(it: any): CartRow {
  const isPreowned = it.itemProductType === "OLD";
  const taxRate = it.taxPercentage || 0;
  const purchasePrice = it.purchasePrice || 0;
  const quantity = it.quantity || 1;
  let pricePerItem = it.salePrice || 0;
  let taxAmount = 0;
  let totalAmount = 0;

  if (isPreowned) {
    const profit = Math.max(pricePerItem - purchasePrice, 0);
    taxAmount = parseFloat(((profit * taxRate) / 100).toFixed(2));
    totalAmount = pricePerItem + taxAmount;
  } else if (it.isSaleTaxApplicable) {
    const taxablePrice = parseFloat(((pricePerItem * 100) / (100 + taxRate)).toFixed(2));
    taxAmount = parseFloat(((taxablePrice * taxRate) / 100).toFixed(2));
    totalAmount = taxablePrice + taxAmount;
    pricePerItem = taxablePrice;
  } else {
    taxAmount = parseFloat(((pricePerItem * taxRate) / 100).toFixed(2));
    totalAmount = pricePerItem + taxAmount;
  }

  return {
    itemId: it.id,
    itemName: it.name,
    hsnCode: it.hsnCode || "",
    quantity,
    pricePerItem,
    actualPricePerItem: pricePerItem,
    taxAmount,
    taxPercentage: taxRate,
    totalAmount: parseFloat((totalAmount * quantity).toFixed(2)),
    isSaleTaxApplicable: Boolean(it.isSaleTaxApplicable),
    isPreowned,
    purchasePrice,
    availableStock: Number.isFinite(Number(it.stock)) ? Number(it.stock) : null,
  };
}

/** Recomputes a row's tax/total after its quantity or price changes. */
function recomputeRow(row: CartRow, quantity: number, pricePerItem: number): CartRow {
  const perItemTax = row.isPreowned
    ? parseFloat(((Math.max(pricePerItem - row.purchasePrice, 0) * row.taxPercentage) / 100).toFixed(2))
    : parseFloat(((pricePerItem * row.taxPercentage) / 100).toFixed(2));
  const perItemTotal = pricePerItem + perItemTax;
  return {
    ...row,
    quantity,
    pricePerItem,
    taxAmount: perItemTax,
    totalAmount: parseFloat((perItemTotal * quantity).toFixed(2)),
  };
}

const PosBillingPage = () => {
  const [cart, setCart] = useState<CartRow[]>([]);
  const [isItemModalOpen, setItemModalOpen] = useState(false);
  const [isPartyModalOpen, setPartyModalOpen] = useState(false);
  const [party, setParty] = useState<{ id: string; name: string } | null>(null);
  const [discountAfterTax, setDiscountAfterTax] = useState(0);
  const [splits, setSplits] = useState<{ accountId: string; amount: string }[]>([]);
  const [receipt, setReceipt] = useState<any | null>(null);

  const { data: accountsData } = useGetAccountsQuery(undefined);
  const accounts: any[] = accountsData?.data || [];
  const { data: meData } = useGetMeQuery();
  const business = meData?.data || {};

  const [checkoutPos, { isLoading: checkingOut }] = useCheckoutPosMutation();
  const idempotencyKey = useRef(newIdempotencyKey());

  const taxable = useMemo(
    () => cart.reduce((a, r) => a + (r.pricePerItem || 0) * (r.quantity || 1), 0),
    [cart]
  );
  const tax = useMemo(
    () => cart.reduce((a, r) => a + (r.taxAmount || 0) * (r.quantity || 1), 0),
    [cart]
  );
  const grandTotal = useMemo(
    () =>
      Math.max(
        0,
        parseFloat(
          (cart.reduce((a, r) => a + (r.totalAmount || 0), 0) - discountAfterTax).toFixed(2)
        )
      ),
    [cart, discountAfterTax]
  );

  const splitTotal = splits.reduce((a, s) => a + (Number(s.amount) || 0), 0);
  const remaining = parseFloat((grandTotal - splitTotal).toFixed(2));

  const updateRow = (index: number, quantity: number, pricePerItem: number) => {
    setCart((prev) =>
      prev.map((r, i) => (i === index ? recomputeRow(r, quantity, pricePerItem) : r))
    );
  };

  const removeRow = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const addSplit = () => {
    if (!accounts.length) {
      toast.error("Set up a Cash or Bank account first");
      return;
    }
    setSplits((prev) => [
      ...prev,
      { accountId: accounts[0].id, amount: remaining > 0 ? String(remaining) : "" },
    ]);
  };

  const resetSale = () => {
    setCart([]);
    setParty(null);
    setDiscountAfterTax(0);
    setSplits([]);
    idempotencyKey.current = newIdempotencyKey();
  };

  const handleCheckout = async () => {
    if (!cart.length) {
      toast.error("Add at least one item");
      return;
    }
    if (!splits.length) {
      toast.error("Add at least one payment");
      return;
    }
    if (Math.abs(remaining) > 0.01) {
      toast.error(
        remaining > 0
          ? `₹${remaining.toFixed(2)} still due — POS sales must be paid in full`
          : `Payment exceeds the total by ₹${Math.abs(remaining).toFixed(2)}`
      );
      return;
    }

    try {
      const res = await checkoutPos({
        itemDetails: cart,
        discountAfterTax,
        partyId: party?.id,
        payments: splits.map((s) => ({ accountId: s.accountId, amount: Number(s.amount) })),
        __idempotencyKey: idempotencyKey.current,
      }).unwrap();

      const inv = res?.data;
      toast.success(`Sale completed — ${inv?.invioceNo || ""}`);
      setReceipt({
        invoiceNo: inv?.invioceNo || "-",
        invoiceDate: inv?.invioceDate,
        partyName: party?.name || "Walk-in Customer",
        items: cart.map((r) => ({
          itemName: r.itemName,
          quantity: r.quantity,
          pricePerItem: r.pricePerItem,
          totalAmount: r.totalAmount,
        })),
        taxable,
        tax,
        total: grandTotal,
        payments: splits.map((s) => ({
          accountName: accounts.find((a) => a.id === s.accountId)?.name,
          amount: Number(s.amount),
        })),
        businessName: business.businessName || business.name,
        gstin: business.gstin,
      });
      resetSale();
    } catch (err: any) {
      toast.error(err?.data?.message || "Checkout failed. Please try again.");
    }
  };

  const columns: Column<CartRow>[] = [
    { header: "Item", accessor: "itemName" },
    {
      header: "Qty",
      render: (_v, row, index) => (
        <input
          type="number"
          min={1}
          value={row.quantity}
          onChange={(e) => updateRow(index, Math.max(1, Number(e.target.value) || 1), row.pricePerItem)}
          className="w-16 rounded px-1 py-0.5 text-right bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary text-base xl:text-[13px]"
        />
      ),
    },
    {
      header: "Price/Item",
      render: (_v, row, index) => (
        <input
          type="number"
          value={row.pricePerItem}
          onChange={(e) => updateRow(index, row.quantity, Number(e.target.value) || 0)}
          className="w-24 rounded px-1 py-0.5 text-right bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary text-base xl:text-[13px]"
        />
      ),
    },
    {
      header: "Tax",
      render: (_v, row) => (
        <div className="text-right text-gray-600">
          {inr(row.taxAmount * row.quantity)}{" "}
          <span className="text-gray-400">({row.taxPercentage}%)</span>
        </div>
      ),
    },
    {
      header: "Amount",
      render: (_v, row) => <div className="text-right font-medium">{inr(row.totalAmount)}</div>,
    },
    {
      header: "",
      render: (_v, _row, index) => (
        <button
          type="button"
          onClick={() => removeRow(index)}
          className="text-red-500 hover:text-red-700 p-2.5 xl:p-1"
        >
          <FaTrash size={13} />
        </button>
      ),
    },
  ];

  return (
    <div className="secondary-font">
      <ItemSelectorModal
        isOpen={isItemModalOpen}
        onClose={() => setItemModalOpen(false)}
        onSelect={(items) => setCart((prev) => [...prev, ...items.map(buildRow)])}
      />
      <PartySelectorModal
        isOpen={isPartyModalOpen}
        onClose={() => setPartyModalOpen(false)}
        onSelect={(p) => setParty({ id: p.id, name: p.partyName || p.name })}
      />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <MdPointOfSale className="text-2xl text-primary" />
          <h1 className="text-xl primary-font text-gray-900">POS Billing</h1>
        </div>
        <div>
          {party ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary text-sm px-3 py-1.5">
              <FiUser /> {party.name}
              <button onClick={() => setParty(null)} aria-label="Remove party">
                <FiX />
              </button>
            </span>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setPartyModalOpen(true)}>
              <FiUser /> Add GST Party (optional)
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg primary-font text-gray-800">Cart</h2>
              <Button size="sm" onClick={() => setItemModalOpen(true)}>
                <FiPlus /> Scan / Add Item
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                data={cart}
                emptyMessage="Scan a barcode or search to add items"
              />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg primary-font text-gray-800 mb-3">Summary</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Taxable Amount</span>
                <span>{inr(taxable)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{inr(tax)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Discount</span>
                <input
                  type="number"
                  min={0}
                  value={discountAfterTax}
                  onChange={(e) => setDiscountAfterTax(Math.max(0, Number(e.target.value) || 0))}
                  className="w-24 rounded px-2 py-1 text-right bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="primary-font text-gray-900">Total</span>
                <span className="text-lg primary-font text-primary">{inr(grandTotal)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg primary-font text-gray-800">Payment</h2>
              <Button variant="outline" size="sm" onClick={addSplit}>
                <FiPlus /> Split
              </Button>
            </div>
            <div className="space-y-2">
              {splits.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={s.accountId}
                    onChange={(e) =>
                      setSplits((prev) =>
                        prev.map((sp, idx) => (idx === i ? { ...sp, accountId: e.target.value } : sp))
                      )
                    }
                    className="flex-1 rounded-lg border border-gray-200 px-2 py-2 text-sm bg-white"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.type})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={s.amount}
                    onChange={(e) =>
                      setSplits((prev) =>
                        prev.map((sp, idx) => (idx === i ? { ...sp, amount: e.target.value } : sp))
                      )
                    }
                    placeholder="Amount"
                    className="w-28 rounded-lg border border-gray-200 px-2 py-2 text-sm text-right"
                  />
                  <button
                    type="button"
                    onClick={() => setSplits((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-red-500 hover:text-red-700 p-2.5 xl:p-1"
                  >
                    <FaTrash size={13} />
                  </button>
                </div>
              ))}
              {!splits.length && (
                <p className="text-sm text-gray-400">
                  Add a payment split (cash, UPI, card…) — POS sales are paid in full at checkout.
                </p>
              )}
            </div>
            {splits.length > 0 && (
              <div
                className={`flex justify-between items-center mt-3 rounded-xl px-4 py-3 text-sm border ${
                  Math.abs(remaining) < 0.01
                    ? "bg-emerald-50 border-emerald-200/70"
                    : "bg-amber-50 border-amber-200/70"
                }`}
              >
                <span className="secondary-font">
                  {Math.abs(remaining) < 0.01 ? "Fully paid" : remaining > 0 ? "Remaining" : "Excess"}
                </span>
                <span className="primary-font">{inr(Math.abs(remaining))}</span>
              </div>
            )}
          </Card>

          <Button
            fullWidth
            size="lg"
            loading={checkingOut}
            disabled={!cart.length || !splits.length}
            onClick={handleCheckout}
          >
            Complete Sale — {inr(grandTotal)}
          </Button>
        </div>
      </div>

      {receipt && (
        <Suspense fallback={null}>
          <PosReceiptModal isOpen={!!receipt} onClose={() => setReceipt(null)} {...receipt} />
        </Suspense>
      )}
    </div>
  );
};

export default PosBillingPage;
