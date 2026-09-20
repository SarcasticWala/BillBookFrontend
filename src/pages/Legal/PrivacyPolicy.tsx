import { LegalPageLayout, LegalSection } from "../../components/Legal/LegalPageLayout";

const PrivacyPolicy = () => {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="20 September 2026">
      <p className="text-sm">
        This Privacy Policy explains how BillBook ("BillBook", "we", "us") collects, uses,
        stores, and protects information when you use our GST billing and invoicing platform
        (the "Service"). This is a general policy template — please have it reviewed by a
        legal professional before relying on it for your specific regulatory obligations.
      </p>

      <LegalSection title="1. Information We Collect">
        <p>
          <strong>Account information:</strong> your name, email address, phone number,
          password (stored as a one-way hash, never in plain text), business name, GSTIN,
          business address, and an optional logo.
        </p>
        <p>
          <strong>Business data you create:</strong> parties (your customers and suppliers),
          items and inventory, sales and purchase invoices, payments, cash/bank accounts, and
          expenses. This may include personal information about your own customers that you
          choose to store in the Service (e.g. a customer's name, phone number, or GSTIN).
        </p>
        <p>
          <strong>Uploaded content:</strong> item images and your business logo, stored via our
          image hosting provider.
        </p>
        <p>
          <strong>Usage data:</strong> log data such as request timestamps and error reports,
          used to keep the Service reliable and secure.
        </p>
      </LegalSection>

      <LegalSection title="2. How We Use Your Information">
        <p>
          We use your information to operate the Service: authenticate you, generate and store
          your invoices and business records, send account-verification codes, calculate GST
          and totals, and (where you enable it) submit eligible B2B invoices to the government's
          e-invoicing system to obtain an Invoice Reference Number (IRN). We do not sell your
          personal information.
        </p>
      </LegalSection>

      <LegalSection title="3. Data Storage & Security">
        <p>
          Data is stored in a MongoDB database and, for e-invoicing, exchanged with the GST
          Invoice Registration Portal (IRP). Passwords are hashed with bcrypt; sessions use
          signed JSON Web Tokens; connections to the Service are encrypted in transit. No
          method of storage or transmission is 100% secure, but we take reasonable technical
          and organizational measures to protect your data.
        </p>
      </LegalSection>

      <LegalSection title="4. Sharing With Third Parties">
        <p>We share data only with the service providers needed to run the Service:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>An image hosting provider, for item images and your business logo.</li>
          <li>Email delivery providers, to send account-verification (OTP) codes.</li>
          <li>
            The GST Invoice Registration Portal (IRP), only for invoices you choose to submit
            for e-invoicing, and only when that feature is enabled for your account.
          </li>
        </ul>
        <p>We do not share your data with advertisers or data brokers.</p>
      </LegalSection>

      <LegalSection title="5. Your Rights">
        <p>
          You can access, correct, or update most of your account and business data directly
          within the Service. To request deletion of your account and associated data, contact
          us using the details below; we will act on verified requests within a reasonable time,
          subject to any legal obligation to retain certain records (e.g. tax/invoicing data).
        </p>
      </LegalSection>

      <LegalSection title="6. Data Retention">
        <p>
          We retain account and business data for as long as your account is active, and for a
          reasonable period afterward to comply with applicable tax, accounting, and legal
          record-keeping requirements.
        </p>
      </LegalSection>

      <LegalSection title="7. Cookies & Local Storage">
        <p>
          The Service uses browser storage to keep you signed in on the current tab; it does
          not use third-party advertising or tracking cookies.
        </p>
      </LegalSection>

      <LegalSection title="8. Children's Privacy">
        <p>
          The Service is intended for business use by adults and is not directed at children.
          We do not knowingly collect personal information from children.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. Material changes will be
          reflected by updating the "Last updated" date above.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact Us">
        <p>
          Questions about this Privacy Policy can be sent to the support contact listed in your
          BillBook account or business communications.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;
