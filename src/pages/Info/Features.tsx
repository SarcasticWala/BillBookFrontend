import { LegalPageLayout, LegalSection } from "../../components/Legal/LegalPageLayout";

const Features = () => {
  return (
    <LegalPageLayout
      title="Features"
      subtitle="Everything you need to bill, track, and stay GST-compliant — in one place."
    >
      <LegalSection title="GST-compliant invoicing">
        <p>
          Create sales and purchase invoices with GST calculated automatically — CGST/SGST for
          intra-state, IGST for inter-state — based on the place of supply. Totals, tax splits,
          and rounding are always computed server-side, so what you see is what gets recorded.
        </p>
      </LegalSection>

      <LegalSection title="Point of Sale (POS) billing">
        <p>
          A fast, counter-friendly billing screen for walk-in and cash sales — built on the same
          invoicing engine as full sales invoices, so every POS sale is a real, GST-correct
          invoice with no separate reconciliation step.
        </p>
      </LegalSection>

      <LegalSection title="Automated recurring bills">
        <p>
          Set up a billing template once — for rent, AMC, retainers, or subscriptions — and let
          BillBook generate the invoice automatically on schedule (weekly, monthly, or custom).
          Every run is exactly-once: a template never double-bills the same period.
        </p>
      </LegalSection>

      <LegalSection title="GST e-Invoicing">
        <p>
          Submit eligible B2B invoices straight to the government's e-invoicing system and get
          back a signed IRN and QR code, attached to the invoice automatically. See our{" "}
          <a href="/gst-e-invoicing" className="text-indigo-600 hover:underline">
            e-Invoicing page
          </a>{" "}
          for details.
        </p>
      </LegalSection>

      <LegalSection title="Inventory & items">
        <p>
          Track items with categories, units, HSN/SAC codes, and per-item GST rates. Stock moves
          automatically as sales and purchases are recorded, so your inventory stays in sync
          without manual adjustment.
        </p>
      </LegalSection>

      <LegalSection title="Parties, cash & bank, expenses">
        <p>
          Manage customers and suppliers with running balances, record payments against
          invoices, track cash and bank accounts, and log business expenses — all feeding the
          same set of reports.
        </p>
      </LegalSection>

      <LegalSection title="Instant PDF invoices & receipts">
        <p>
          Every invoice, receipt, and e-invoice can be previewed and downloaded as a PDF from the
          same view — what you preview is exactly what downloads.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default Features;
