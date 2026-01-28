import { Routes, Route } from "react-router-dom";

import DebitNote from "../../../components/Purchases/DebitNote";
import PaymentOut from "../../../components/Purchases/PaymentOut";
import PurchaseOrder from "../../../components/Purchases/PurchaseOrders";
import PurchaseReturn from "../../../components/Purchases/PurchaseReturn";
import PurchasesInvoice from "../../../components/Purchases/PurchasesInvoice";

const PurchasePage = () => {
    return(
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex-1 min-w-[200px]">
      <Routes>
        <Route path="purchaseInvoice" element={<PurchasesInvoice />} />
        <Route path="debitnote" element={<DebitNote />} />
        <Route path="purchaseReturn" element={<PurchaseReturn />} />
   
        <Route path="paymentout" element={<PaymentOut />} />
        <Route path="purchaseorder" element={<PurchaseOrder />} />
      
      </Routes>
    </div>
    )
}
export default PurchasePage;