import { LegalPageLayout, LegalSection } from "../../components/Legal/LegalPageLayout";

const About = () => {
  return (
    <LegalPageLayout
      title="About BillBook"
      subtitle="GST billing and invoicing software built for how Indian businesses actually work."
    >
      <LegalSection title="Our mission">
        <p>
          Small and mid-sized businesses in India spend a disproportionate amount of time on
          billing and GST compliance. BillBook exists to make that fast and correct by default —
          so tax calculation, invoice formatting, and e-invoicing happen automatically instead of
          being a manual, error-prone chore.
        </p>
      </LegalSection>

      <LegalSection title="What we build">
        <p>
          A single platform covering sales and purchase invoicing, point-of-sale billing,
          inventory, parties, cash and bank tracking, automated recurring bills, and GST
          e-invoicing — built to stay compliant as GST rules evolve.
        </p>
      </LegalSection>

      <LegalSection title="Get in touch">
        <p>
          Questions, feedback, or a feature you wish existed?{" "}
          <a href="/contact" className="text-indigo-600 hover:underline">
            We'd like to hear from you.
          </a>
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default About;
