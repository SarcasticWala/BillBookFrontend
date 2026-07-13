import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AddressModal from "../../../components/UI/AddressModal";
import CreateCategoryModal from "../../../components/UI/CreateCategoryModal";
import {
  useCreatePartyMutation,
  useUpdatePartyMutation,
  useGetPartyByIdQuery,
  useGetCategoriesQuery,
} from "../../../features/party/partyApiSlice";
import { Button } from "../../../components/UI/Button";
import { Input } from "../../../components/UI/Input";
import { Textarea } from "../../../components/UI/Textarea";
import { PageHeader } from "../../../components/UI/PageHeader";
import { FormSection } from "../../../components/UI/FormSection";

type AddressData = { ad: string; st: string; city: string; pin: string };

const CreateParty: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [partyName, setPartyName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [openingBalanceType, setOpeningBalanceType] = useState("TO_COLLECT");
  const [partyType, setPartyType] = useState("CUSTOMER");
  const [partyCategory, setPartyCategory] = useState("");
  const [creditPeriod, setCreditPeriod] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [billingAddressData, setBillingAddressData] = useState<AddressData | null>(null);
  const [shippingAddressData, setShippingAddressData] = useState<AddressData | null>(null);
  const [showModalFor, setShowModalFor] = useState<"billing" | "shipping" | null>(null);
  const [sameAsBilling, setSameAsBilling] = useState(true);

  const { data: categoriesData } = useGetCategoriesQuery(undefined);
  const categoryOptions = categoriesData?.data || [];

  const { data: partyData, isLoading: isFetching } = useGetPartyByIdQuery(id!, {
    skip: !isEditMode,
  });

  const [createParty, { isLoading }] = useCreatePartyMutation();
  const [updateParty, { isLoading: isUpdating }] = useUpdatePartyMutation();
  const saving = isLoading || isUpdating;

  const handleAddressSave = (address: AddressData) => {
    if (showModalFor === "billing") {
      setBillingAddressData(address);
      if (sameAsBilling) setShippingAddressData(address);
    } else {
      setShippingAddressData(address);
    }
    setShowModalFor(null);
  };

  const resetForm = () => {
    setPartyName("");
    setMobileNo("");
    setEmail("");
    setGstNumber("");
    setPanNumber("");
    setOpeningBalance(0);
    setOpeningBalanceType("TO_COLLECT");
    setPartyType("CUSTOMER");
    setPartyCategory("");
    setCreditPeriod("");
    setCreditLimit("");
    setBillingAddressData(null);
    setShippingAddressData(null);
    setSameAsBilling(true);
  };

  const doSave = async (saveAndNew: boolean) => {
    if (!partyName.trim()) {
      toast.error("Party name is required");
      return;
    }
    if (mobileNo.trim().length !== 10) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }

    const payload = {
      partyName,
      mobileNo,
      email,
      gstNumber,
      panNumber,
      openingBalance: Number(openingBalance),
      openingBalanceType,
      partyType,
      partyCatagory: partyCategory,
      creditPeriod: Number(creditPeriod),
      creditLimit: Number(creditLimit),
      isSameAddress: sameAsBilling,
      billingAddressData,
      shippingAddressData: sameAsBilling ? undefined : shippingAddressData,
    };

    try {
      if (isEditMode) {
        await updateParty({ id, ...payload }).unwrap();
        toast.success("Party updated successfully");
        navigate("/parties");
      } else {
        await createParty(payload).unwrap();
        toast.success("Party created successfully");
        if (saveAndNew) resetForm();
        else navigate("/parties");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save party");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSave(false);
  };

  useEffect(() => {
    if (partyData?.data && isEditMode) {
      const p = partyData.data;
      setPartyName(p.name);
      setMobileNo(p.mobileNumber);
      setEmail(p.email || "");
      setGstNumber(p.gstin || "");
      setPanNumber(p.panNumber || "");
      setOpeningBalance(p.openingBalance || 0);
      setOpeningBalanceType(p.openingBalanceType || "TO_COLLECT");
      setPartyType(p.partyType || "CUSTOMER");
      setPartyCategory(p.partyCatagory?.id || "");
      setCreditPeriod(p.creditPeriod?.toString() || "");
      setCreditLimit(p.creditLimit?.toString() || "");
      setBillingAddressData(p.billingAddress?.miscData || null);
      setShippingAddressData(p.shippingAddress?.miscData || null);
      setSameAsBilling(
        p.billingAddress?.id === p.shippingAddress?.id || p.billingAddress?.type === "BOTH"
      );
    }
  }, [partyData]);

  const addressPreview = (a: AddressData | null) =>
    a ? [a.ad, a.city, a.st, a.pin].filter(Boolean).join(", ") : "";

  return (
    <div className="secondary-font">
      <PageHeader
        title={isEditMode ? "Edit Party" : "Create Party"}
        subtitle="Fill in the details below"
        onBack={() => navigate("/parties")}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/parties")}
              disabled={saving}
            >
              Cancel
            </Button>
            {!isEditMode && (
              <Button
                type="button"
                variant="outline"
                onClick={() => doSave(true)}
                disabled={saving}
              >
                Save &amp; New
              </Button>
            )}
            <Button type="submit" form="create-party-form" disabled={saving || isFetching}>
              {saving ? "Saving..." : isEditMode ? "Update Party" : "Save Party"}
            </Button>
          </>
        }
      />

      <form id="create-party-form" onSubmit={handleFormSubmit} className="space-y-5 max-w-5xl">
        {/* Party details */}
        <FormSection title="Party Details">
          <Input
            label="Party Name"
            required
            placeholder="Enter name"
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
          />
          <Input
            label="Mobile Number"
            required
            placeholder="Enter mobile number"
            maxLength={10}
            value={mobileNo}
            onChange={(e) => setMobileNo(e.target.value.replace(/\D/g, ""))}
          />
          <Input
            label="Email"
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="w-full">
            <label className="input-label">Opening Balance</label>
            <div className="flex items-stretch">
              <div className="flex items-center input-field !rounded-r-none w-1/2">
                <span className="text-gray-500 mr-1.5">₹</span>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full outline-none border-0 bg-transparent p-0 text-[0.95rem]"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(Number(e.target.value))}
                />
              </div>
              <select
                value={openingBalanceType}
                onChange={(e) =>
                  setOpeningBalanceType(e.target.value === "TO_PAY" ? "TO_PAY" : "TO_COLLECT")
                }
                className="input-field !rounded-l-none w-1/2 bg-gray-50 text-gray-700 border-l-0"
              >
                <option value="TO_COLLECT">To Collect</option>
                <option value="TO_PAY">To Pay</option>
              </select>
            </div>
          </div>

          <Input
            label="GSTIN"
            placeholder="ex: 29XXXXX9438X1XX"
            maxLength={15}
            className="uppercase placeholder:normal-case"
            value={gstNumber}
            onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
          />
          <Input
            label="PAN Number"
            placeholder="Enter party PAN Number"
            maxLength={10}
            className="uppercase placeholder:normal-case"
            value={panNumber}
            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
          />
        </FormSection>

        {/* General details */}
        <FormSection title="General Details">
          <div>
            <label className="input-label">
              Party Type <span className="text-red-500">*</span>
            </label>
            <select
              value={partyType}
              onChange={(e) => setPartyType(e.target.value)}
              className="input-field bg-white"
            >
              <option value="CUSTOMER">Customer</option>
              <option value="SUPPLIER">Supplier</option>
            </select>
          </div>
          <div>
            <label className="input-label">Party Category</label>
            <select
              value={partyCategory}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "__create__") {
                  e.target.value = "";
                  setShowCategoryModal(true);
                } else {
                  setPartyCategory(value);
                }
              }}
              className="input-field bg-white"
            >
              <option value="">Select Category</option>
              {categoryOptions.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.catagory}
                </option>
              ))}
              <option value="__create__" className="text-primary font-medium">
                + Create New Category
              </option>
            </select>
          </div>
        </FormSection>

        {/* Address */}
        <FormSection title="Address">
          <div>
            <label className="input-label">Billing Address</label>
            <Textarea
              readOnly
              rows={3}
              placeholder="Enter billing address"
              value={addressPreview(billingAddressData)}
              onClick={() => setShowModalFor("billing")}
              className="bg-gray-50 cursor-pointer"
            />
          </div>
          <div>
            <label className="input-label">Shipping Address</label>
            <Textarea
              readOnly
              rows={3}
              placeholder="Enter shipping address"
              value={addressPreview(shippingAddressData)}
              onClick={() => {
                if (!sameAsBilling) setShowModalFor("shipping");
              }}
              className={sameAsBilling ? "bg-gray-50 cursor-pointer" : "cursor-pointer"}
            />
            <label className="mt-2 flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={sameAsBilling}
                onChange={(e) => {
                  setSameAsBilling(e.target.checked);
                  if (e.target.checked) setShippingAddressData(billingAddressData);
                }}
              />
              Same as Billing address
            </label>
          </div>
        </FormSection>

        {/* Credit details */}
        <FormSection title="Credit Details">
          <Input
            label="Credit Period"
            type="number"
            placeholder="ex: 30 (in days)"
            value={creditPeriod}
            onChange={(e) => setCreditPeriod(e.target.value)}
          />
          <Input
            label="Credit Limit"
            type="number"
            placeholder="0"
            value={creditLimit}
            onChange={(e) => setCreditLimit(e.target.value)}
          />
        </FormSection>
      </form>

      <AddressModal
        isOpen={!!showModalFor}
        onClose={() => setShowModalFor(null)}
        onSave={handleAddressSave}
        initial={showModalFor === "shipping" ? shippingAddressData : billingAddressData}
      />

      {showCategoryModal && (
        <CreateCategoryModal
          onClose={(createdId?: string) => {
            setShowCategoryModal(false);
            if (createdId) setPartyCategory(createdId);
          }}
        />
      )}
    </div>
  );
};

export default CreateParty;
