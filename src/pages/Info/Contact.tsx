import { useNavigate } from "react-router-dom";
import { LegalPageLayout } from "../../components/Legal/LegalPageLayout";

const Contact = () => {
  const navigate = useNavigate();

  return (
    <LegalPageLayout
      title="Contact us"
      subtitle="Questions about BillBook, a demo request, or support — reach out directly."
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <a
          href="mailto:ayancloud2002@gmail.com"
          className="rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-card-hover transition-all"
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Email
          </div>
          <div className="text-slate-900 font-medium">ayancloud2002@gmail.com</div>
        </a>
        <a
          href="tel:+919800054895"
          className="rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-card-hover transition-all"
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Phone
          </div>
          <div className="text-slate-900 font-medium">+91 98000 54895</div>
        </a>
      </div>

      <div>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="inline-flex items-center justify-center rounded-[10px] bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-[0_1px_2px_rgba(79,70,229,0.3)] hover:bg-indigo-700 active:scale-[0.98] transition-all cursor-pointer"
        >
          Book a demo instead
        </button>
      </div>
    </LegalPageLayout>
  );
};

export default Contact;
