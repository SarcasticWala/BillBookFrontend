import React, { useState } from "react";
import AddressModal from "../../../components/UI/AddressModal";
import { useCreatePartyMutation } from "../../../features/party/partyApiSlice";
import CreateCategoryModal from "../../../components/UI/CreateCategoryModal";
import { useGetCategoriesQuery } from "../../../features/party/partyApiSlice";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import {
  useUpdatePartyMutation,
  useGetPartyByIdQuery,
} from "../../../features/party/partyApiSlice";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import { Button } from "../../../components/UI/Button";
import { Card } from "../../../components/UI/Card";

const CreateParty: React.FC = () => {
  const { id } = useParams();
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

  // Fetch categories
  const { data: categoriesData } = useGetCategoriesQuery(undefined);
  const categoryOptions = categoriesData?.data || [];

  const { data: partyData, isLoading: isFetching } = useGetPartyByIdQuery(id!, {
    skip: !isEditMode,
  });

  type AddressData = {
    ad: string;
    st: string;
    city: string;
    pin: string;
  };

  const [billingAddressData, setBillingAddressData] =
    useState<AddressData | null>(null);
  const [shippingAddressData, setShippingAddressData] =
    useState<AddressData | null>(null);

  const [showModalFor, setShowModalFor] = useState<
    "billing" | "shipping" | null
  >(null);
  const [sameAsBilling, setSameAsBilling] = useState(true);

  const [createParty, { isLoading }] = useCreatePartyMutation();

  const handleAddressSave = (address: any) => {
    if (showModalFor === "billing") {
      setBillingAddressData(address);
      if (sameAsBilling) {
        setShippingAddressData(address);
      }
    } else {
      setShippingAddressData(address);
    }
    setShowModalFor(null);
  };

  const navigate = useNavigate();

  const [updateParty] = useUpdatePartyMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      } else {
        await createParty(payload).unwrap();
        toast.success("Party created successfully");
      }
      navigate("/parties");
    }  catch (err:any) {
      console.error("Error:", err.data.message);
      toast.error(err.data.message ? err.data.message : "Failed to save party");
    }
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
        p.billingAddress?.id === p.shippingAddress?.id ||
          p.billingAddress?.type === "BOTH"
      );
    }
  }, [partyData]);

  return (
    <div className="p-6 max-w-5xl mx-auto secondary-font">
      <button
        type="button"
        onClick={() => navigate("/parties")}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer mb-4"
      >
        <FaArrowLeft />
        <span>Back</span>
      </button>
      <h1 className="text-2xl primary-font text-gray-800 mb-1">
        {isEditMode ? "Edit Party" : "Create Party"}
      </h1>
      <p className="text-sm light-font text-gray-500 mb-6">
        Fill in the details below
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Party details */}
        <Card className="p-6 space-y-5">
          <h2 className="text-lg primary-font text-gray-800">Party Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
            <div>
              <label className="input-label">
                Party Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={partyName}
                placeholder="Enter name"
                onChange={(e) => setPartyName(e.target.value)}
                required
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="input-label">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={mobileNo}
                placeholder="Enter mobile number"
                onChange={(e) => setMobileNo(e.target.value)}
                maxLength={10}
                required
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="input-label">Email</label>
              <input
                type="email"
                value={email}
                placeholder="Enter email"
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="input-label">Opening Balance</label>
              <div className="w-full flex items-center">
                <div className="flex items-center input-field !rounded-r-none w-1/2">
                  <span className="text-gray-700 mr-2">₹</span>
                  <input
                    type="number"
                    placeholder="0"
                    style={{ border: "none", boxShadow: "none", padding: 0 }}
                    className="input-field w-full outline-none !shadow-none"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(Number(e.target.value))}
                  />
                </div>
                <div className="w-1/2">
                  <select
                    value={openingBalanceType}
                    onChange={(e) => {
                      const selected = e.target.value;
                      setOpeningBalanceType(
                        selected === "TO_PAY" ? "TO_PAY" : "TO_COLLECT"
                      );
                    }}
                    className="input-field w-full !rounded-l-none bg-gray-100 text-gray-700"
                  >
                    <option value="TO_COLLECT">To Collect</option>
                    <option value="TO_PAY">To Pay</option>
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label className="input-label">GSTIN</label>
              <input
                type="text"
                value={gstNumber}
                placeholder="ex: 29XXXXX9438X1XX"
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                maxLength={15}
                className="input-field w-full uppercase placeholder:normal-case"
              />
            </div>
            <div>
              <label className="input-label">PAN Number</label>
              <input
                type="text"
                value={panNumber}
                placeholder="Enter party PAN Number"
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                maxLength={10}
                className="input-field w-full uppercase placeholder:normal-case"
              />
            </div>
          </div>
        </Card>

        {/* General details */}
        <Card className="p-6 space-y-5">
          <h2 className="text-lg primary-font text-gray-800">General Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
            <div>
              <label className="input-label">
                Party Type <span className="text-red-500">*</span>
              </label>
              <select
                value={partyType}
                onChange={(e) => setPartyType(e.target.value)}
                className="input-field w-full bg-white"
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
                className="input-field w-full bg-white"
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
          </div>
          {showCategoryModal && (
            <CreateCategoryModal
              onClose={(createdId?: string) => {
                setShowCategoryModal(false);
                if (createdId) setPartyCategory(createdId);
              }}
            />
          )}
        </Card>

        {/* Address */}
        <Card className="p-6 space-y-5">
          <h2 className="text-lg primary-font text-gray-800">Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
            <div>
              <label className="input-label">Billing Address</label>
              <textarea
                readOnly
                placeholder="Enter billing address"
                value={
                  billingAddressData
                    ? `${billingAddressData.ad}, ${billingAddressData.city}, ${billingAddressData.st}, ${billingAddressData.pin}`
                    : ""
                }
                onClick={() => setShowModalFor("billing")}
                className="input-field w-full bg-gray-100 cursor-pointer"
              />
            </div>
            <div>
              <label className="input-label">Shipping Address</label>
              <textarea
                readOnly
                placeholder="Enter shipping address"
                value={
                  shippingAddressData
                    ? `${shippingAddressData.ad}, ${shippingAddressData.city}, ${shippingAddressData.st}, ${shippingAddressData.pin}`
                    : ""
                }
                onClick={() => {
                  if (!sameAsBilling) setShowModalFor("shipping");
                }}
                className="input-field w-full cursor-pointer"
              />
              <div className="mt-2 flex items-center">
                <input
                  id="sameAddress"
                  type="checkbox"
                  checked={sameAsBilling}
                  onChange={(e) => {
                    setSameAsBilling(e.target.checked);
                    if (e.target.checked) {
                      setShippingAddressData(billingAddressData);
                    }
                  }}
                />
                <label htmlFor="sameAddress" className="ml-2 text-sm">
                  Same as Billing address
                </label>
              </div>
            </div>
          </div>
        </Card>

        <AddressModal
          isOpen={!!showModalFor}
          onClose={() => setShowModalFor(null)}
          onSave={handleAddressSave}
          initial={
            showModalFor === "shipping" ? shippingAddressData : billingAddressData
          }
        />

        {/* Credit details */}
        <Card className="p-6 space-y-5">
          <h2 className="text-lg primary-font text-gray-800">Credit Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
            <div>
              <label className="input-label">Credit Period</label>
              <input
                type="number"
                placeholder="ex: 30 (in days)"
                value={creditPeriod}
                onChange={(e) => setCreditPeriod(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="input-label">Credit Limit</label>
              <input
                type="number"
                placeholder="0"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/parties")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading || isFetching
              ? "Saving..."
              : isEditMode
              ? "Update Party"
              : "Save Party"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateParty;
