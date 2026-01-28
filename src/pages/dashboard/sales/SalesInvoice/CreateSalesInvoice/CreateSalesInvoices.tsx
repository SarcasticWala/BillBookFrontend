import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { FaArrowLeft, FaExclamationTriangle, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { PartySelectorModal } from "./PartySelectorModal";
import { ItemSelectorModal } from "./ItemSelectorModal";
import { useGetPartyByIdQuery } from "../../../../../features/party/partyApiSlice";
import { useGetItemByIdQuery } from "../../../../../features/item/itemApiSlice";
import { useCreateSaleMutation } from "../../../../../features/sales/saleApiSlice";
import { Button } from "../../../../../components/UI/Button";
import { skipToken } from "@reduxjs/toolkit/query";
import { toast } from "react-toastify";
import { Table, type Column } from "../../../../../components/Table/Table";
import * as Yup from "yup";

export const CreateSalesForm: React.FC = () => {
  const navigate = useNavigate();
  const [isPartyModalOpen, setPartyModalOpen] = useState(false);
  const [isItemModalOpen, setItemModalOpen] = useState(false);
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [selectedItemTemp, _setSelectedItemTemp] = useState<any | null>(null);

  console.log("[DEBUG] selectedPartyId:", selectedPartyId);
  console.log("[DEBUG] selectedItemTemp:", selectedItemTemp);

  const { data: partyResponse } = useGetPartyByIdQuery(
    selectedPartyId ? selectedPartyId : skipToken
  );
  const partyDetails = partyResponse?.data;
  console.log("[DEBUG] partyDetails fetched:", partyDetails);

  const { data: itemDetailsResponse } = useGetItemByIdQuery(
    selectedItemTemp
      ? {
          id: selectedItemTemp.id,
          itemType: selectedItemTemp.itemName ? "PRODUCT" : "SERVICE",
        }
      : skipToken
  );
  const itemDetailsFetch = itemDetailsResponse?.data;
  console.log("[DEBUG] itemDetailsFetch fetched:", itemDetailsFetch);

  const [createSale] = useCreateSaleMutation();

  const formik = useFormik({
    initialValues: {
      partyId: "",
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
      console.log("[DEBUG] Submitting form with values:", values);

      const partialSum = Number(values.cash) + Number(values.online);
      if (partialSum > values.receivedAmount) {
        toast.error(
          "Sum of cash and online payments cannot exceed received amount."
        );
        console.warn("[DEBUG] Payment validation failed");
        return;
      }

      try {
        await createSale(values).unwrap();
        console.log("[DEBUG] Sale created successfully");
        toast.success("Sales invoice created successfully!");
        navigate("/sales/invoices");
      } catch (error: any) {
        console.error("[DEBUG] Sale creation error:", error);
        toast.error(
          error?.data?.message ||
            "Failed to create sales invoice. Please try again."
        );
      }
    },
  });

  const handleAdditionalChargesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    console.log("[DEBUG] Additional charges input changed:", value);
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
      console.log("[DEBUG] Populating partyId in form:", partyDetails.id);
      formik.setFieldValue("partyId", partyDetails.id);
    }
  }, [partyDetails]);

  useEffect(() => {
    console.log("***********************************");
    
    if (itemDetailsFetch) {
      console.log("[DEBUG] Adding new fetched item to form:", itemDetailsFetch);

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
        console.log("*************************************ROW************",row);
      }
    }
    
  }, [itemDetailsFetch]);

  useEffect(() => {
    console.log("[DEBUG] Recalculating totals...");

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

    console.log("[DEBUG] sub:", sub);
    console.log("[DEBUG] totalTaxableSaleAmount:", totalTaxableSaleAmount);
    console.log("[DEBUG] totalTax:", totalTax);
    console.log("[DEBUG] totalWithAdd:", totalWithAdd, "due:", due);

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
    console.log(
      `[DEBUG] Partial payment change for ${fieldName}:`,
      e.target.value
    );
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
    console.log("******************************[DEBUG] Updated item details:", updated);
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
    { header: "Qty", accessor: "quantity" },
    {
      header: "Price/Item",
      render: (_, row, index) => (
        <input
          type="number"
          value={row.pricePerItem}
          data-actual-value={row.actualPricePerItem}
          onChange={(e) => handlePriceChange(index, e.target.value)}
          className="w-24 rounded px-1 py-0.5 text-right bg-pink-50 border-none focus:outline-none text-[13px]"
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
              className="w-full rounded px-4 py-0.5 text-right bg-pink-50 border-none focus:outline-none text-[13px]"
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
              className="w-full rounded pr-4 py-0.5 text-right bg-pink-50 border-none focus:outline-none text-[13px]"
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
              className="w-full rounded px-4 py-0.5 text-right bg-pink-50 border-none focus:outline-none text-[13px]"
              placeholder="0"
            />
          </div>
          <div className="relative w-20">
            <input
              type="number"
              value={row.taxPercentage}
              onChange={(e) => handleTaxPercentChange(index, e.target.value)}
              className="w-full rounded pr-4 py-0.5 text-right bg-pink-50 border-none focus:outline-none text-[13px]"
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
    <div className="p-6 mx-auto max-w-7xl secondary-font">
      <PartySelectorModal
        isOpen={isPartyModalOpen}
        onClose={() => setPartyModalOpen(false)}
        onSelect={(p) => {
          console.log("[DEBUG] Party selected from modal:", p);
          setSelectedPartyId(p.id);
        }}
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

      <form
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
        className="space-y-8"
      >
        {/* header & navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-gray-800">
            <FaArrowLeft
              className="cursor-pointer text-lg"
              onClick={() => navigate("/sales/invoices")}
            />
            <h1 className="text-xl primary-font">Create Sales Invoice</h1>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Save Sales Invoice
          </button>
        </div>

        {/* Party Selection */}
        {!selectedPartyId ? (
          <div className="border border-dashed border-blue-400 p-4 rounded-md text-center bg-blue-50">
            <p
              className="font-medium text-primary cursor-pointer"
              onClick={() => setPartyModalOpen(true)}
            >
              + Add Party
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="input-label">Bill To</label>
              <div className="border rounded-md p-3 bg-gray-50 shadow-sm">
                <p className="text-sm font-medium mb-1">
                  {partyDetails?.name || "Select Party"}
                </p>
                <p className="text-xs text-gray-600">
                  {partyDetails?.mobileNumber || ""}
                </p>
                <p className="text-xs text-gray-600">
                  {partyDetails?.billingAddress
                    ? Object.values(partyDetails.billingAddress.miscData)
                        .filter(Boolean)
                        .join(", ")
                    : ""}
                </p>
                <Button
                  variant="outline"
                  className="mt-2 w-full text-sm"
                  type="button"
                  onClick={() => setPartyModalOpen(true)}
                >
                  Change Party
                </Button>
              </div>
            </div>

            <div>
              <label className="input-label">Ship To</label>
              <div className="border rounded-md p-3 bg-gray-50 shadow-sm">
                <p className="text-sm font-medium mb-1">
                  {partyDetails?.name
                    // ? `Shipping To: ${partyDetails.name}`
                    ? `${partyDetails.name}`
                    : "Select Shipping Party"}
                </p>
                <p className="text-xs text-gray-600">
                  {partyDetails?.mobileNumber || ""}
                </p>
                <p className="text-xs text-gray-600">
                  {partyDetails?.shippingAddress
                    ? Object.values(partyDetails.shippingAddress.miscData)
                        .filter(Boolean)
                        .join(", ")
                    : ""}
                </p>
                <Button
                  variant="outline"
                  className="mt-2 w-full text-sm"
                  type="button"
                  onClick={() => setPartyModalOpen(true)}
                >
                  Change Party
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice details */}
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
              min={0}
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

        {/* Items */}
        <div className="border border-dashed border-blue-400 p-4 rounded-md text-center bg-blue-50">
          <p
            className="font-medium text-primary cursor-pointer"
            onClick={() => setItemModalOpen(true)}
          >
            + Add Item
          </p>
        </div>

        {/* Render item rows */}
        {/* Render item rows */}
        {formik.values.itemDetails.length > 0 && (
          <Table
            columns={columns}
            data={formik.values.itemDetails}
            emptyMessage="No items added"
          />
        )}

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
          <div>
            <label
              className="text-sm cursor-pointer text-blue-600"
              onClick={() => formik.setFieldValue("notes", formik.values.notes)}
            >
              + Add Notes
            </label>
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
              value={formik.values.discountAfterTax}
              onChange={formik.handleChange}
              className="input-field"
              placeholder="- Discount After Tax"
            />

            <div className="text-sm">
              <div className="flex justify-between">
                <span>Taxable Amount</span>
                <span>
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
              <div className="flex justify-between mt-1">
                <span>Total Amount</span>
                <span>
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
              value={formik.values.receivedAmount}
              onChange={formik.handleChange}
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

export default CreateSalesForm;
