import { MdPointOfSale } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/UI/Button";

const PosBillingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="secondary-font flex flex-col items-center justify-center text-center min-h-[60vh] px-4">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center text-4xl text-primary mb-5">
        <MdPointOfSale />
      </div>
      <span className="inline-flex items-center rounded-full bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 mb-3">
        Coming soon
      </span>
      <h1 className="text-2xl primary-font text-gray-900">POS Billing</h1>
      <p className="text-sm light-font text-gray-500 mt-2 max-w-md">
        Fast counter billing with barcode scanning and quick checkout is on the
        way. In the meantime, you can raise sales invoices from the Sales
        section.
      </p>
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Button onClick={() => navigate("/sales/create-invoice")}>
          Create a Sales Invoice
        </Button>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default PosBillingPage;
