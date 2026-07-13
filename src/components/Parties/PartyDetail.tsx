import { useParams, useNavigate } from "react-router-dom";
import { useGetPartyByIdQuery } from "../../features/party/partyApiSlice";
import { MdEdit } from "react-icons/md";
import { Button } from "../UI/Button";
import { PageHeader } from "../UI/PageHeader";
import { FormSection } from "../UI/FormSection";
import { Badge } from "../UI/Badge";

export default function PartyDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isLoading, isError } = useGetPartyByIdQuery(id || "");

  if (isLoading)
    return <div className="p-4 sm:p-6 text-gray-500 secondary-font">Loading party…</div>;
  if (isError || !data?.data)
    return (
      <div className="p-4 sm:p-6 text-center text-red-500 secondary-font">
        Error loading party
      </div>
    );

  const party = data.data;

  // Tolerant readers — API may return the write shape (partyName/gstNumber/
  // billingAddressData) or a mapped read shape (name/gstin/billingAddress).
  const name = party.partyName || party.name || "-";
  const mobile = party.mobileNo || party.mobileNumber;
  const gstin = party.gstNumber || party.gstin;
  const categoryName =
    party.partyCatagory?.catagory ||
    party.partyCatagory?.name ||
    (typeof party.partyCatagory === "string" ? party.partyCatagory : undefined);

  const formatAddress = (addr: any) => {
    const a = addr?.miscData || addr;
    if (!a || (!a.ad && !a.st && !a.pin)) return "-";
    return [a.ad, a.st, a.city, a.pin].filter(Boolean).join(", ");
  };

  const billing = party.billingAddress || party.billingAddressData;
  const shipping = party.shippingAddress || party.shippingAddressData;
  const isSameAddress =
    party.isSameAddress ??
    (party.billingAddress?.id === party.shippingAddress?.id ||
      party.billingAddress?.type === "BOTH");

  return (
    <div className="secondary-font">
      <PageHeader
        title={name}
        subtitle="Party profile"
        onBack={() => navigate(-1)}
        actions={
          <Button onClick={() => navigate(`/parties/create-party/${party.id}`)}>
            <MdEdit /> Edit party
          </Button>
        }
      />

      {/* Tabs (visual only) */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200 text-sm secondary-font text-gray-600">
        <div className="text-primary border-b-2 border-primary pb-2 -mb-px">
          Profile
        </div>
      </div>

      {/* Grid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-5xl">
        {/* General Details */}
        <FormSection title="General Details" layout="plain">
          <div className="divide-y divide-gray-100">
            <DetailRow label="Party Name" value={name} />
            <DetailRow
              label="Party Type"
              value={party.partyType === "CUSTOMER" ? "Customer" : "Supplier"}
              badge={party.partyType === "CUSTOMER" ? "info" : "neutral"}
            />
            <DetailRow label="Mobile Number" value={mobile} />
            <DetailRow label="Party Category" value={categoryName} />
            <DetailRow label="Email" value={party.email} />
            <DetailRow
              label="Opening Balance"
              value={`₹${party.openingBalance || 0}`}
            />
          </div>
        </FormSection>

        {/* Business Details */}
        <FormSection title="Business Details" layout="plain">
          <div className="divide-y divide-gray-100">
            <DetailRow label="GSTIN" value={gstin} />
            <DetailRow label="PAN Number" value={party.panNumber} />

            {isSameAddress ? (
              <DetailRow
                label="Billing & Shipping Address"
                value={formatAddress(billing)}
              />
            ) : (
              <>
                <DetailRow
                  label="Billing Address"
                  value={formatAddress(billing)}
                />
                <DetailRow
                  label="Shipping Address"
                  value={formatAddress(shipping)}
                />
              </>
            )}
          </div>
        </FormSection>

        {/* Credit Details */}
        <FormSection title="Credit Details" layout="plain">
          <div className="divide-y divide-gray-100">
            <DetailRow
              label="Credit Period"
              value={`${party.creditPeriod || 0} Days`}
            />
            <DetailRow
              label="Credit Limit"
              value={`₹${party.creditLimit || "-"}`}
            />
          </div>
        </FormSection>
      </div>
    </div>
  );
}

// Reusable label/value row
function DetailRow({
  label,
  value,
  badge,
}: {
  label: string;
  value?: string;
  badge?: "info" | "success" | "warning" | "danger" | "neutral";
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
      <span className="text-gray-500 light-font shrink-0">{label}</span>
      {badge ? (
        <Badge variant={badge}>{value || "-"}</Badge>
      ) : (
        <span className="secondary-font text-gray-900 text-right max-w-xs truncate">
          {value || "-"}
        </span>
      )}
    </div>
  );
}
