import { useState, lazy, Suspense } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MdEdit } from "react-icons/md";
import { useGetItemByIdQuery } from "../../features/item/itemApiSlice";
import { Badge } from "../UI/Badge";
import { Button } from "../UI/Button";
import { PageHeader } from "../UI/PageHeader";
import { FormSection } from "../UI/FormSection";

// Heavy modal (moment, headlessui, form) — loaded only when the user edits.
const CreateItemModal = lazy(() =>
  import("../UI/CreateItemModal").then((m) => ({ default: m.CreateItemModal }))
);

export const ItemDetailsPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const itemType = searchParams.get("itemType") as "PRODUCT" | "SERVICE" | null;
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);

  const { data, isLoading, isError } = useGetItemByIdQuery({
    id: id || "",
    itemType: itemType || "PRODUCT",
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 secondary-font">
        Loading item details…
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500 secondary-font">
        Failed to fetch item.
      </div>
    );
  }

  const item = data.data;
  const isProduct = (itemType || "PRODUCT") === "PRODUCT";

  const name = item.itemName || item.serviceName || "-";
  const code = item.itemCode || item.serviceCode;
  const categoryName =
    item.itemCatagory?.catagory ||
    item.itemCatagory?.name ||
    (typeof item.itemCatagory === "string" ? item.itemCatagory : undefined);
  const images: string[] = item.itemImage || [];

  // Stock status (products only)
  const qty = Number(item.netQuantity ?? 0);
  const alertQty = Number(item.productAlertValue ?? 0);
  const lowStock = isProduct && item.isAlertEnabled && qty <= alertQty;

  return (
    <div className="secondary-font">
      <PageHeader
        title={name}
        subtitle="Item details"
        onBack={() => navigate(-1)}
        actions={
          <>
            <Badge variant="info">{itemType || "PRODUCT"}</Badge>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setEditOpen(true)}
            >
              <MdEdit /> Edit
            </Button>
          </>
        }
      />

      {editOpen && (
        <Suspense fallback={null}>
          <CreateItemModal
            isOpen={editOpen}
            onClose={() => setEditOpen(false)}
            itemToEdit={item}
          />
        </Suspense>
      )}

      {/* Tabs (visual only) — matches Party profile */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200 text-sm text-gray-600">
        <div className="text-primary border-b-2 border-primary pb-2 -mb-px">
          Profile
        </div>
      </div>

      <div className="space-y-5 max-w-5xl">
        {/* Summary / hero card */}
        <section className="bg-white rounded-xl border border-slate-200/80 shadow-[var(--shadow-card)] p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Image / placeholder */}
            <div className="shrink-0">
              {images.length > 0 ? (
                <img
                  src={images[0]}
                  alt={name}
                  className="w-24 h-24 rounded-2xl object-cover border border-slate-200/80"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-slate-200/80 flex items-center justify-center text-3xl primary-font text-primary">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Title block */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl primary-font text-gray-900 truncate">{name}</h2>
                {lowStock && <Badge variant="danger" dot>Low stock</Badge>}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
                {code && <span>Code: <span className="text-gray-800">{code}</span></span>}
                {code && categoryName && <span className="text-gray-300">•</span>}
                {categoryName && (
                  <span>Category: <span className="text-gray-800">{categoryName}</span></span>
                )}
              </div>
            </div>
          </div>

          {/* Key metric chips */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Metric label="Sale Price" value={formatCurrency(item.salePrice)} accent />
            <Metric label="Purchase Price" value={formatCurrency(item.purchasePrice)} />
            <Metric label="GST Rate" value={percent(item.gstRate?.value)} />
            {isProduct ? (
              <Metric
                label="In Stock"
                value={`${qty} ${item.unit?.shortName || ""}`.trim()}
                danger={lowStock}
              />
            ) : (
              <Metric label="Type" value="Service" />
            )}
          </div>
        </section>

        {/* Detail grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* General Info */}
          <FormSection title="General Info" layout="plain">
            <div className="divide-y divide-gray-100">
              <DetailRow label="Item Code" value={code} />
              <DetailRow label="Category" value={categoryName} />
              <DetailRow
                label={isProduct ? "HSN Code" : "SAC Code"}
                value={item.hsnCode || item.sacCode}
              />
              {isProduct && (
                <DetailRow label="Product Type" value={item.itemProductType} />
              )}
              {isProduct && (
                <DetailRow
                  label="Serialisation"
                  value={item.hasSerialisation ? "Enabled" : "Disabled"}
                  badge={item.hasSerialisation ? "success" : "neutral"}
                />
              )}
              {isProduct && item.itemSerialNo?.length > 0 && (
                <DetailRow
                  label="Serial Numbers"
                  value={item.itemSerialNo.map((s: any) => s.serialNo).join(", ")}
                />
              )}
            </div>
          </FormSection>

          {/* Pricing & Tax */}
          <FormSection title="Pricing & Tax" layout="plain">
            <div className="divide-y divide-gray-100">
              <DetailRow label="Sale Price" value={formatCurrency(item.salePrice)} />
              <DetailRow label="Purchase Price" value={formatCurrency(item.purchasePrice)} />
              <DetailRow label="GST Rate" value={percent(item.gstRate?.value)} />
              <DetailRow label="CESS" value={percent(item.gstRate?.cessValue)} />
              <DetailRow
                label="Sale Tax"
                value={item.isSaleTaxApplicable ? "Applicable" : "Not applicable"}
                badge={item.isSaleTaxApplicable ? "success" : "neutral"}
              />
              <DetailRow
                label="Purchase Tax"
                value={item.isPurchaseTaxApplicable ? "Applicable" : "Not applicable"}
                badge={item.isPurchaseTaxApplicable ? "success" : "neutral"}
              />
            </div>
          </FormSection>

          {/* Stock & Units — products only */}
          {isProduct && (
            <FormSection title="Stock & Units" layout="plain">
              <div className="divide-y divide-gray-100">
                <DetailRow
                  label="Measuring Unit"
                  value={
                    item.unit?.name
                      ? `${item.unit.name}${item.unit.shortName ? ` (${item.unit.shortName})` : ""}`
                      : undefined
                  }
                />
                <DetailRow label="Net Quantity" value={fmt(item.netQuantity)} />
                <DetailRow label="Opening Stock" value={fmt(item.openingStock)} />
                <DetailRow
                  label="Low-stock Alert"
                  value={item.isAlertEnabled ? "Enabled" : "Disabled"}
                  badge={item.isAlertEnabled ? "success" : "neutral"}
                />
                {item.isAlertEnabled && (
                  <DetailRow label="Alert Quantity" value={fmt(item.productAlertValue)} />
                )}
              </div>
            </FormSection>
          )}

          {/* Other */}
          <FormSection title="Other" layout="plain">
            <div className="divide-y divide-gray-100">
              <DetailRow
                label="Online Visibility"
                value={item.isOnlineVisible ? "Visible" : "Hidden"}
                badge={item.isOnlineVisible ? "success" : "neutral"}
              />
              <DetailRow label="As of Date" value={formatDate(item.asOfDate)} />
            </div>
          </FormSection>
        </div>

        {/* Additional images */}
        {images.length > 1 && (
          <FormSection title="Images" layout="plain">
            <div className="flex gap-3 flex-wrap">
              {images.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`${name} ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                />
              ))}
            </div>
          </FormSection>
        )}

        {/* Description */}
        <FormSection title="Description" layout="plain">
          <p className="text-sm text-gray-600 leading-relaxed">
            {item.description || "No description provided."}
          </p>
        </FormSection>
      </div>
    </div>
  );
};

/* Compact metric chip for the summary card */
const Metric = ({
  label,
  value,
  accent,
  danger,
}: {
  label: string;
  value: string;
  accent?: boolean;
  danger?: boolean;
}) => (
  <div
    className={`rounded-xl border px-3.5 py-3 ${
      danger
        ? "border-red-200 bg-red-50"
        : accent
        ? "border-primary/15 bg-primary/5"
        : "border-slate-200/80 bg-slate-50"
    }`}
  >
    <span className="block text-xs secondary-font text-gray-500 uppercase tracking-wide">
      {label}
    </span>
    <span
      className={`block text-base primary-font mt-1 ${
        danger ? "text-red-600" : accent ? "text-primary" : "text-gray-900"
      }`}
    >
      {value}
    </span>
  </div>
);

/* Label/value row — mirrors Party profile DetailRow */
const DetailRow = ({
  label,
  value,
  badge,
}: {
  label: string;
  value?: string | number | null;
  badge?: "info" | "success" | "warning" | "danger" | "neutral";
}) => {
  const display =
    value !== undefined && value !== null && value !== "" ? String(value) : "-";
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
      <span className="text-gray-500 light-font shrink-0">{label}</span>
      {badge && display !== "-" ? (
        <Badge variant={badge}>{display}</Badge>
      ) : (
        <span className="secondary-font text-gray-900 text-right max-w-xs truncate">
          {display}
        </span>
      )}
    </div>
  );
};

/* Formatters */
const fmt = (value: number | undefined | null) =>
  value !== undefined && value !== null ? String(value) : "-";

const formatCurrency = (value: number | undefined | null) =>
  value != null ? `₹${Number(value).toLocaleString("en-IN")}` : "-";

const percent = (value: number | undefined | null) =>
  value != null ? `${value}%` : "-";

const formatDate = (value: string | undefined | null) => {
  if (!value) return "-";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("en-IN");
};
