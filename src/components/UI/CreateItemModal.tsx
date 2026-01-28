import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import { FaTimes, FaBatteryFull } from "react-icons/fa";
import {
  MdInfo,
  MdInventory,
  MdAttachMoney,
  MdMiscellaneousServices,
} from "react-icons/md";
import { Button } from "./Button";
import {
  useGetCategoriesQuery,
  useGetTaxesQuery,
  useGetUnitsQuery,
  useCreateItemMutation,
} from "../../features/item/itemApiSlice";
import CreateItemCategoryModal from "./CreateItemCategoryModal";
import { toast } from "react-toastify";
import moment from "moment";

export const CreateItemModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [itemType, setItemType] = useState<"PRODUCT" | "SERVICE">("PRODUCT");
  const [activeTab, setActiveTab] = useState<
    "BASIC" | "STOCK" | "PRICING" | "OTHER"
  >("BASIC");
  const [itemCategory, setItemCategory] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [enableLowStock, setEnableLowStock] = useState(false);
  const [images, setImages] = useState<File[]>([]);

  const { data: itemCategoriesData } = useGetCategoriesQuery(undefined);
  const categoryOptions = itemCategoriesData?.data || [];

  const { data: taxData } = useGetTaxesQuery();
  const { data: unitData } = useGetUnitsQuery();

  const taxOptions = taxData?.data || [];
  const unitOptions = unitData?.data || [];

  const [form, setForm] = useState({
    itemName: "",
    isOnlineVisible: false,
    salePrice: "",
    salePriceTaxType: "WITH_TAX",
    gstRate: "",
    unit: "",
    itemCategory: "",
    openingStock: "",
    serviceCode: "",
    itemCode: "",
    hsnCode: "",
    asOfDate: "", // make it default to today if opened today
    lowStockQty: "",
    description: "",
    purchasePrice: "",
    purchasePriceTaxType: "WITH_TAX",
    sacCode: "",
    itemProductType: "NEW",
    hasSerialisationOn: false,
    itemSerialNos: [] as string[],
    batteryPercentage: "",
  });
  useEffect(() => {
    //date should be selected as current date by default and then use can change accordingly
    if (isOpen) {
      setForm((prev) => ({
        ...prev,
        asOfDate: moment().format("YYYY-MM-DD"),
      }));
    }
  }, [isOpen]);

  const [createItem, { isLoading }] = useCreateItemMutation();

  const validateForm = () => {
    const errors: string[] = [];

    // Common for all items
    if (!form.itemName.trim()) {
      errors.push("Item Name is required");
    }

    if (itemType === "PRODUCT") {
      if (!form.itemCode.trim()) {
        errors.push("Item Code is required");
      }
      if (
        form.hasSerialisationOn &&
        form.itemSerialNos.some((sn) => !sn.trim())
      ) {
        errors.push(
          "All serial numbers must be filled when serialisation is on"
        );
      }
    }

    if (itemType === "SERVICE") {
      if (!form.serviceCode.trim()) {
        errors.push("Service Code is required");
      }
      if (!form.sacCode.trim()) {
        errors.push("SAC Code is required");
      }
    }

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      if (images.length > 5) {
        toast.error("You can upload a maximum of 5 images");
        return;
      }
      const formData = new FormData();
      formData.append("itemType", itemType);
      formData.append("itemName", form.itemName);
      formData.append("isOnlineVisible", String(form.isOnlineVisible));
      formData.append(
        "isSaleTaxApplicable",
        String(form.salePriceTaxType === "WITH_TAX")
      );
      formData.append("salePrice", form.salePrice);
      formData.append("gstRate", form.gstRate);
      formData.append("unit", form.unit);
      formData.append("itemCatagory", itemCategory);
      formData.append("itemProductType", form.itemProductType);
      formData.append("hasSerialisationOn", String(form.hasSerialisationOn));

      if (itemType === "PRODUCT") {
        formData.append("openingStock", form.openingStock);
        formData.append("itemCode", form.itemCode);
        formData.append("hsnCode", form.hsnCode);
        formData.append("asOfDate", form.asOfDate);
        formData.append("description", form.description);
        formData.append("productAlertValue", form.lowStockQty || "0");
        formData.append("isAlertEnabled", String(enableLowStock));
        formData.append("purchasePrice", form.purchasePrice);
        formData.append(
          "isPurchaseTaxApplicable",
          String(form.purchasePriceTaxType === "WITH_TAX")
        );

        if (Number(form.openingStock) < 1) {
          // opening stock < 1 → send empty array
          formData.append("itemSerialNos[]", "");
        } else {
          if (form.itemSerialNos && form.itemSerialNos.length > 0) {
            form.itemSerialNos.forEach((sn, idx) => {
              formData.append(`itemSerialNos[${idx}]`, sn);
            });
          }
        }
      } else {
        formData.append("serviceCode", form.serviceCode);
        formData.append("sacCode", form.sacCode);
        formData.append("description", form.description);
      }

      images.forEach((file) => {
        formData.append("itemImages", file);
      });

      await createItem(formData).unwrap();
      toast.success("Item created successfully");
      resetAll();
      onClose();
    } catch (err: any) {
      console.error("Error saving item", err);
      toast.error(err?.data?.message || "Failed to save item");
    }
  };

  const resetAll = () => {
    setForm({
      itemName: "",
      isOnlineVisible: false,
      salePrice: "",
      salePriceTaxType: "WITH_TAX",
      gstRate: "",
      unit: "",
      itemCategory: "",
      openingStock: "",
      serviceCode: "",
      itemCode: "",
      hsnCode: "",
      asOfDate: "",
      lowStockQty: "",
      description: "",
      purchasePrice: "",
      purchasePriceTaxType: "WITH_TAX",
      sacCode: "",
      itemProductType: "NEW",
      hasSerialisationOn: false,
      itemSerialNos: [],
      batteryPercentage: "", // for preowned products
    });
    setItemCategory("");
    setEnableLowStock(false);
    setItemType("PRODUCT");
    setActiveTab("BASIC");
    setImages([]);
  };

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type, checked } = e.target;

    // Product Type radio
    if (name === "itemProductType") {
      const isOld = value === "OLD";
      const newStock = isOld ? "1" : "";
      const newSerials = isOld && form.hasSerialisationOn ? [""] : [];

      setForm((prev) => ({
        ...prev,
        [name]: value,
        openingStock: newStock,
        itemSerialNos: newSerials,
        purchasePriceTaxType: isOld ? "WITHOUT_TAX" : prev.purchasePriceTaxType,
        salePriceTaxType: isOld ? "WITHOUT_TAX" : prev.salePriceTaxType,
      }));
      return;
    }

    // Opening Stock changes with serial number tracking
    if (name === "openingStock") {
      const stockNum = parseInt(value) || 0;
      const newSerials =
        form.hasSerialisationOn && stockNum > 0
          ? Array.from(
              { length: stockNum },
              (_, i) => form.itemSerialNos[i] || ""
            )
          : [];
      setForm((prev) => ({
        ...prev,
        openingStock: value,
        itemSerialNos: newSerials,
      }));
      return;
    }

    if (name === "hasSerialisationOn") {
      const isOn = checked;
      const stockNum =
        parseInt(form.openingStock) || (form.itemProductType === "OLD" ? 1 : 0);
      setForm((prev) => ({
        ...prev,
        hasSerialisationOn: isOn,
        itemSerialNos:
          isOn && stockNum > 0
            ? Array.from({ length: stockNum }, () => "")
            : [],
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const isService = itemType === "SERVICE";

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen bg-[#00000070] p-4">
        <div className="bg-white w-full max-w-6xl rounded-lg p-6 relative secondary-font">
          {/* Header */}
          <div className="flex justify-between items-center pb-2 mb-4">
            <h2 className="text-xl primary-font">Create New Item</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black cursor-pointer"
            >
              <FaTimes />
            </button>
          </div>

          {/* Content */}
          <div className="flex gap-6">
            {/* Sidebar Tabs */}
            <div className="w-1/4 border border-gray-200 rounded-md p-4 shadow-sm">
              <ul className="space-y-2">
                <li
                  onClick={() => setActiveTab("BASIC")}
                  className={`cursor-pointer flex-tab p-2 ${
                    activeTab === "BASIC"
                      ? "bg-purple-100 text-purple-800 font-medium rounded-md"
                      : "text-gray-700"
                  }`}
                >
                  <MdInfo className="text-lg" />
                  <p>Basic Details *</p>
                </li>
                {isService ? (
                  <li
                    onClick={() => setActiveTab("OTHER")}
                    className={`cursor-pointer flex-tab p-2 ${
                      activeTab === "OTHER"
                        ? "bg-purple-100 text-purple-800 font-medium rounded-md"
                        : "text-gray-700"
                    }`}
                  >
                    <MdMiscellaneousServices className="text-lg" />
                    <p>Other Details</p>
                  </li>
                ) : (
                  <>
                    <li
                      onClick={() => setActiveTab("STOCK")}
                      className={`cursor-pointer flex-tab p-2 ${
                        activeTab === "STOCK"
                          ? "bg-purple-100 text-purple-800 font-medium rounded-md"
                          : "text-gray-700"
                      }`}
                    >
                      <MdInventory className="text-lg" />
                      <p>Stock Details*</p>
                    </li>
                    <li
                      onClick={() => setActiveTab("PRICING")}
                      className={`cursor-pointer flex-tab p-2 ${
                        activeTab === "PRICING"
                          ? "bg-purple-100 text-purple-800 font-medium rounded-md"
                          : "text-gray-700"
                      }`}
                    >
                      <MdAttachMoney className="text-lg" />
                      <p>Pricing Details</p>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Form Panels */}
            <div className="w-3/4 space-y-5 min-h-[500px] border border-gray-200 rounded-md p-4 shadow-sm">
              {activeTab === "BASIC" && (
                <>
                  {/* Item Type */}
                  <div>
                    <label className="input-label">Item Type *</label>
                    <div className="flex gap-6 mt-1">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="PRODUCT"
                          checked={itemType === "PRODUCT"}
                          onChange={() => setItemType("PRODUCT")}
                        />
                        Product
                      </label>
                      {/* <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="SERVICE"
                          checked={itemType === "SERVICE"}
                          onChange={() => {
                            setItemType("SERVICE");
                            setActiveTab("BASIC");
                            // Reset product-specific fields
                            setForm((prev) => ({
                              ...prev,
                              itemCode: "", // clear itemCode
                              openingStock: "",
                              itemProductType: "NEW",
                              hasSerialisationOn: false,
                              itemSerialNos: [],
                            }));
                          }}
                        />
                        Service
                      </label> */}
                    </div>
                  </div>

                  {/* Product Type (only for PRODUCT) */}
                  {itemType === "PRODUCT" && (
                    <div>
                      <label className="input-label">Product Condition *</label>
                      <div className="flex gap-6 mt-1">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="itemProductType"
                            value="NEW"
                            checked={form.itemProductType === "NEW"}
                            onChange={handleChange}
                          />
                          New
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="itemProductType"
                            value="OLD"
                            checked={form.itemProductType === "OLD"}
                            onChange={handleChange}
                          />
                          Preowned
                        </label>
                      </div>
                    </div>
                  )}
                  {/* add battery 🔋 percentage (float value toFix(2)) */}
                  {itemType === "PRODUCT" && form.itemProductType === "OLD" && (
                    <div className="mt-3">
                      <label className="flex items-center gap-2 mb-1 text-gray-700">
                        <span>Battery Percentage</span>
                        <FaBatteryFull className="text-green-500" />
                        <span className="text-sm text-gray-500">(0-100%)</span>
                      </label>
                      <input
                        type="number"
                        name="batteryPercentage"
                        value={form.batteryPercentage}
                        onChange={handleChange}
                        placeholder="ex: 85.50"
                        className="input-field w-full"
                        min={0}
                        max={100}
                        step="0.01"
                      />
                    </div>
                  )}

                  {/* Category */}
                  <div>
                    <label className="input-label">Item Category</label>
                    <select
                      value={itemCategory}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "__create__") {
                          e.target.value = "";
                          setShowCategoryModal(true);
                        } else setItemCategory(v);
                      }}
                      className="input-field w-full border px-3 py-2 rounded"
                    >
                      <option value="">Select Category</option>
                      {categoryOptions.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.catagory}
                        </option>
                      ))}
                      <option
                        value="__create__"
                        className="text-blue-600 font-medium"
                        style={{
                          borderTop: "1px dotted #ccc",
                          marginTop: "4px",
                          paddingTop: "8px",
                        }}
                      >
                        + Create New Category
                      </option>
                    </select>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="input-label">
                      {itemType === "PRODUCT"
                        ? "Item Name *"
                        : "Service Name *"}
                    </label>
                    <input
                      name="itemName"
                      value={form.itemName}
                      onChange={handleChange}
                      placeholder={
                        itemType === "PRODUCT"
                          ? "Please enter the item name"
                          : "ex: Mobile service"
                      }
                      className="input-field w-full"
                    />
                  </div>

                  {/* Online visibility */}
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      name="isOnlineVisible"
                      checked={form.isOnlineVisible}
                      onChange={handleChange}
                    />
                    <label className="input-label">
                      Show Item in Online Store
                    </label>
                  </div>

                  {/* Service code or Opening Stock */}
                  {isService && (
                    <div>
                      <label className="input-label">Service Code</label>
                      <input
                        name="serviceCode"
                        value={form.serviceCode}
                        onChange={handleChange}
                        placeholder="Enter Service Code"
                        className="input-field w-full"
                      />
                    </div>
                  )}

                  {/* GST Rate */}
                  <div>
                    <label className="input-label">GST Tax Rate (%)</label>
                    <select
                      name="gstRate"
                      value={form.gstRate}
                      onChange={handleChange}
                      className="input-field w-full"
                    >
                      <option value="">None</option>
                      {taxOptions.map((tax: any) => (
                        <option key={tax.id} value={tax.id}>
                          GST @ {tax.value}%{" "}
                          {tax.cessValue != 0
                            ? `+ cess @ ${tax.cessValue}`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="input-label">Measuring Unit</label>
                    <select
                      name="unit"
                      value={form.unit}
                      onChange={handleChange}
                      className="input-field w-full"
                    >
                      <option value="">None</option>
                      {unitOptions.map((u: any) => (
                        <option key={u.id} value={u.id}>
                          {u.name} - {u.shortName}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {activeTab === "OTHER" && (
                <>
                  <div>
                    <label className="input-label">SAC Code</label>
                    <input
                      name="sacCode"
                      value={form.sacCode}
                      onChange={handleChange}
                      placeholder="Enter SAC Code"
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="input-label">Description</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      className="input-field w-full"
                      placeholder="Enter Description"
                    />
                  </div>
                </>
              )}

              {activeTab === "STOCK" && !isService && (
                <>
                  <div>
                    <label className="input-label">Item Code *</label>
                    <div className="flex gap-2">
                      <input
                        name="itemCode"
                        value={form.itemCode}
                        onChange={handleChange}
                        placeholder="Add prefix or enter item code"
                        className="input-field w-full"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const prefix = form.itemCode.trim().toUpperCase();
                          const suffixLength = 10 - prefix.length;
                          let suffix = "";

                          if (suffixLength <= 0) {
                            suffix = ""; // don't append anything
                          } else {
                            const timestamp = Date.now().toString();
                            suffix = timestamp.slice(-suffixLength);
                          }

                          const fullCode = (prefix || "") + suffix;

                          setForm((prev) => ({
                            ...prev,
                            itemCode: fullCode.slice(0, 10), // ensure exactly 10 characters
                          }));
                        }}
                        className="whitespace-nowrap"
                      >
                        Generate Code
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="input-label">HSN Code</label>
                    <input
                      name="hsnCode"
                      type="number"
                      value={form.hsnCode}
                      onChange={handleChange}
                      placeholder="ex: 4010"
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="input-label">As of Date</label>
                    <input
                      name="asOfDate"
                      type="date"
                      value={form.asOfDate}
                      onChange={handleChange}
                      className="input-field w-full"
                    />
                  </div>

                  {/* Opening Stock */}
                  <div>
                    <label className="input-label">Opening Stock</label>
                    <input
                      type="number"
                      name="openingStock"
                      value={form.openingStock}
                      onChange={handleChange}
                      min={0} //-ve stock not allowed
                      step="1" // int values only
                      disabled={form.itemProductType === "OLD"}
                      placeholder="ex: 150"
                      className="input-field w-full"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <label className="input-label">
                      Enable Serial Number Tracking
                    </label>
                    <div className="relative group">
                      <span className="w-4 h-4 flex items-center justify-center rounded-full bg-gray-300 text-xs font-bold cursor-pointer">
                        i
                      </span>
                      {/* Tooltip */}
                      <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max max-w-xs bg-black text-white text-xs rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        You can add IMEI numbers/Serial numbers equal to the
                        Opening Stock value.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => {
                          const stockNum =
                            parseInt(prev.openingStock || "0") || 0;
                          return {
                            ...prev,
                            hasSerialisationOn: !prev.hasSerialisationOn,
                            itemSerialNos:
                              !prev.hasSerialisationOn && stockNum > 0
                                ? Array.from({ length: stockNum }, () => "")
                                : [],
                          };
                        })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        form.hasSerialisationOn ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          form.hasSerialisationOn
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {form.hasSerialisationOn &&
                    parseInt(form.openingStock || "0") > 0 && (
                      <div className="mt-4 space-y-2">
                        <label className="input-label">
                          IMEI number/ Serial numbers
                        </label>
                        {form.itemSerialNos.map((serial, idx) => (
                          <input
                            key={idx}
                            value={serial}
                            onChange={(e) => {
                              const newSerials = [...form.itemSerialNos];
                              newSerials[idx] = e.target.value;
                              setForm((prev) => ({
                                ...prev,
                                itemSerialNos: newSerials,
                              }));
                            }}
                            placeholder={`Serial ${idx + 1}`}
                            className="input-field w-full"
                          />
                        ))}
                      </div>
                    )}
                  {form.itemProductType !== "OLD" && (
                    <div>
                      <label className="input-label">Low Stock Warning</label>
                      <button
                        type="button"
                        className="text-blue-600 text-sm underline cursor-pointer"
                        onClick={() => setEnableLowStock(true)}
                      >
                        + Enable Low stock quantity warning
                      </button>
                      {enableLowStock && (
                        <div className="bg-gray-100 p-4 mt-2 rounded">
                          <div className="flex justify-between items-center">
                            <label className="input-label">
                              Low Stock Quantity
                            </label>
                            <button
                              type="button"
                              className="text-red-500 text-sm cursor-pointer"
                              onClick={() => setEnableLowStock(false)}
                            >
                              X Remove
                            </button>
                          </div>
                          <input
                            name="lowStockQty"
                            value={form.lowStockQty}
                            onChange={handleChange}
                            placeholder="Enter Low Stock Quantity"
                            type="number"
                            className="input-field w-full"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="input-label">Description</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      className="input-field w-full"
                      placeholder="Enter Description"
                    />
                  </div>

                  <div>
                    <label className="input-label">Upload Images</label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded p-4 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const droppedFiles = Array.from(
                          e.dataTransfer.files
                        ).filter((file) =>
                          ["image/png", "image/jpeg", "image/jpg"].includes(
                            file.type
                          )
                        );
                        if (images.length + droppedFiles.length > 5) {
                          toast.error("Maximum 5 images allowed");
                          return;
                        }
                        setImages((prev) => [...prev, ...droppedFiles]);
                      }}
                      onClick={() =>
                        document.getElementById("image-upload-input")?.click()
                      }
                    >
                      <p className="text-sm text-gray-600">
                        Drag and drop images here, or click to select files.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Max 5 images, PNG/JPEG
                      </p>
                    </div>

                    <input
                      id="image-upload-input"
                      type="file"
                      multiple
                      accept=".png, .jpg, .jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const selectedFiles = Array.from(e.target.files || []);
                        if (images.length + selectedFiles.length > 5) {
                          toast.error("Maximum 5 images allowed");
                          return;
                        }
                        setImages((prev) => [...prev, ...selectedFiles]);
                      }}
                    />

                    {/* Preview Thumbnails */}
                    {images.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {images.map((file, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`preview-${idx}`}
                              className="w-full h-32 object-cover rounded shadow"
                            />
                            <button
                              type="button"
                              className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 shadow hover:bg-red-100"
                              onClick={() =>
                                setImages((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                )
                              }
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === "PRICING" && !isService && (
                <>
                  <div>
                    <label className="input-label">Purchase Price</label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        name="purchasePrice"
                        value={form.purchasePrice}
                        onChange={handleChange}
                        min={0}
                        step="0.01" //decimals for currency
                        placeholder="ex: ₹200"
                        className="input-field"
                      />
                      <select
                        name="purchasePriceTaxType"
                        value={form.purchasePriceTaxType}
                        onChange={handleChange}
                        className="input-field"
                        disabled={form.itemProductType === "OLD"}
                      >
                        <option value="WITH_TAX">With Tax</option>
                        <option value="WITHOUT_TAX">Without Tax</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Sales Price</label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        name="salePrice"
                        value={form.salePrice}
                        onChange={handleChange}
                        min={0}
                        step="0.01"
                        placeholder="ex: ₹200"
                        className="input-field"
                      />
                      <select
                        name="salePriceTaxType"
                        value={form.salePriceTaxType}
                        onChange={handleChange}
                        className="input-field"
                        disabled={form.itemProductType === "OLD"}
                      >
                        <option value="WITH_TAX">With Tax</option>
                        <option value="WITHOUT_TAX">Without Tax</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 mt-6 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-gray-500 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>

          {showCategoryModal && (
            <CreateItemCategoryModal
              onClose={(createdId) => {
                setShowCategoryModal(false);
                if (createdId) setItemCategory(createdId);
              }}
            />
          )}
        </div>
      </div>
    </Dialog>
  );
};