import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useGetItemByIdQuery } from "../../features/item/itemApiSlice";
import {
  FaArrowLeft,
  FaInfoCircle,
  FaTags,
  FaBoxes,
  FaEllipsisH,
  FaAlignLeft,
} from "react-icons/fa";

export const ItemDetailsPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const itemType = searchParams.get("itemType") as "PRODUCT" | "SERVICE" | null;

  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetItemByIdQuery({
    id: id || "",
    itemType: itemType || "PRODUCT",
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading item details...
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        Failed to fetch item.
      </div>
    );
  }

  const item = data.data;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <FaArrowLeft className="mr-2" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      {/* Title */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          {item.itemName || item.serviceName}
        </h1>
        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
          {itemType || "PRODUCT"}
        </span>
      </div>

      {/* Images */}
      {item.itemImage?.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {item.itemImage.map((url: string, index: number) => (
            <img
              key={index}
              src={url}
              alt={`Item Image ${index + 1}`}
              className="w-28 h-28 object-cover rounded-lg shadow"
            />
          ))}
        </div>
      )}

      {/* Detail Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Info */}
        <DetailSection
          title="General Info"
          icon={<FaInfoCircle className="text-blue-500" />}
        >
          <Detail label="Item Code" value={item.itemCode || item.serviceCode} />
          <Detail label="Category" value={item.itemCatagory?.catagory} />
          <Detail label="HSN/SAC Code" value={item.hsnCode || item.sacCode} />
          <Detail label="Item Product Type" value={item.itemProductType} />
          <Detail
            label="Has Serialisation"
            value={item.hasSerialisation ? "Yes" : "No"}
          />
          <Detail
            label="Serial Numbers"
            value={
              item.itemSerialNo?.length
                ? item.itemSerialNo.map((s: any) => s.serialNo).join(", ")
                : "-"
            }
          />
        </DetailSection>

        {/* Pricing */}
        <DetailSection
          title="Pricing"
          icon={<FaTags className="text-green-500" />}
        >
          <Detail label="Sale Price" value={formatCurrency(item.salePrice)} />
          <Detail
            label="Purchase Price"
            value={formatCurrency(item.purchasePrice)}
          />
          <Detail label="GST Rate" value={percent(item.gstRate?.value)} />
          <Detail label="CESS" value={percent(item.gstRate?.cessValue)} />
          <Detail
            label="Sale Tax Applicable"
            value={item.isSaleTaxApplicable ? "Yes" : "No"}
          />
          <Detail
            label="Purchase Tax Applicable"
            value={item.isPurchaseTaxApplicable ? "Yes" : "No"}
          />
        </DetailSection>

        {/* Stock */}
        <DetailSection
          title="Stock & Units"
          icon={<FaBoxes className="text-yellow-500" />}
        >
          <Detail label="Measuring Unit" value={item.unit?.name} />
          <Detail label="Unit Short Name" value={item.unit?.shortName} />
          <Detail label="Net Quantity" value={item.netQuantity} />
          <Detail label="Opening Stock" value={item.openingStock} />
          <Detail
            label="Alert Enabled"
            value={item.isAlertEnabled ? "Yes" : "No"}
          />
          <Detail label="Alert Quantity" value={item.productAlertValue} />
        </DetailSection>

        {/* Misc */}
        <DetailSection
          title="Other"
          icon={<FaEllipsisH className="text-purple-500" />}
        >
          <Detail
            label="Online Visibility"
            value={item.isOnlineVisible ? "Yes" : "No"}
          />
          <Detail
            label="As of Date"
            value={new Date(item.asOfDate).toLocaleDateString()}
          />
        </DetailSection>
      </div>

      {/* Description */}
      <DetailSection
        title="Description"
        icon={<FaAlignLeft className="text-gray-500" />}
      >
        <p className="text-gray-600 text-sm">
          {item.description || "No description provided."}
        </p>
      </DetailSection>
    </div>
  );
};

/* Reusable detail section container */
const DetailSection = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-xl shadow-md p-5 space-y-3">
    <div className="flex items-center gap-2">
      {icon}
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
      {children}
    </div>
  </div>
);

/* Reusable detail field */
const Detail = ({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined | null;
}) => (
  <div>
    <span className="block text-gray-500 text-xs font-medium mb-0.5">
      {label}
    </span>
    <span className="font-semibold text-gray-800">
      {value !== undefined && value !== null && value !== "" ? value : "-"}
    </span>
  </div>
);

/* Utility formatters */
const formatCurrency = (value: number | undefined | null) =>
  value != null ? `₹${value.toLocaleString()}` : "-";

const percent = (value: number | undefined | null) =>
  value != null ? `${value}%` : "-";