import { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import { newIdempotencyKey } from "../../../../../lib/idempotency";
import { FaExclamationTriangle, FaTrash } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { PartySelectorModal } from "./PartySelectorModal";
import { ItemSelectorModal } from "./ItemSelectorModal";
import { useGetPartyByIdQuery } from "../../../../../features/party/partyApiSlice";
import { useGetItemByIdQuery } from "../../../../../features/item/itemApiSlice";
import {
  useCreateSaleMutation,
  useUpdateSaleMutation,
  useGetSaleByIdQuery,
} from "../../../../../features/sales/saleApiSlice";
import { Button } from "../../../../../components/UI/Button";
import { Card } from "../../../../../components/UI/Card";
import { Input } from "../../../../../components/UI/Input";
import { PageHeader } from "../../../../../components/UI/PageHeader";
import { FormSection } from "../../../../../components/UI/FormSection";
import { FiPlus } from "react-icons/fi";
import { skipToken } from "@reduxjs/toolkit/query";
import { toast } from "react-toastify";
import { Table, type Column } from "../../../../../components/Table/Table";
import * as Yup from "yup";

// Tolerant address formatter — handles the write shape ({ad, st, city, pin})
// and the older mapped shape ({ miscData: {...} }).
const formatPartyAddress = (addr: any): string => {
  if (!addr) return "";
  const a = addr.miscData || addr;
  return [a.ad, a.city, a.st, a.pin].filter(Boolean).join(", ");
};

export const CreateSalesForm: React.FC = () => {
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const isEdit = !!editId;
  const [isPartyModalOpen, setPartyModalOpen] = useState(false);
  const [isItemModalOpen, setItemModalOpen] = useState(false);
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  // Ship To is tracked independently from Bill To so picking one never
  // silently overwrites the other. `partyModalTarget` tells the shared
  // selector which card the user is changing.
  const [shipToPartyId, setShipToPartyId] = useState<string | null>(null);
  const [partyModalTarget, setPartyModalTarget] = useState<"bill" | "ship">(
    "bill"
  );
  const [selectedItemTemp, _setSelectedItemTemp] = useState<any | null>(null);

  const { data: editResponse } = useGetSaleByIdQuery(editId ?? skipToken);

  const { data: partyResponse } = useGetPartyByIdQuery(
    selectedPartyId ? selectedPartyId : skipToken
  );
  const partyDetails = partyResponse?.data;

  const { data: shipToResponse } = useGetPartyByIdQuery(
    shipToPartyId ? shipToPartyId : skipToken
  );
  const shipToDetails = shipToResponse?.data;

  const { data: itemDetailsResponse } = useGetItemByIdQuery(
    selectedItemTemp
      ? {
          id: selectedItemTemp.id,
          itemType: selectedItemTemp.itemName ? "PRODUCT" : "SERVICE",
        }
      : skipToken
  );
  const itemDetailsFetch = itemDetailsResponse?.data;

  const [createSale] = useCreateSaleMutation();
  const [updateSale] = useUpdateSaleMutation();
  // Stable per form mount → guards against duplicate creates on double-submit.
  const idempotencyKey = useRef(newIdempotencyKey()).current;

  const formik = useFormik({
    initialValues: {
      partyId: "",
      shipToPartyId: "",
      invioceNo: "",
      invioceDate: "",
      paymentTermDays: 0,
      dueDate: "",
      itemDetails: [] as any[],
      totalSaleAmount: 0,
      totalTaxableSaleAmount: 0,
      totalTax: 0,
      notes: "",
      termsAndConditions: "",
      additionalCharges: 0,
      discountAfterTax: 0,
      receivedAmount: 0,
      isFullyPaid: false,
      dueAmount: 0,
      cash: 0,
      online: 0,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      partyId: Yup.string().required("Party is required"),
      invioceNo: Yup.string().required("Invoice number is required"),
      invioceDate: Yup.date().required("Invoice date is required"),
      itemDetails: Yup.array().min(1, "Add at least one item"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      const errors = await formik.validateForm();
      if (Object.keys(errors).length > 0) {
        Object.values(errors).forEach((err) => {
          if (typeof err === "string") toast.error(err);
        });
        setSubmitting(false);
        return;
      }

      const partialSum = Number(values.cash) + Number(values.online);
      if (partialSum > values.receivedAmount) {
        toast.error(
          "Sum of cash and online payments cannot exceed received amount."
        );
        return;
      }

      try {
        if (isEdit) {
          await updateSale({ id: editId!, ...values }).unwrap();
          toast.success("Sales invoice updated successfully!");
        } else {
          await createSale({ ...values, __idempotencyKey: idempotencyKey }).unwrap();
          toast.success("Sales invoice created successfully!");
        }
        navigate("/sales/invoices");
      } catch (error: any) {
        toast.error(
          error?.data?.message ||
            `Failed to ${isEdit ? "update" : "create"} sales invoice. Please try again.`
        );
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
    if (inv.shipToPartyId) setShipToPartyId(String(inv.shipToPartyId));
    formik.setValues({
      partyId: String(pid || ""),
      shipToPartyId: inv.shipToPartyId ? String(inv.shipToPartyId) : "",
      invioceNo: inv.invioceNo || "",
      invioceDate: inv.invioceDate ? String(inv.invioceDate).slice(0, 10) : "",
      paymentTermDays: inv.paymentTermDays || 0,
      dueDate: inv.dueDate ? String(inv.dueDate).slice(0, 10) : "",
      itemDetails: Array.isArray(inv.itemDetails) ? inv.itemDetails : [],
      totalSaleAmount: inv.totalSaleAmount || 0,
      totalTaxableSaleAmount: inv.totalTaxableSaleAmount || 0,
      totalTax: inv.totalTax || 0,
      notes: inv.notes || "",
      termsAndConditions: inv.termsAndConditions || "",
      additionalCharges: inv.additionalCharges || 0,
      discountAfterTax: inv.discountAfterTax || 0,
      receivedAmount: inv.receivedAmount || 0,
      isFullyPaid: inv.isFullyPaid || false,
      dueAmount: inv.dueAmount || 0,
      cash: inv.cash || 0,
      online: inv.online || 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editResponse, isEdit]);

  const handleAdditionalChargesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (value === "") {
      formik.setFieldValue("additionalCharges", "");
      return;
    }
    const numericValue = Number(value);
    if (numericValue >= 0 && numericValue <= Number.MAX_SAFE_INTEGER) {
      formik.setFieldValue("additionalCharges", numericValue);
    }
  };

  useEffect(() => {
    if (partyDetails) {
      formik.setFieldValue("partyId", partyDetails.id);
    }
  }, [partyDetails]);

  // Keep the persisted ship-to id in sync with the separately chosen party.
  useEffect(() => {
    formik.setFieldValue("shipToPartyId", shipToDetails?.id || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipToDetails]);

  useEffect(() => {
    if (itemDetailsFetch) {
      const existing = formik.values.itemDetails.find(
        (i) => i.itemId === itemDetailsFetch.id
      );
      if (!existing) {
        const isPreowned = itemDetailsFetch.isPreowned || false;
        let pricePerItem = itemDetailsFetch.salePrice;
        let purchasePrice = itemDetailsFetch.purchasePrice || 0;
        const taxRate = parseFloat(itemDetailsFetch?.gstRate?.value) || 0;
        let taxAmount = 0;
        let totalAmount = 0;

        if (itemDetailsFetch.isSaleTaxApplicable) {
          if (isPreowned) {
            // OLD product tax on profit
            const profit = Math.max(pricePerItem - purchasePrice, 0);
            taxAmount = parseFloat(((profit * taxRate) / 100).toFixed(2));
            totalAmount = pricePerItem + taxAmount;
          } else {
            // NEW product reverse calc taxable price
            const taxablePrice = parseFloat(
              ((pricePerItem * 100) / (100 + taxRate)).toFixed(2)
            );
            taxAmount = parseFloat(((taxablePrice * taxRate) / 100).toFixed(2));
            totalAmount = taxablePrice + taxAmount; // Should match original pricePerItem
            pricePerItem = taxablePrice; // store taxable price in row
          }
        } else {
          taxAmount = 0;
          totalAmount = pricePerItem;
        }

        const row = {
          itemId: itemDetailsFetch.id,
          hasSerialization: itemDetailsFetch.hasSerialization || false,
          serialNos: itemDetailsFetch.serialNos || [],
          hsnCode: itemDetailsFetch.hsnCode || "",
          quantity: 1,
          pricePerItem,
          actualPricePerItem: pricePerItem,
          basePricePerItem: pricePerItem,   // selling price before discount
          discountBeforeTax: 0,
          taxAmount,
          taxPercentage: taxRate,
          totalAmount,
          itemName: itemDetailsFetch.itemName,
          isSaleTaxApplicable: itemDetailsFetch.isSaleTaxApplicable,
          isPreowned,
          purchasePrice,
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

    const totalTaxableSaleAmount = formik.values.itemDetails.reduce((acc, row) => {
    const basePrice = row.basePricePerItem ?? row.pricePerItem;
    const priceAfterDiscount = basePrice - (row.discountBeforeTax || 0);
    return acc + priceAfterDiscount * (row.quantity || 1);
}, 0);

    const totalTax = formik.values.itemDetails.reduce(
      (acc, row) => acc + (row.taxAmount || 0) * (row.quantity || 1),
      0
    );

    const totalWithAdd =
      sub +
      Number(formik.values.additionalCharges || 0) -
      Number(formik.values.discountAfterTax || 0);
    const due = totalWithAdd - Number(formik.values.receivedAmount || 0);

    formik.setFieldValue(
      "totalSaleAmount",
      parseFloat(totalWithAdd.toFixed(2)),
      false
    );
    formik.setFieldValue("dueAmount", parseFloat(due.toFixed(2)), false);

    if (
      formik.values.totalTaxableSaleAmount !== totalTaxableSaleAmount ||
      formik.values.totalTax !== totalTax
    ) {
      formik.setFieldValue(
        "totalTaxableSaleAmount",
        totalTaxableSaleAmount,
        false
      );
      formik.setFieldValue("totalTax", totalTax, false);
    }
  }, [
    formik.values.itemDetails,
    formik.values.additionalCharges,
    formik.values.discountAfterTax,
    formik.values.receivedAmount,
  ]);

  useEffect(() => {
  if (formik.values.isFullyPaid) {
    const total = formik.values.totalSaleAmount;

    // Always set received = total when fully paid
    formik.setFieldValue("receivedAmount", total);
    formik.setFieldValue("dueAmount", 0);

    // Sync partial payments
    const remaining = total - (formik.values.cash || 0);

    if (
      document.activeElement?.getAttribute("name") === "cash" &&
      formik.values.cash != null
    ) {
      // User typed in cash → adjust online
      formik.setFieldValue("online", Math.max(remaining, 0));
    } else if (
      document.activeElement?.getAttribute("name") === "online" &&
      formik.values.online != null
    ) {
      // User typed in online → adjust cash
      const remainingCash = total - formik.values.online;
      formik.setFieldValue("cash", Math.max(remainingCash, 0));
    } else {
      // Default: split everything into cash
      formik.setFieldValue("cash", total);
      formik.setFieldValue("online", 0);
    }
  } else {
    // Not fully paid → recalc due normally
    const due =
      formik.values.totalSaleAmount -
      Number(formik.values.receivedAmount || 0);
    formik.setFieldValue("dueAmount", parseFloat(due.toFixed(2)));
  }
}, [
  formik.values.isFullyPaid,
  formik.values.totalSaleAmount,
  formik.values.receivedAmount,
  formik.values.cash,
  formik.values.online,
]);


  // Warning calculation
  const getWarning = () => {
    const { receivedAmount, totalSaleAmount, isFullyPaid } = formik.values;
    if (!receivedAmount && receivedAmount !== 0) return null;

    if (isFullyPaid && receivedAmount < totalSaleAmount) {
      return "Received amount is less than total amount";
    }
    if (receivedAmount > totalSaleAmount) {
      return "Received amount is greater than total amount";
    }
    return null;
  };

  const warningText = getWarning();

  const handlePartialPaymentChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "cash" | "online"
  ) => {
    const val = e.target.value;
    if (val === "") {
      formik.setFieldValue(fieldName, "");
      return;
    }
    const num = Number(val);
    if (num >= 0 && num <= Number.MAX_SAFE_INTEGER) {
      formik.setFieldValue(fieldName, num);
    }
  };

  const handlePriceChange = (index: number, val: string) => {
    const price = parseFloat(val) || 0;
    const current = formik.values.itemDetails[index];
    const updated = {
      ...formik.values.itemDetails[index],
      pricePerItem: price,
      basePricePerItem: price,
      serialNos: current.serialNos || [],
    };
    if (updated.isPreowned) {
      const priceAfterDiscount = price - (updated.discountBeforeTax || 0);
      updated.taxAmount = parseFloat(
        (
          (Math.max(priceAfterDiscount - updated.purchasePrice, 0) * updated.taxPercentage) /
          100
        ).toFixed(2)
      );
      updated.totalAmount = parseFloat(
        (priceAfterDiscount + updated.taxAmount).toFixed(2)
      ) * (updated.quantity);
    } else {
      const priceAfterDiscount = price - (updated.discountBeforeTax || 0);
      updated.taxAmount = parseFloat(
        ((priceAfterDiscount * updated.taxPercentage) / 100).toFixed(2)
      );
      updated.totalAmount = parseFloat(
        (priceAfterDiscount + updated.taxAmount).toFixed(2)
      ) * (updated.quantity);
    }
    formik.setFieldValue(`itemDetails[${index}]`, updated);
  };

  const handleDiscountValueChange = (index: number, val: string) => {
    const discountValue = parseFloat(val) || 0;
    const row = {
      ...formik.values.itemDetails[index],
      discountBeforeTax: discountValue,
      serialNos: formik.values.itemDetails[index].serialNos || [],
    };
    row.basePricePerItem = row.basePricePerItem ?? row.pricePerItem;
    
    row.discountPercentage = row.basePricePerItem
      ? parseFloat(((discountValue / row.actualPricePerItem) * 100).toFixed(2))
      : 0;
    const priceAfterDiscount = row.basePricePerItem   - discountValue;
    if (row.isPreowned) {
      row.taxAmount = parseFloat(
        (
          (Math.max(priceAfterDiscount - row.purchasePrice, 0) *
            row.taxPercentage) /
          100
        ).toFixed(2)
      );
    } else {
      row.taxAmount = parseFloat(
        ((priceAfterDiscount * row.taxPercentage) / 100).toFixed(2)
      );
    }
    row.totalAmount = parseFloat(
      (priceAfterDiscount + row.taxAmount).toFixed(2)
    ) * (row.quantity);
    row.pricePerItem = priceAfterDiscount;
    formik.setFieldValue(`itemDetails[${index}]`, row);
  };

  const handleDiscountPercentChange = (index: number, val: string) => {
    const discountPct = parseFloat(val) || 0;
    const row = { ...formik.values.itemDetails[index], serialNos: formik.values.itemDetails[index].serialNos || [] };

    row.basePricePerItem = row.basePricePerItem ?? row.pricePerItem;

    const discountValue = parseFloat(
      ((row.basePricePerItem  * discountPct) / 100).toFixed(2)
    );
    row.discountPercentage = discountPct;
    row.discountBeforeTax = discountValue;
    const priceAfterDiscount = row.basePricePerItem - discountValue;
     if (row.isPreowned) {
      row.taxAmount = parseFloat(
        (
          (Math.max(priceAfterDiscount - row.purchasePrice, 0) *
            row.taxPercentage) /
          100
        ).toFixed(2)
      );
    } else {
      row.taxAmount = parseFloat(
        ((priceAfterDiscount * row.taxPercentage) / 100).toFixed(2)
      );
    }
    row.totalAmount = parseFloat(
      (priceAfterDiscount + row.taxAmount).toFixed(2)
    ) * (row.quantity);
    row.pricePerItem = priceAfterDiscount;
    formik.setFieldValue(`itemDetails[${index}]`, row);
  };

 const handleTaxValueChange = (index: number, val: string) => {
  const taxValue = parseFloat(val) || 0;
  const row = { 
    ...formik.values.itemDetails[index], 
    serialNos: formik.values.itemDetails[index].serialNos || [] 
  };

  const qty = row.quantity || 1;

  if (row.isSaleTaxApplicable) {
    const grossPerItem = parseFloat((row.totalAmount / qty).toFixed(2));

    // Base = gross - entered tax
    const newBase = parseFloat((grossPerItem - taxValue).toFixed(2));

    // Tax % = (tax / base) * 100
    const taxPct = newBase > 0 ? parseFloat(((taxValue * 100) / newBase).toFixed(2)) : 0;

    row.pricePerItem = newBase;             // base (after discount)
    row.taxAmount = taxValue;               // user-entered tax value
    row.taxPercentage = taxPct;             // derived %
    row.totalAmount = parseFloat((grossPerItem * qty).toFixed(2)); // gross stays fixed

    // Keep consistency with discounts
    const discount = row.discountBeforeTax || 0;
    row.actualPricePerItem = parseFloat((newBase + discount).toFixed(2));

  } else {
    // --- TAX-EXCLUSIVE ---
    const priceAfterDiscount = row.actualPricePerItem - (row.discountBeforeTax || 0);
    const taxPct = priceAfterDiscount
      ? parseFloat(((taxValue / priceAfterDiscount) * 100).toFixed(2))
      : 0;

    row.pricePerItem = parseFloat(priceAfterDiscount.toFixed(2));
    row.taxAmount = taxValue;
    row.taxPercentage = taxPct;
    row.totalAmount = parseFloat(((priceAfterDiscount + taxValue) * qty).toFixed(2));
  }

  formik.setFieldValue(`itemDetails[${index}]`, row);
};


const handleTaxPercentChange = (index: number, val: string) => {
  const taxPct = parseFloat(val) || 0;
  const row = {
    ...formik.values.itemDetails[index],
    serialNos: formik.values.itemDetails[index].serialNos || [],
  };

  const qty = row.quantity || 1;

  if (row.isSaleTaxApplicable) {
    const currentPerItemGross = parseFloat((row.totalAmount / qty).toFixed(2));

    // Split the same gross into new base+tax using the NEW taxPct
    const newBaseAfterDiscount = parseFloat(
      ((currentPerItemGross * 100) / (100 + taxPct)).toFixed(2)
    );
    const newTax = parseFloat(
      (currentPerItemGross - newBaseAfterDiscount).toFixed(2)
    );

    row.taxPercentage = taxPct;
    row.pricePerItem = newBaseAfterDiscount; // base AFTER discount
    row.taxAmount = newTax; // tax portion
    row.totalAmount = parseFloat((currentPerItemGross * qty).toFixed(2)); // stays the same

    // Keep discount logic consistent later:
    // actualPricePerItem = base BEFORE discount
    const discount = row.discountBeforeTax || 0;
    row.actualPricePerItem = parseFloat(
      (newBaseAfterDiscount + discount).toFixed(2)
    );
  } else {
    // --- TAX-EXCLUSIVE: recompute normally from base after discount ---
   
    if (row.isPreowned) {
      const priceAfterDiscount =
        (row.actualPricePerItem || 0) - (row.discountBeforeTax || 0);
      const taxValue = parseFloat(
        (
          (Math.max(priceAfterDiscount - row.purchasePrice, 0) * taxPct) /
          100
        ).toFixed(2)
      );

      row.taxPercentage = taxPct;
      row.pricePerItem = parseFloat(priceAfterDiscount.toFixed(2)); // base AFTER discount
      row.taxAmount = taxValue;
      row.totalAmount = parseFloat(
        ((priceAfterDiscount + taxValue) * qty).toFixed(2)
      );
    } else {
      const priceAfterDiscount =
        (row.actualPricePerItem || 0) - (row.discountBeforeTax || 0);
      const taxValue = parseFloat(
        ((priceAfterDiscount * taxPct) / 100).toFixed(2)
      );

      row.taxPercentage = taxPct;
      row.pricePerItem = parseFloat(priceAfterDiscount.toFixed(2)); // base AFTER discount
      row.taxAmount = taxValue;
      row.totalAmount = parseFloat(
        ((priceAfterDiscount + taxValue) * qty).toFixed(2)
      );
    }
  }

  formik.setFieldValue(`itemDetails[${index}]`, row);
};






  const columns: Column<(typeof formik.values.itemDetails)[0]>[] = [
    { header: "Item", accessor: "itemName" },
    { header: "HSN", accessor: "hsnCode" },
    {
      header: "Qty",
      render: (_, row) => {
        const stock = (row as any).availableStock;
        const oversold = typeof stock === "number" && (row.quantity || 0) > stock;
        return (
          <div className="min-w-[3rem]">
            <span>{row.quantity}</span>
            {oversold && (
              <span className="mt-0.5 block text-[11px] font-medium text-amber-600 whitespace-nowrap">
                Only {stock} in stock
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Price/Item",
      render: (_, row, index) => (
        <input
          type="number"
          value={row.pricePerItem}
          data-actual-value={row.actualPricePerItem}
          onChange={(e) => handlePriceChange(index, e.target.value)}
          className="w-24 rounded px-1 py-0.5 text-right bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary focus:bg-white text-[13px]"
        />
      ),
    },
    {
      header: "Discount",
      render: (_, row, index) => (
        <div className="flex gap-2 items-center ">
          <div className="relative w-20">
            <span className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-500">
              ₹
            </span>
            <input
              type="number"
              value={row.discountBeforeTax}
              onChange={(e) => handleDiscountValueChange(index, e.target.value)}
              className="w-full rounded px-4 py-0.5 text-right bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary focus:bg-white text-[13px]"
              placeholder="0"
            />
          </div>
          <div className="relative w-20">
            <input
              type="number"
              value={row.discountPercentage || 0}
              onChange={(e) =>
                handleDiscountPercentChange(index, e.target.value)
              }
              className="w-full rounded pr-4 py-0.5 text-right bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary focus:bg-white text-[13px]"
              placeholder="0"
            />
            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500">
              %
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Tax",
      render: (_, row, index) => (
        <div className="flex gap-1 items-center justify-between">
          <div className="relative w-20">
            <span className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-500">
              ₹
            </span>
            <input
              type="number"
              value={row.taxAmount}
              onChange={(e) => handleTaxValueChange(index, e.target.value)}
              className="w-full rounded px-4 py-0.5 text-right bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary focus:bg-white text-[13px]"
              placeholder="0"
            />
          </div>
          <div className="relative w-20">
            <input
              type="number"
              value={row.taxPercentage}
              onChange={(e) => handleTaxPercentChange(index, e.target.value)}
              className="w-full rounded pr-4 py-0.5 text-right bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary focus:bg-white text-[13px]"
              placeholder="0"
            />
            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500">
              %
            </span>
          </div>
        </div>
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
        onSelect={(p) => {
          if (partyModalTarget === "ship") setShipToPartyId(p.id);
          else setSelectedPartyId(p.id);
        }}
      />
      <ItemSelectorModal
        isOpen={isItemModalOpen}
        onClose={() => setItemModalOpen(false)}
        onSelect={(items) => {
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
              // On-hand stock at add time — used only for a non-blocking oversell
              // warning (null for services / items without tracked stock).
              availableStock: Number.isFinite(Number(it.stock))
                ? Number(it.stock)
                : null,
            };
          });

          formik.setFieldValue("itemDetails", [
            ...formik.values.itemDetails,
            ...newRows,
          ]);
        }}
      />

      <PageHeader
        title={isEdit ? "Edit Sales Invoice" : "Create Sales Invoice"}
        subtitle="Fill in the details below"
        onBack={() => navigate("/sales/invoices")}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/sales/invoices")}
            >
              Cancel
            </Button>
            <Button type="submit" form="create-sales-form">
              {isEdit ? "Update Sales Invoice" : "Save Sales Invoice"}
            </Button>
          </>
        }
      />

      <form
        id="create-sales-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const errors = await formik.validateForm();
          if (Object.keys(errors).length) {
            Object.values(errors).forEach((err) => {
              if (typeof err === "string") toast.error(err);
            });
            return;
          }
          formik.handleSubmit(e);
        }}
        className="space-y-5 sm:space-y-6 p-4 sm:p-6 max-w-5xl mx-auto"
      >
        {/* Party Selection */}
        <Card className="p-4 sm:p-6">
        {!selectedPartyId ? (
          <button
            type="button"
            onClick={() => {
              setPartyModalTarget("bill");
              setPartyModalOpen(true);
            }}
            className="group w-full border-2 border-dashed border-blue-300 hover:border-blue-500 p-6 rounded-xl text-center bg-blue-50/60 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <span className="inline-flex items-center gap-2 font-medium text-primary group-hover:text-primary-hover">
              <FiPlus className="text-lg" /> Add Party
            </span>
            <p className="text-xs text-gray-500 mt-1">Select a customer to bill this invoice to</p>
          </button>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="input-label">Bill To</label>
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70">
                <p className="text-sm font-medium mb-1">
                  {partyDetails?.partyName || partyDetails?.name || "Select Party"}
                </p>
                <p className="text-xs text-gray-600">
                  {partyDetails?.mobileNo || partyDetails?.mobileNumber || ""}
                </p>
                <p className="text-xs text-gray-600">
                  {formatPartyAddress(
                    partyDetails?.billingAddressData || partyDetails?.billingAddress
                  )}
                </p>
                <Button
                  variant="outline"
                  className="mt-2 w-full text-sm"
                  type="button"
                  onClick={() => {
                    setPartyModalTarget("bill");
                    setPartyModalOpen(true);
                  }}
                >
                  Change Party
                </Button>
              </div>
            </div>

            <div>
              <label className="input-label">Ship To</label>
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70">
                {/* Falls back to the Bill To party until a different ship-to
                    party is explicitly chosen. */}
                {(() => {
                  const ship = shipToDetails || partyDetails;
                  const usingBillTo = !shipToDetails;
                  return (
                    <>
                      <p className="text-sm font-medium mb-1">
                        {ship?.partyName || ship?.name || "Select Shipping Party"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {ship?.mobileNo || ship?.mobileNumber || ""}
                      </p>
                      <p className="text-xs text-gray-600">
                        {(() => {
                          const shipping = formatPartyAddress(
                            ship?.shippingAddressData ||
                              ship?.shippingAddress ||
                              ship?.billingAddressData ||
                              ship?.billingAddress
                          );
                          if (shipping) return shipping;
                          return (
                            <span className="italic text-gray-400">
                              {usingBillTo ? "Same as billing address" : "No address"}
                            </span>
                          );
                        })()}
                      </p>
                    </>
                  );
                })()}
                <Button
                  variant="outline"
                  className="mt-2 w-full text-sm"
                  type="button"
                  onClick={() => {
                    setPartyModalTarget("ship");
                    setPartyModalOpen(true);
                  }}
                >
                  {shipToDetails ? "Change Party" : "Set Different Party"}
                </Button>
              </div>
            </div>
          </div>
        )}
        </Card>

        {/* Invoice details */}
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
            min={0}
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

        {/* Items */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg primary-font text-gray-800">Items</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setItemModalOpen(true)}
            >
              <FiPlus /> Add Item
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              data={formik.values.itemDetails}
              emptyMessage="No items added yet — click “Add Item” to get started"
            />
          </div>
        </Card>

        {/* Summary */}
        <Card className="p-4 sm:p-6">
        <h2 className="text-lg primary-font text-gray-800 mb-4">Summary &amp; Payment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label htmlFor="sale-notes" className="text-sm text-gray-700 input-label">
              Notes
            </label>
            <textarea
              id="sale-notes"
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
              min={0}
              max={Number.MAX_SAFE_INTEGER}
              value={formik.values.additionalCharges}
              onChange={handleAdditionalChargesChange}
              className="input-field"
              placeholder="+ Additional Charges"
            />

            <label className="mt-4 block input-label">Discount After Tax</label>
            <input
              type="number"
              name="discountAfterTax"
              min={0}
              value={formik.values.discountAfterTax}
              onChange={(e) => {
                // A discount can never be negative (it would act as a surcharge).
                e.target.value = e.target.value.replace(/-/g, "");
                formik.handleChange(e);
              }}
              className="input-field"
              placeholder="- Discount After Tax"
            />

            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 text-sm space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Taxable Amount</span>
                <span className="secondary-font text-gray-800">
                  ₹
                  {formik.values.itemDetails
                    .reduce((acc, row) => {
                      const basePrice = row.basePricePerItem ?? row.pricePerItem;
                      const priceAfterDiscount =
                        basePrice - (row.discountBeforeTax || 0);
                      return acc + priceAfterDiscount * (row.quantity || 1);
                    }, 0)
                    .toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-slate-200 text-gray-900">
                <span className="secondary-font">Total Amount</span>
                <span className="text-lg primary-font text-primary">
                  ₹
                  {formik.values.totalSaleAmount.toFixed(2)}
                </span>
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

            <label className="mt-4 block input-label">Received Amount</label>
            <input
              type="number"
              name="receivedAmount"
              min={0}
              value={formik.values.receivedAmount}
              onChange={(e) => {
                // Received amount can't be negative.
                e.target.value = e.target.value.replace(/-/g, "");
                formik.handleChange(e);
              }}
              className="input-field mt-2"
              placeholder="Received Amount"
            />
            {warningText && (
              <div className="flex items-center gap-1 mt-1 text-yellow-600 text-sm">
                <FaExclamationTriangle />
                <span>{warningText}</span>
              </div>
            )}

            {/* Partial Payment breakdown */}
            <label className="mt-4 block input-label">Cash Payment</label>
            <input
              type="number"
              name="cash"
              value={formik.values.cash}
              onChange={(e) => handlePartialPaymentChange(e, "cash")}
              className="input-field"
              placeholder="Cash Payment"
              min={0}
            />
            <label className="mt-4 block input-label">online Payment</label>
            <input
              type="number"
              name="online"
              value={formik.values.online}
              onChange={(e) => handlePartialPaymentChange(e, "online")}
              className="input-field"
              placeholder="online Payment"
              min={0}
            />

            <div className="flex justify-between items-center mt-3 rounded-xl bg-emerald-50 border border-emerald-200/70 px-4 py-3 text-sm">
              <span className="secondary-font text-emerald-800">Balance Amount</span>
              <span className="text-base primary-font text-emerald-600">₹{formik.values.dueAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        </Card>
      </form>
    </div>
  );
};

export default CreateSalesForm;
