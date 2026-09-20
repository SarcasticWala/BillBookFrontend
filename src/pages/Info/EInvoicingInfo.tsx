import { LegalPageLayout, LegalSection } from "../../components/Legal/LegalPageLayout";

const EInvoicingInfo = () => {
  return (
    <LegalPageLayout
      title="GST e-Invoicing"
      subtitle="Generate a government-recognized IRN and QR code for eligible invoices, without leaving BillBook."
    >
      <LegalSection title="What is e-Invoicing?">
        <p>
          Under GST, certain businesses must report specified invoices to the government's
          Invoice Registration Portal (IRP) before they're considered valid for input tax credit.
          The IRP returns an Invoice Reference Number (IRN) and a signed QR code, which must
          appear on the invoice.
        </p>
      </LegalSection>

      <LegalSection title="Who needs it">
        <p>
          E-Invoicing applies to B2B invoices for businesses above the government-notified
          turnover threshold, and to all export and SEZ invoices regardless of turnover.
          BillBook checks eligibility per invoice — domestic invoices need a valid GSTIN on the
          party, export/SEZ invoices are always eligible.
        </p>
      </LegalSection>

      <LegalSection title="How it works in BillBook">
        <p>
          Once enabled for your account, eligible invoices show a "Generate e-Invoice" action.
          Submitting it sends the invoice details to the IRP and stores the returned IRN,
          acknowledgement number, and signed QR code directly on the invoice — ready to preview
          and download as a PDF, QR code included.
        </p>
        <p>
          Invoices can be cancelled within the 24-hour window the law allows, directly from the
          same screen.
        </p>
      </LegalSection>

      <LegalSection title="Availability">
        <p>
          e-Invoicing is rolling out account-by-account. If you don't see it yet and believe you
          need it, reach out from our{" "}
          <a href="/contact" className="text-indigo-600 hover:underline">
            Contact page
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default EInvoicingInfo;
