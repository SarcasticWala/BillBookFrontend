import { Routes, Route } from "react-router-dom";

import SalesInvoices from "../../../components/Sales/SalesInvoices";
import CreditNote from "../../../components/Sales/CreditNote";
import ProformaInvoice from "../../../components/Sales/ProformaInvoice";
import SalesReturn from "../../../components/Sales/SalesReturn";
import PaymentIn from "../../../components/Sales/PaymentIn";
import QuotationEstimate from "../../../components/Sales/QuotationEstimate";
import DocumentForm from "../../../components/Documents/DocumentForm";
import PaymentForm from "../../../components/Documents/PaymentForm";

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

        {/* Create flows */}
        <Route
          path="quotation/create"
          element={
            <DocumentForm type="QUOTATION" title="Quotation" backTo="/sales/quotation" numberPrefix="QUO" partyLabel="Customer" />
          }
        />
        <Route
          path="proforma/create"
          element={
            <DocumentForm type="PROFORMA" title="Proforma Invoice" backTo="/sales/proforma" numberPrefix="PRO" partyLabel="Customer" />
          }
        />
        <Route
          path="creditnote/create"
          element={
            <DocumentForm type="CREDIT_NOTE" title="Credit Note" backTo="/sales/creditnote" numberPrefix="CN" partyLabel="Customer" />
          }
        />
        <Route
          path="return/create"
          element={
            <DocumentForm type="SALES_RETURN" title="Sales Return" backTo="/sales/return" numberPrefix="SR" partyLabel="Customer" />
          }
        />
        <Route
          path="paymentin/create"
          element={
            <PaymentForm type="PAYMENT_IN" title="Payment In" backTo="/sales/paymentin" numberPrefix="PIN" partyLabel="Customer" />
          }
        />
      </Routes>
    </div>
  );
};

export default SalesPage;
