import { Routes, Route } from "react-router-dom";

import DebitNote from "../../../components/Purchases/DebitNote";
import PaymentOut from "../../../components/Purchases/PaymentOut";
import PurchaseOrder from "../../../components/Purchases/PurchaseOrders";
import PurchaseReturn from "../../../components/Purchases/PurchaseReturn";
import PurchasesInvoice from "../../../components/Purchases/PurchasesInvoice";
import DocumentForm from "../../../components/Documents/DocumentForm";
import PaymentForm from "../../../components/Documents/PaymentForm";

const PurchasePage = () => {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-[var(--shadow-card)]">
      <Routes>
        <Route path="purchaseInvoice" element={<PurchasesInvoice />} />
        <Route path="debitnote" element={<DebitNote />} />
        <Route path="purchaseReturn" element={<PurchaseReturn />} />
        <Route path="paymentout" element={<PaymentOut />} />
        <Route path="purchaseorder" element={<PurchaseOrder />} />

        {/* Create flows */}
        <Route
          path="purchaseorder/create"
          element={
            <DocumentForm type="PURCHASE_ORDER" title="Purchase Order" backTo="/purchases/purchaseorder" numberPrefix="PO" partyLabel="Supplier" />
          }
        />
        <Route
          path="purchaseReturn/create"
          element={
            <DocumentForm type="PURCHASE_RETURN" title="Purchase Return" backTo="/purchases/purchaseReturn" numberPrefix="PR" partyLabel="Supplier" />
          }
        />
        <Route
          path="debitnote/create"
          element={
            <DocumentForm type="DEBIT_NOTE" title="Debit Note" backTo="/purchases/debitnote" numberPrefix="DN" partyLabel="Supplier" />
          }
        />
        <Route
          path="paymentout/create"
          element={
            <PaymentForm type="PAYMENT_OUT" title="Payment Out" backTo="/purchases/paymentout" numberPrefix="POUT" partyLabel="Supplier" />
          }
        />
      </Routes>
    </div>
  );
};

export default PurchasePage;
