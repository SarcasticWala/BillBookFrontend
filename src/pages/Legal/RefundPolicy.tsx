import { LegalPageLayout, LegalSection } from "../../components/Legal/LegalPageLayout";

const RefundPolicy = () => {
  return (
    <LegalPageLayout title="Refund Policy" lastUpdated="20 September 2026">
      <p className="text-sm">
        This Refund Policy explains how billing, cancellations, and refunds work for BillBook's
        paid plans. This is a general policy template — please have it reviewed by a legal
        professional before relying on it for your specific obligations.
      </p>

      <LegalSection title="1. Free trial">
        <p>
          New accounts can try BillBook before paying. You won't be charged until you actively
          choose to upgrade to a paid plan.
        </p>
      </LegalSection>

      <LegalSection title="2. Subscription billing">
        <p>
          Paid plans are billed either monthly or yearly, based on the option you select at
          checkout. Subscriptions renew automatically at the end of each billing period unless
          cancelled beforehand.
        </p>
      </LegalSection>

      <LegalSection title="3. Cancellations">
        <p>
          You can cancel your subscription at any time. Cancelling stops future renewals, but
          the current paid period remains active and accessible until it ends — no partial-month
          refund is issued for time already paid for.
        </p>
      </LegalSection>

      <LegalSection title="4. Refund eligibility">
        <p>
          If you're charged in error, or a technical issue on our side prevented you from using
          the Service during a paid period, contact us within 7 days of the charge and we'll
          review it for a full or partial refund.
        </p>
        <p>
          Outside of billing errors or service issues on our end, payments are generally
          non-refundable once a billing period has started.
        </p>
      </LegalSection>

      <LegalSection title="5. How to request a refund">
        <p>
          Reach out from our{" "}
          <a href="/contact" className="text-indigo-600 hover:underline">
            Contact page
          </a>{" "}
          with your account email and the charge in question. We aim to respond within a few
          business days.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default RefundPolicy;
