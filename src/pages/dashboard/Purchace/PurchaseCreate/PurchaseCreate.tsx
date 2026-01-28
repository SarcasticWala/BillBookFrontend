import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { FaArrowLeft, FaTrash, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { PartySelectorModal } from "../../sales/SalesInvoice/CreateSalesInvoice/PartySelectorModal";
import { ItemSelectorModal } from "../../sales/SalesInvoice/CreateSalesInvoice/ItemSelectorModal";
import { useGetPartyByIdQuery } from "../../../../features/party/partyApiSlice";
import { useGetItemByIdQuery } from "../../../../features/item/itemApiSlice";
import { useCreatePurchaseMutation } from "../../../../features/purchase/purchaseApiSlice";
import { Button } from "../../../../components/UI/Button";
import { skipToken } from "@reduxjs/toolkit/query";
import { toast } from "react-toastify";
import { Table, type Column } from "../../../../components/Table/Table";
import * as Yup from "yup";

const CreatePurchaseForm: React.FC = () => {
  const navigate = useNavigate();
  const [isPartyModalOpen, setPartyModalOpen] = useState(false);
  const [isItemModalOpen, setItemModalOpen] = useState(false);
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [selectedItemTemp, _setSelectedItemTemp] = useState<any | null>(null);

  const { data: partyResponse } = useGetPartyByIdQuery(
    selectedPartyId ? selectedPartyId : skipToken
  );
  const partyDetails = partyResponse?.data;

  const { data: itemDetailsResponse } = useGetItemByIdQuery(
    selectedItemTemp
      ? {
          id: selectedItemTemp.id,
          itemType: selectedItemTemp.itemName ? "PRODUCT" : "SERVICE",
        }
      : skipToken
  );
  const itemDetailsFetch = itemDetailsResponse?.data;

  const [createPurchase] = useCreatePurchaseMutation();

  const formik = useFormik({
    initialValues: {
      partyId: "",
      invioceNo: "",
      invioceDate: "",
      paymentTermDays: 0,
      dueDate: "",
      itemDetails: [] as any[],
      totalPurchaseAmount: 0,
      totalTaxablePurchaseAmount: 0,
      totalTax: 0,
      notes: "",
      termsAndConditions: "",
      additionalCharges: 0,
      discountAfterTax: 0,
      paidAmount: 0,
      isFullyPaid: false,
      dueAmount: 0,
    },
    validationSchema: Yup.object({
      partyId: Yup.string().required("Supplier is required"),
      invioceNo: Yup.string().required("Invoice number is required"),
      invioceDate: Yup.date().required("Invoice date is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await createPurchase(values).unwrap();
        toast.success("Purchase invoice created successfully!");
        navigate("/purchases/purchaseInvoice");
      } catch (error: any) {
        toast.error(
          error?.data?.message ||
            "Failed to create purchase invoice. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (partyDetails) {
      formik.setFieldValue("partyId", partyDetails.id);
    }
  }, [partyDetails]);

  useEffect(() => {
    if (itemDetailsFetch) {
      const existing = formik.values.itemDetails.find(
        (i) => i.itemId === itemDetailsFetch.id
      );
      if (!existing) {
        const purchasePrice = itemDetailsFetch.purchasePrice || 0;
        const taxRate = parseFloat(itemDetailsFetch?.gstRate?.value) || 0;
        const taxAmount = parseFloat(
          ((purchasePrice * taxRate) / 100).toFixed(2)
        );
        const totalAmount = purchasePrice + taxAmount;

        const row = {
          itemId: itemDetailsFetch.id,
          itemName: itemDetailsFetch.itemName,
          hsnCode: itemDetailsFetch.hsnCode || "",
          quantity: 1,
          pricePerItem: purchasePrice,
          actualPricePerItem: purchasePrice,
          discountBeforeTax: 0,
          taxAmount,
          taxPercentage: taxRate,
          totalAmount,
          serialNos: [],
          hasSerialization: itemDetailsFetch.hasSerialization || false,
        };
        formik.setFieldValue("itemDetails", [
          ...formik.values.itemDetails,
          row,
        ]);
      }
    }
  }, [itemDetailsFetch]);

  useEffect(() => {
    const sub = formik.values.itemDetails.reduce(
      (a, e) => a + (e.totalAmount || 0),
      0
    );

    const totalTaxablePurchaseAmount = formik.values.itemDetails.reduce(
      (acc, row) => acc + row.pricePerItem * (row.quantity || 1),
      0
    );

    const totalTax = formik.values.itemDetails.reduce(
      (acc, row) => acc + (row.taxAmount || 0) * (row.quantity || 1),
      0
    );

    const totalWithAdd =
      sub +
      Number(formik.values.additionalCharges || 0) -
      Number(formik.values.discountAfterTax || 0);
    const due = totalWithAdd - Number(formik.values.paidAmount || 0);

    formik.setFieldValue(
      "totalPurchaseAmount",
      parseFloat(totalWithAdd.toFixed(2)),
      false
    );
    formik.setFieldValue("dueAmount", parseFloat(due.toFixed(2)), false);

    if (
      formik.values.totalTaxablePurchaseAmount !== totalTaxablePurchaseAmount ||
      formik.values.totalTax !== totalTax
    ) {
      formik.setFieldValue(
        "totalTaxablePurchaseAmount",
        totalTaxablePurchaseAmount,
        false
      );
      formik.setFieldValue("totalTax", totalTax, false);
    }
  }, [
    formik.values.itemDetails,
    formik.values.additionalCharges,
    formik.values.discountAfterTax,
    formik.values.paidAmount,
  ]);

  useEffect(() => {
    if (formik.values.isFullyPaid) {
      const total = formik.values.totalPurchaseAmount;
      formik.setFieldValue("paidAmount", total);
      formik.setFieldValue("dueAmount", 0);
    } else {
      const due =
        formik.values.totalPurchaseAmount -
        Number(formik.values.paidAmount || 0);
      formik.setFieldValue("dueAmount", parseFloat(due.toFixed(2)));
    }
  }, [
    formik.values.isFullyPaid,
    formik.values.totalPurchaseAmount,
    formik.values.paidAmount,
  ]);

  const handleValueChange = (index: number, field: "pricePerItem", value: string) => {
  const items = [...formik.values.itemDetails];
  const row = { ...items[index] };
  const num = parseFloat(value) || 0;

  if (field === "pricePerItem") row.pricePerItem = num;

  // recalc
  const priceAfterDiscount = row.pricePerItem; // no discount field
  row.taxAmount = parseFloat(((priceAfterDiscount * row.taxPercentage) / 100).toFixed(2));
  row.totalAmount = parseFloat((priceAfterDiscount + row.taxAmount).toFixed(2)) * (row.quantity || 1);

  items[index] = row;
  formik.setFieldValue("itemDetails", items);
};
const handleTaxChange = (index: number, value: string) => {
  const items = [...formik.values.itemDetails];
  const row = { ...items[index] };
  const num = parseFloat(value) || 0;

  row.taxPercentage = num;

  const priceAfterDiscount = row.pricePerItem;
  row.taxAmount = parseFloat(((priceAfterDiscount * row.taxPercentage) / 100).toFixed(2));
  row.totalAmount = parseFloat((priceAfterDiscount + row.taxAmount).toFixed(2)) * (row.quantity || 1);

  items[index] = row;
  formik.setFieldValue("itemDetails", items);
};



  const getWarning = () => {
    const { paidAmount, totalPurchaseAmount, isFullyPaid } = formik.values;
    if (!paidAmount && paidAmount !== 0) return null;
    if (isFullyPaid && paidAmount < totalPurchaseAmount) {
      return "Paid amount is less than total amount";
    }
    if (paidAmount > totalPurchaseAmount) {
      return "Paid amount is greater than total amount";
    }
    return null;
  };

  const warningText = getWarning();

  const columns: Column<(typeof formik.values.itemDetails)[0]>[] = [
    { header: "Item", accessor: "itemName" },
    { header: "HSN", accessor: "hsnCode" },
    { header: "Qty", accessor: "quantity" },
    {
      header: "Price/Item",
      render: (_, row, index) => (
        <input
          type="number"
          value={row.pricePerItem}
          onChange={(e) => handleValueChange(index, "pricePerItem", e.target.value)}
          className="w-24 rounded px-1 py-0.5 text-right bg-pink-50 border-none focus:outline-none text-[13px]"
        />
      ),
    },
    {
      header: "Tax %",
      render: (_, row, index) => (
        <input
          type="number"
          value={row.taxPercentage}
          onChange={(e) => handleTaxChange(index, e.target.value)}
          className="w-20 rounded px-1 py-0.5 text-right bg-pink-50 border-none focus:outline-none text-[13px]"
        />
      ),
    },
    {
      header: "Amount",
      render: (_, row) => (
        <div className="text-right font-medium">
          ₹{row.totalAmount.toFixed(2)}
        </div>
      ),
    },
    {
      header: "",
      render: (_, __, index) => (
        <button
          type="button"
          onClick={() => {
            const newItems = [...formik.values.itemDetails];
            newItems.splice(index, 1);
            formik.setFieldValue("itemDetails", newItems);
          }}
          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
        >
          <FaTrash size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 mx-auto max-w-7xl">
      <PartySelectorModal
        isOpen={isPartyModalOpen}
        onClose={() => setPartyModalOpen(false)}
        onSelect={(p) => setSelectedPartyId(p.id)}
      />
      <ItemSelectorModal
        isOpen={isItemModalOpen}
        onClose={() => setItemModalOpen(false)}
        onSelect={(items) => {
          console.log("[DEBUG] Items selected from modal:", items);

          const newRows = items.map((it) => {
            const isPreowned = it.itemProductType === "OLD" ? true : false;
            const taxRate = it.taxPercentage || 0;
            const purchasePrice = it.purchasePrice || 0;
            let pricePerItem = it.salePrice;
            let taxAmount = 0;
            let totalAmount = 0;
            // let discountBeforeTaxTemp = 0;

            if (isPreowned) {
              const profit = Math.max(pricePerItem - purchasePrice, 0);

              taxAmount = parseFloat(((profit * taxRate) / 100).toFixed(2));
              totalAmount = pricePerItem + taxAmount;
            } else {
              if (it.isSaleTaxApplicable) {
                const taxablePrice = parseFloat(
                  ((pricePerItem * 100) / (100 + taxRate)).toFixed(2)
                );
                taxAmount = parseFloat(
                  ((taxablePrice * taxRate) / 100).toFixed(2)
                );
                totalAmount = taxablePrice + taxAmount;
                pricePerItem = taxablePrice;
              } else {
                taxAmount = pricePerItem * (taxRate / 100);
                totalAmount = pricePerItem + taxAmount;
              }
            }

            return {
              itemId: it.id,
              hasSerialization: it.hasSerialization || false,
              serialNos: it.serialNos || [],
              hsnCode: it.hsnCode || "",
              quantity: it.quantity || 1,
              pricePerItem,
              actualPricePerItem: pricePerItem,
              discountBeforeTax: 0,
              taxAmount,
              taxPercentage: taxRate,
              totalAmount: totalAmount * it.quantity,
              itemName: it.name,
              isSaleTaxApplicable: Boolean(it.isSaleTaxApplicable),
              isPreowned,
              purchasePrice,
            };
          });

          formik.setFieldValue("itemDetails", [
            ...formik.values.itemDetails,
            ...newRows,
          ]);
        }}
      />

      <form onSubmit={formik.handleSubmit} className="space-y-8">
        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-gray-800">
            <FaArrowLeft
              className="cursor-pointer text-lg"
              onClick={() => navigate("/purchases/invoices")}
            />
            <h1 className="text-xl">Create Purchase Invoice</h1>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Purchase Invoice
          </button>
        </div>

        {/* supplier selection */}
        {!selectedPartyId ? (
          <div className="border border-dashed border-blue-400 p-4 rounded-md text-center bg-blue-50">
            <p
              className="font-medium text-primary cursor-pointer"
              onClick={() => setPartyModalOpen(true)}
            >
              + Select Supplier
            </p>
          </div>
        ) : (
          <div className="border rounded-md p-3 bg-gray-50 shadow-sm">
            <p className="text-sm font-medium mb-1">
              {partyDetails?.name || "Supplier"}
            </p>
            <p className="text-xs text-gray-600">
              {partyDetails?.mobileNumber || ""}
            </p>
            <Button
              variant="outline"
              className="mt-2 w-full text-sm"
              type="button"
              onClick={() => setPartyModalOpen(true)}
            >
              Change Supplier
            </Button>
          </div>
        )}

        {/* invoice fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="input-label">Invoice No*</label>
            <input
              name="invioceNo"
              value={formik.values.invioceNo}
              onChange={formik.handleChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="input-label">Invoice Date*</label>
            <input
              type="date"
              name="invioceDate"
              value={formik.values.invioceDate}
              onChange={formik.handleChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="input-label">Payment Terms (days)</label>
            <input
              type="number"
              name="paymentTermDays"
              value={formik.values.paymentTermDays}
              onChange={formik.handleChange}
              className="input-field"
            />
            <label className="input-label mt-2">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formik.values.dueDate}
              onChange={formik.handleChange}
              className="input-field"
            />
          </div>
        </div>

        {/* items */}
        <div className="border border-dashed border-blue-400 p-4 rounded-md text-center bg-blue-50">
          <p
            className="font-medium text-primary cursor-pointer"
            onClick={() => setItemModalOpen(true)}
          >
            + Add Item
          </p>
        </div>
        {formik.values.itemDetails.length > 0 && (
          <Table
            columns={columns}
            data={formik.values.itemDetails}
            emptyMessage="No items added"
          />
        )}

        {/* summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
          <div>
            <label className="input-label">Notes</label>
            <textarea
              name="notes"
              value={formik.values.notes}
              onChange={formik.handleChange}
              rows={3}
              className="input-field resize-none text-sm mt-2"
            />

            <label className="mt-4 block input-label">Terms & Conditions</label>
            <textarea
              name="termsAndConditions"
              value={formik.values.termsAndConditions}
              onChange={formik.handleChange}
              rows={3}
              className="input-field text-xs mt-1"
            />
          </div>

          <div className="space-y-3">
            <label className="mt-4 block input-label">Additional Charges</label>
            <input
              type="number"
              name="additionalCharges"
              value={formik.values.additionalCharges}
              onChange={formik.handleChange}
              className="input-field"
            />

            <label className="mt-4 block input-label">Discount After Tax</label>
            <input
              type="number"
              name="discountAfterTax"
              value={formik.values.discountAfterTax}
              onChange={formik.handleChange}
              className="input-field"
            />

            <div className="text-sm">
              <div className="flex justify-between">
                <span>Taxable Amount</span>
                <span>
                  ₹{formik.values.totalTaxablePurchaseAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Total Amount</span>
                <span>₹{formik.values.totalPurchaseAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center mt-2 gap-2">
              <input
                type="checkbox"
                name="isFullyPaid"
                checked={formik.values.isFullyPaid}
                onChange={formik.handleChange}
              />
              <span className="text-sm">Mark as Fully Paid</span>
            </div>

            <label className="mt-4 block input-label">Paid Amount</label>
            <input
              type="number"
              name="paidAmount"
              value={formik.values.paidAmount}
              onChange={formik.handleChange}
              className="input-field mt-2"
            />
            {warningText && (
              <div className="flex items-center gap-1 mt-1 text-yellow-600 text-sm">
                <FaExclamationTriangle />
                <span>{warningText}</span>
              </div>
            )}

            <div className="text-sm text-green-600 font-semibold mt-2">
              <div className="flex justify-between">
                <span>Balance Amount</span>
                <span>₹{formik.values.dueAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePurchaseForm;
