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
    <div className="p-6 mx-auto secondary-font">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-gray-800">
            <FaArrowLeft
              className="cursor-pointer text-lg"
              onClick={() => navigate("/parties")}
            />
            <h1 className="text-xl primary-font">
              {isEditMode ? "Edit Party" : "Create Party"}
            </h1>
          </div>
          <Button
            type="submit"
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition ${
              isLoading ? "cursor-not-allowed" : "cursor-pointer"
            }`}
            disabled={isLoading}
          >
            {isLoading || isFetching
              ? "Saving..."
              : isEditMode
              ? "Update"
              : "Save"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="input-label">Party Name *</label>
            <input
              type="text"
              value={partyName}
              placeholder="Enter name"
              onChange={(e) => setPartyName(e.target.value)}
              required
              className="input-field w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Mobile Number *
            </label>
            <input
              type="text"
              value={mobileNo}
              placeholder="Enter mobile number"
              onChange={(e) => setMobileNo(e.target.value)}
              maxLength={10}
              required
              className="input-field w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              placeholder="Enter email"
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Opening Balance
            </label>
            <div className="w-full flex items-center">
              {/* Left: Amount Input with ₹ icon */}
              <div
                style={{
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                }}
                className="flex items-center border border-gray-300 rounded px-3 w-1/2"
              >
                <span className="text-gray-700 mr-2">₹</span>
                <input
                  type="number"
                  placeholder="0"
                  style={{ border: "none", boxShadow: "none" }}
                  className="input-field w-full outline-none"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(Number(e.target.value))}
                />
              </div>

              {/* Right: Dropdown for To Collect / To Pay */}
              <div className="w-1/2">
                <select
                  value={openingBalanceType}
                  onChange={(e) => {
                    const selected = e.target.value;
                    setOpeningBalanceType(
                      selected === "TO_PAY" ? "TO_PAY" : "TO_COLLECT"
                    );
                  }}
                  style={{
                    border: "none",
                    backgroundColor: "#d9d9d9",
                    height: "41.6px",
                    borderBottomLeftRadius: 0,
                    borderTopLeftRadius: 0,
                  }}
                  className="input-field w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TO_COLLECT">To Collect</option>
                  <option value="TO_PAY">To Pay</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              GSTIN
            </label>
            <input
              type="text"
              value={gstNumber}
              placeholder="ex: 29XXXXX9438X1XX"
              onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
              maxLength={15}
              className="input-field w-full border px-3 py-2 rounded uppercase placeholder:normal-case"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              PAN Number
            </label>
            <input
              type="text"
              value={panNumber}
              placeholder="Enter party PAN Number"
              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
              maxLength={10}
              className="input-field w-full border px-3 py-2 rounded uppercase placeholder:normal-case"
            />
          </div>
        </div>

        <hr className="border-gray-300" />

        <h2 className="text-lg font-semibold">General Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Party Type *</label>
            <select
              value={partyType}
              onChange={(e) => setPartyType(e.target.value)}
              className="input-field w-full border px-3 py-2 rounded"
            >
              <option value="CUSTOMER">Customer</option>
              <option value="SUPPLIER">Supplier</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Party Category</label>
            <select
              value={partyCategory}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "__create__") {
                  e.target.value = ""; // clear the selection visually
                  setShowCategoryModal(true);
                } else {
                  setPartyCategory(value);
                }
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

          {showCategoryModal && (
            <CreateCategoryModal
              onClose={(createdId?: string) => {
                setShowCategoryModal(false);
                if (createdId) setPartyCategory(createdId); // <- set the newly created ID
              }}
            />
          )}
        </div>

        <hr className="border-gray-300" />

        <h2 className="text-lg font-semibold">Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Billing Address</label>
            <textarea
              readOnly
              placeholder="Enter billing address"
              value={
                billingAddressData
                  ? `${billingAddressData.ad}, ${billingAddressData.city}, ${billingAddressData.st}, ${billingAddressData.pin}`
                  : ""
              }
              onClick={() => setShowModalFor("billing")}
              className="input-field w-full border px-3 py-2 bg-gray-100 cursor-pointer rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Shipping Address</label>
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
              className="input-field w-full border px-3 py-2 cursor-pointer rounded"
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
              <label htmlFor="sameAddress" className="ml-2">
                Same as Billing address
              </label>
            </div>
          </div>
        </div>

        <AddressModal
          isOpen={!!showModalFor}
          onClose={() => setShowModalFor(null)}
          onSave={handleAddressSave}
        />

        <hr className="border-gray-300" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Credit Period</label>
            <input
              type="number"
              placeholder="ex: 30 (in days)"
              value={creditPeriod}
              onChange={(e) => setCreditPeriod(e.target.value)}
              className="input-field w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Credit Limit</label>
            <input
              type="number"
              placeholder="0"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              className="input-field w-full border px-3 py-2 rounded"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateParty;
