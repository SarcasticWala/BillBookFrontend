import { LegalPageLayout, LegalSection } from "../../components/Legal/LegalPageLayout";

const TermsAndConditions = () => {
  return (
    <LegalPageLayout title="Terms & Conditions" lastUpdated="20 September 2026">
      <p className="text-sm">
        These Terms & Conditions ("Terms") govern your use of BillBook (the "Service"). By
        creating an account or using the Service, you agree to these Terms. This is a general
        terms template — please have it reviewed by a legal professional before relying on it
        for your specific business and regulatory needs.
      </p>

      <LegalSection title="1. The Service">
        <p>
          BillBook is a GST billing, invoicing, and inventory management platform for
          businesses. Features may include sales/purchase invoicing, point-of-sale billing,
          recurring/automated bills, and GST e-invoicing where enabled.
        </p>
      </LegalSection>

      <LegalSection title="2. Your Account">
        <p>
          You must provide accurate information when registering, keep your login credentials
          confidential, and are responsible for all activity under your account. Notify us
          promptly of any unauthorized use.
        </p>
      </LegalSection>

      <LegalSection title="3. Your Responsibilities">
        <p>
          You are solely responsible for the accuracy of the business, tax, and invoicing data
          you enter — including GSTINs, tax rates, and invoice details — and for your own
          compliance with applicable GST and other tax laws. BillBook is a tool to help manage
          your billing; it does not provide tax or legal advice, and using it does not itself
          guarantee compliance with any regulation.
        </p>
      </LegalSection>

      <LegalSection title="4. Acceptable Use">
        <p>You agree not to use the Service to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Violate any applicable law or regulation;</li>
          <li>Upload unlawful, infringing, or harmful content;</li>
          <li>Attempt to gain unauthorized access to the Service or other accounts; or</li>
          <li>Interfere with or disrupt the integrity or performance of the Service.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Your Data">
        <p>
          You retain ownership of the business data you enter into the Service (your invoices,
          parties, items, and related records). You grant us the limited right to store and
          process that data solely to provide the Service to you, including submitting it to
          the GST e-invoicing system where you choose to enable that feature.
        </p>
      </LegalSection>

      <LegalSection title="6. Third-Party Services">
        <p>
          Certain features rely on third parties outside our control — for example, the
          government's GST Invoice Registration Portal (IRP) for e-invoicing, and email
          providers for account-verification codes. We are not responsible for outages, errors,
          or changes in these third-party systems, though we aim to handle them gracefully
          (e.g. retrying a failed e-invoice submission).
        </p>
      </LegalSection>

      <LegalSection title="7. Intellectual Property">
        <p>
          The Service, including its software, design, and branding, is owned by BillBook or
          its licensors. These Terms do not grant you any rights to our intellectual property
          beyond what is necessary to use the Service as intended.
        </p>
      </LegalSection>

      <LegalSection title="8. Disclaimer of Warranties">
        <p>
          The Service is provided "as is" and "as available," without warranties of any kind,
          express or implied, including fitness for a particular purpose or non-infringement.
          We do not warrant that the Service will be uninterrupted, error-free, or that every
          GST/tax calculation will be free of error — always review invoices before sending
          them.
        </p>
      </LegalSection>

      <LegalSection title="9. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, BillBook will not be liable for any indirect,
          incidental, special, or consequential damages, or for any loss of profits, revenue,
          or data, arising from your use of the Service.
        </p>
      </LegalSection>

      <LegalSection title="10. Termination">
        <p>
          You may stop using the Service at any time. We may suspend or terminate access to the
          Service for conduct that violates these Terms or that we reasonably believe is harmful
          to other users or the Service.
        </p>
      </LegalSection>

      <LegalSection title="11. Governing Law">
        <p>
          These Terms are governed by the laws of India, without regard to conflict-of-law
          principles.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes to These Terms">
        <p>
          We may update these Terms from time to time. Continued use of the Service after an
          update constitutes acceptance of the revised Terms. Material changes will be reflected
          by updating the "Last updated" date above.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact Us">
        <p>
          Questions about these Terms can be sent to the support contact listed in your BillBook
          account or business communications.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default TermsAndConditions;
