import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useGetItemByIdQuery } from "../../features/item/itemApiSlice";
import { Badge } from "../UI/Badge";
import { PageHeader } from "../UI/PageHeader";
import { FormSection } from "../UI/FormSection";

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
    <div className="secondary-font">
      <PageHeader
        title={item.itemName || item.serviceName}
        subtitle="Item details"
        onBack={() => navigate(-1)}
        actions={<Badge variant="info">{itemType || "PRODUCT"}</Badge>}
      />

      <div className="space-y-5 max-w-5xl">
        {/* Images */}
        {item.itemImage?.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {item.itemImage.map((url: string, index: number) => (
              <img
                key={index}
                src={url}
                alt={`Item Image ${index + 1}`}
                className="w-28 h-28 object-cover rounded-lg border border-gray-200 shadow-sm"
              />
            ))}
          </div>
        )}

        {/* General Info */}
        <FormSection title="General Info">
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
        </FormSection>

        {/* Pricing */}
        <FormSection title="Pricing">
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
        </FormSection>

        {/* Stock */}
        <FormSection title="Stock & Units">
          <Detail label="Measuring Unit" value={item.unit?.name} />
          <Detail label="Unit Short Name" value={item.unit?.shortName} />
          <Detail label="Net Quantity" value={item.netQuantity} />
          <Detail label="Opening Stock" value={item.openingStock} />
          <Detail
            label="Alert Enabled"
            value={item.isAlertEnabled ? "Yes" : "No"}
          />
          <Detail label="Alert Quantity" value={item.productAlertValue} />
        </FormSection>

        {/* Misc */}
        <FormSection title="Other">
          <Detail
            label="Online Visibility"
            value={item.isOnlineVisible ? "Yes" : "No"}
          />
          <Detail
            label="As of Date"
            value={new Date(item.asOfDate).toLocaleDateString()}
          />
        </FormSection>

        {/* Description */}
        <FormSection title="Description" layout="plain">
          <p className="text-sm text-gray-600">
            {item.description || "No description provided."}
          </p>
        </FormSection>
      </div>
    </div>
  );
};

/* Reusable detail field */
const Detail = ({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined | null;
}) => (
  <div>
    <span className="block input-label mb-0.5">{label}</span>
    <span className="text-sm font-semibold text-gray-800">
      {value !== undefined && value !== null && value !== "" ? value : "-"}
    </span>
  </div>
);

/* Utility formatters */
const formatCurrency = (value: number | undefined | null) =>
  value != null ? `₹${value.toLocaleString()}` : "-";

const percent = (value: number | undefined | null) =>
  value != null ? `${value}%` : "-";
