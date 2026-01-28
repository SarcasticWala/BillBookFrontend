import { useParams, useNavigate } from "react-router-dom";
import { useGetPartyByIdQuery } from "../../features/party/partyApiSlice";
import { FaArrowLeft } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

export default function PartyDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isLoading, isError } = useGetPartyByIdQuery(id || "");

  if (isLoading) return <div>Loading...</div>;
  if (isError || !data?.data) return <div>Error loading party</div>;

  const party = data.data;

  console.log(party);

  if (isLoading) return <p>Loading...</p>;
  if (isError || !party) return <p>Party not found.</p>;

  const formatAddress = (addr: any) => {
    if (!addr?.miscData) return "-";
    const { ad, st, pin } = addr.miscData;
    return `${ad}, ${st}, ${pin}`;
  };

  const isSameAddress =
    party.billingAddress?.id === party.shippingAddress?.id ||
    party.billingAddress?.type === "BOTH";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-4 justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center hover:underline text-sm cursor-pointer"
          >
            <FaArrowLeft className="mr-2" />
          </button>
          <h2 className="text-xl font-semibold ml-4">{party.name}</h2>
        </div>
        <button
          onClick={() => navigate(`/parties/create-party/${party.id}`)}
          className="flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer"
        >
          <MdEdit /> Edit party
        </button>
      </div>

      {/* Tabs (visual only) */}
      <div className="flex space-x-4 mb-6 pb-2 text-sm font-medium text-gray-600">
        <div className="text-blue-600 border-b-2 border-blue-600 pb-1">
          Profile
        </div>
        {/* <div className="hover:text-blue-600 cursor-pointer">Transactions</div>
        <div className="hover:text-blue-600 cursor-pointer">
          Ledger (Statement)
        </div>
        <div className="hover:text-blue-600 cursor-pointer">
          Item Wise Report
        </div> */}
      </div>

      {/* Grid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm text-gray-800">
        {/* General Details */}
        <div className="bg-gray-50 border border-gray-200 rounded p-4">
          <h3 className="font-semibold text-gray-700 mb-3">General Details</h3>
          <DetailRow label="Party Name" value={party.name} />
          <DetailRow
            label="Party Type"
            value={party.partyType === "CUSTOMER" ? "Customer" : "Supplier"}
          />
          <DetailRow label="Mobile Number" value={party.mobileNumber} />

          <DetailRow
            label="Party Category"
            value={party.partyCatagory?.catagory}
          />
          <DetailRow label="Email" value={party.email} />
          <DetailRow
            label="Opening Balance"
            value={`₹${party.openingBalance || 0}`}
          />
        </div>

        {/* Business Details */}
        <div className="bg-gray-50 border border-gray-200 rounded p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Business Details</h3>
          <DetailRow label="GSTIN" value={party.gstin} />
          <DetailRow label="PAN Number" value={party.panNumber} />

          {isSameAddress ? (
            <DetailRow
              label="Billing & Shipping Address"
              value={formatAddress(party.billingAddress)}
            />
          ) : (
            <>
              <DetailRow
                label="Billing Address"
                value={formatAddress(party.billingAddress)}
              />
              <DetailRow
                label="Shipping Address"
                value={formatAddress(party.shippingAddress)}
              />
            </>
          )}

          {/* <div className="text-blue-600 mt-2 cursor-pointer text-sm hover:underline">
            Manage Shipping Addresses
          </div> */}
        </div>

        {/* Credit Details */}
        <div className="bg-gray-50 border border-gray-200 rounded p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Credit Details</h3>
          <DetailRow
            label="Credit Period"
            value={`${party.creditPeriod || 0} Days`}
          />
          <DetailRow
            label="Credit Limit"
            value={`₹${party.creditLimit || "-"}`}
          />
        </div>
      </div>

      {/* Party Bank Details Box */}
      {/* <div className="bg-yellow-50 border border-yellow-300 rounded p-4 mt-6 flex items-center justify-between">
        <div>
          <div className="text-gray-700 font-medium">Party Bank Details</div>
          <p className="text-sm text-gray-600">
            Add bank information to manage transactions with this party.
          </p>
        </div>
        <button className="text-white bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-sm font-medium">
          +
        </button>
      </div> */}
    </div>
  );
}

// Reusable label/value row
function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between border-b py-2">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-right max-w-xs truncate">
        {value || "-"}
      </span>
    </div>
  );
}
