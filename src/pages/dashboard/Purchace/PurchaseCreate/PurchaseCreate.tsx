import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { FaTrash, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { PartySelectorModal } from "../../sales/SalesInvoice/CreateSalesInvoice/PartySelectorModal";
import { ItemSelectorModal } from "../../sales/SalesInvoice/CreateSalesInvoice/ItemSelectorModal";
import { useGetPartyByIdQuery } from "../../../../features/party/partyApiSlice";
import { useGetItemByIdQuery } from "../../../../features/item/itemApiSlice";
import {
  useCreatePurchaseMutation,
  useUpdatePurchaseMutation,
  useGetPurchaseByIdQuery,
} from "../../../../features/purchase/purchaseApiSlice";
import { Button } from "../../../../components/UI/Button";
import { skipToken } from "@reduxjs/toolkit/query";
import { toast } from "react-toastify";
import { Table, type Column } from "../../../../components/Table/Table";
import { Input } from "../../../../components/UI/Input";
import { Textarea } from "../../../../components/UI/Textarea";
import { PageHeader } from "../../../../components/UI/PageHeader";
import { FormSection } from "../../../../components/UI/FormSection";
import * as Yup from "yup";

const CreatePurchaseForm: React.FC = () => {
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const isEdit = !!editId;
  const [isPartyModalOpen, setPartyModalOpen] = useState(false);
  const [isItemModalOpen, setItemModalOpen] = useState(false);
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [selectedItemTemp, _setSelectedItemTemp] = useState<any | null>(null);

  const { data: editResponse } = useGetPurchaseByIdQuery(editId ?? skipToken);

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
  const [updatePurchase] = useUpdatePurchaseMutation();

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
      itemDetails: Yup.array().min(1, "Add at least one item"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (isEdit) {
          await updatePurchase({ id: editId!, ...values }).unwrap();
          toast.success("Purchase invoice updated successfully!");
        } else {
          await createPurchase(values).unwrap();
          toast.success("Purchase invoice created successfully!");
        }
        navigate("/purchases/purchaseInvoice");
      } catch (error: any) {
        toast.error(
          error?.data?.message ||
            `Failed to ${isEdit ? "update" : "create"} purchase invoice. Please try again.`
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Edit mode: hydrate the form from the existing invoice.
  useEffect(() => {
    const inv: any = editResponse?.data;
    if (!isEdit || !inv) return;
    const pid =
      typeof inv.partyId === "object"
        ? inv.partyId?._id || inv.partyId?.id
        : inv.partyId;
    if (pid) setSelectedPartyId(String(pid));
    formik.setValues({
      partyId: String(pid || ""),
      invioceNo: inv.invioceNo || "",
      invioceDate: inv.invioceDate ? String(inv.invioceDate).slice(0, 10) : "",
      paymentTermDays: inv.paymentTermDays || 0,
      dueDate: inv.dueDate ? String(inv.dueDate).slice(0, 10) : "",
      itemDetails: Array.isArray(inv.itemDetails) ? inv.itemDetails : [],
      totalPurchaseAmount: inv.totalPurchaseAmount || 0,
      totalTaxablePurchaseAmount: inv.totalTaxablePurchaseAmount || 0,
      totalTax: inv.totalTax || 0,
      notes: inv.notes || "",
      termsAndConditions: inv.termsAndConditions || "",
      additionalCharges: inv.additionalCharges || 0,
      discountAfterTax: inv.discountAfterTax || 0,
      paidAmount: inv.paidAmount || 0,
      isFullyPaid: inv.isFullyPaid || false,
      dueAmount: inv.dueAmount || 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editResponse, isEdit]);

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
          className="w-24 rounded px-1 py-0.5 text-right bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary focus:bg-white text-[13px]"
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
          className="w-20 rounded px-1 py-0.5 text-right bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary focus:bg-white text-[13px]"
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
    <div className="secondary-font">
      <PartySelectorModal
        isOpen={isPartyModalOpen}
        onClose={() => setPartyModalOpen(false)}
        onSelect={(p) => setSelectedPartyId(p.id)}
      />
      <ItemSelectorModal
        isOpen={isItemModalOpen}
        onClose={() => setItemModalOpen(false)}
        onSelect={(items) => {
          const newRows = items.map((it) => {
            const taxRate = it.taxPercentage || 0;
            // Purchases are priced at the purchase price (not sale price);
            // GST is added on top of it.
            const pricePerItem = it.purchasePrice || 0;
            const taxAmount = parseFloat(
              ((pricePerItem * taxRate) / 100).toFixed(2)
            );
            const totalAmount = pricePerItem + taxAmount;

            return {
              itemId: it.id,
              hasSerialization: it.hasSerialization ?? it.hasSerialNo ?? false,
              serialNos: it.serialNos || [],
              hsnCode: it.hsnCode || "",
              quantity: it.quantity || 1,
              pricePerItem,
              actualPricePerItem: pricePerItem,
              discountBeforeTax: 0,
              taxAmount,
              taxPercentage: taxRate,
              totalAmount: totalAmount * (it.quantity || 1),
              itemName: it.name,
              purchasePrice: pricePerItem,
            };
          });

          formik.setFieldValue("itemDetails", [
            ...formik.values.itemDetails,
            ...newRows,
          ]);
        }}
      />

      <PageHeader
        title={isEdit ? "Edit Purchase Invoice" : "Create Purchase Invoice"}
        subtitle="Fill in the details below"
        onBack={() => navigate("/purchases/purchaseInvoice")}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/purchases/purchaseInvoice")}
            >
              Cancel
            </Button>
            <Button type="submit" form="create-purchase-form">
              {isEdit ? "Update Purchase Invoice" : "Save Purchase Invoice"}
            </Button>
          </>
        }
      />

      <form
        id="create-purchase-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const errors = await formik.validateForm();
          if (Object.keys(errors).length) {
            Object.values(errors).forEach((err) => {
              if (typeof err === "string") toast.error(err);
            });
            formik.setTouched(
              Object.keys(errors).reduce(
                (acc, k) => ({ ...acc, [k]: true }),
                {}
              )
            );
            return;
          }
          formik.handleSubmit(e);
        }}
        className="space-y-5 max-w-5xl"
      >
        {/* supplier selection */}
        <FormSection title="Supplier" layout="plain">
          {!selectedPartyId ? (
            <button
              type="button"
              onClick={() => setPartyModalOpen(true)}
              className="w-full border border-dashed border-primary rounded-lg py-4 text-center text-primary font-medium bg-blue-50/60 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              + Select Supplier
            </button>
          ) : (
            <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {partyDetails?.partyName || partyDetails?.name || "Supplier"}
                </p>
                <p className="text-xs text-gray-500">
                  {partyDetails?.mobileNo || partyDetails?.mobileNumber || ""}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setPartyModalOpen(true)}
              >
                Change Supplier
              </Button>
            </div>
          )}
        </FormSection>

        {/* invoice fields */}
        <FormSection title="Invoice Details">
          <Input
            label="Invoice No"
            required
            name="invioceNo"
            value={formik.values.invioceNo}
            onChange={formik.handleChange}
          />
          <Input
            label="Invoice Date"
            required
            type="date"
            name="invioceDate"
            value={formik.values.invioceDate}
            onChange={formik.handleChange}
          />
          <Input
            label="Payment Terms (days)"
            type="number"
            name="paymentTermDays"
            value={formik.values.paymentTermDays}
            onChange={formik.handleChange}
          />
          <Input
            label="Due Date"
            type="date"
            name="dueDate"
            value={formik.values.dueDate}
            onChange={formik.handleChange}
          />
        </FormSection>

        {/* items */}
        <FormSection title="Items" layout="plain">
          <button
            type="button"
            onClick={() => setItemModalOpen(true)}
            className="w-full border border-dashed border-primary rounded-lg py-4 text-center text-primary font-medium bg-blue-50/60 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            + Add Item
          </button>
          {formik.values.itemDetails.length > 0 && (
            <div className="mt-4">
              <Table
                columns={columns}
                data={formik.values.itemDetails}
                emptyMessage="No items added"
              />
            </div>
          )}
        </FormSection>

        {/* summary */}
        <FormSection title="Notes & Payment" layout="plain">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
            <div className="space-y-4">
              <Textarea
                label="Notes"
                name="notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
                rows={3}
                className="resize-none"
              />
              <Textarea
                label="Terms & Conditions"
                name="termsAndConditions"
                value={formik.values.termsAndConditions}
                onChange={formik.handleChange}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-4">
              <Input
                label="Additional Charges"
                type="number"
                name="additionalCharges"
                value={formik.values.additionalCharges}
                onChange={formik.handleChange}
              />
              <Input
                label="Discount After Tax"
                type="number"
                name="discountAfterTax"
                value={formik.values.discountAfterTax}
                onChange={formik.handleChange}
              />

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Taxable Amount</span>
                  <span className="font-medium">
                    ₹{formik.values.totalTaxablePurchaseAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Total Amount</span>
                  <span className="font-medium">
                    ₹{formik.values.totalPurchaseAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFullyPaid"
                  checked={formik.values.isFullyPaid}
                  onChange={formik.handleChange}
                />
                Mark as Fully Paid
              </label>

              <Input
                label="Paid Amount"
                type="number"
                name="paidAmount"
                value={formik.values.paidAmount}
                onChange={formik.handleChange}
              />
              {warningText && (
                <div className="flex items-center gap-1.5 text-yellow-600 text-sm">
                  <FaExclamationTriangle />
                  <span>{warningText}</span>
                </div>
              )}

              <div className="flex justify-between rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
                <span>Balance Amount</span>
                <span>₹{formik.values.dueAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </FormSection>
      </form>
    </div>
  );
};

export default CreatePurchaseForm;
