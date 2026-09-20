import { LegalPageLayout, LegalSection } from "../../components/Legal/LegalPageLayout";

const Blog = () => {
  return (
    <LegalPageLayout
      title="Blog"
      subtitle="Guides on GST billing, e-invoicing, and running a business — coming soon."
    >
      <LegalSection title="Nothing published yet">
        <p>
          We're working on practical guides about GST compliance, e-invoicing, and billing
          best practices. Check back soon, or{" "}
          <a href="/contact" className="text-indigo-600 hover:underline">
            get in touch
          </a>{" "}
          if there's a topic you'd like us to cover.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default Blog;
