import { Routes, Route } from "react-router-dom";

import SalesInvoices from "../../../components/Sales/SalesInvoices";
import CreditNote from "../../../components/Sales/CreditNote";
import ProformaInvoice from "../../../components/Sales/ProformaInvoice";
import SalesReturn from "../../../components/Sales/SalesReturn";
import PaymentIn from "../../../components/Sales/PaymentIn";
import QuotationEstimate from "../../../components/Sales/QuotationEstimate";

const SalesPage = () => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex-1 min-w-[200px]">
      <Routes>
        <Route path="invoices" element={<SalesInvoices />} />
        <Route path="creditnote" element={<CreditNote />} />
        <Route path="proforma" element={<ProformaInvoice />} />
        <Route path="return" element={<SalesReturn />} />
        <Route path="paymentin" element={<PaymentIn />} />
        <Route path="quotation" element={<QuotationEstimate />} />
      
      </Routes>
    </div>
  );
};

export default SalesPage;
