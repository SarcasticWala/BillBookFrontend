import { LegalPageLayout, LegalSection } from "../../components/Legal/LegalPageLayout";

const InventoryInfo = () => {
  return (
    <LegalPageLayout
      title="Inventory"
      subtitle="Keep stock, pricing, and GST rates in one catalog that updates itself as you bill."
    >
      <LegalSection title="A single item catalog">
        <p>
          Every item you sell or purchase lives in one catalog — name, category, unit, HSN/SAC
          code, and GST rate — so it only needs to be set up once and then reused across sales,
          purchases, and POS billing.
        </p>
      </LegalSection>

      <LegalSection title="Stock that stays in sync">
        <p>
          Stock levels move automatically as sales and purchase invoices are created or edited —
          no separate stock adjustment step for routine transactions.
        </p>
      </LegalSection>

      <LegalSection title="Categories & units">
        <p>
          Organize items into categories and assign standard units (pcs, kg, box, etc.) so
          reports and item lists stay consistent as your catalog grows.
        </p>
      </LegalSection>

      <LegalSection title="Item images">
        <p>
          Attach a photo to any item for quick visual identification, especially useful at the
          POS billing counter.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default InventoryInfo;
