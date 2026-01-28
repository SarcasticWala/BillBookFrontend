import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy } from "react";
import PartyDetail from "./components/Parties/PartyDetail.tsx";
import { ItemDetailsPage } from "./components/items/ItemDetailsPage.tsx";

// Lazy components
const CreateCategory = lazy(
  () => import("./pages/dashboard/Items/CreateItems/CreateCategory")
);
const Home = lazy(() => import("./pages/Home/Home.tsx"));
const Sidebar = lazy(() => import("./components/partial/Sidebar"));
const Login = lazy(() => import("./pages/Login"));
const Parties_Page = lazy(
  () => import("./pages/dashboard/parties/Parties_page")
);
const Items_page = lazy(() => import("./pages/dashboard/Items/Items"));
const SalesPage = lazy(() => import("./pages/dashboard/sales/sales_page"));
const CreateParty = lazy(() => import("./pages/dashboard/parties/CreateParty"));

const PurchasePage = lazy(
  () => import("./pages/dashboard/Purchace/PurchasePage")
);
const ReportsPage = lazy(
  () => import("./pages/dashboard/Report/ReportPage/Report.tsx")
);
const CashAndBankPage = lazy(
  () => import("./pages/dashboard/Cash&Bank/Cash&BankPage/Cash&BankPage")
);
const EInvoicingPage = lazy(
  () => import("./pages/dashboard/EInvoicing/EInvoicing")
);
const AutomatedBillsPage = lazy(
  () => import("./pages/dashboard/AutomatedBill/AutomatedBillsPage.tsx")
);
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const Footer = lazy(() => import("./components/Footer/Footer"));
const CreatePurchaseForm = lazy(() => import("./pages/dashboard/Purchace/PurchaseCreate/PurchaseCreate"));
const CreateSalesForm = lazy(() => import("./pages/dashboard/sales/SalesInvoice/CreateSalesInvoice/CreateSalesInvoices"));
const ExpensesPage = lazy(() => import("./pages/dashboard/Expenss/ExpensesPage"));
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route
          path="/*"
          element={
            <div className="flex ">
              <Sidebar />
              <div className="flex-1 min-h-screen sm:ml-60 flex flex-col bg-white pb-8">
                <div className="flex-grow p-4 w-full max-w-9xl mx-auto">
                  <Routes>
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="parties" element={<Parties_Page />} />
                    <Route path="/party/:id" element={<PartyDetail />} />
                    <Route path="parties/create-party" element={<CreateParty />} />
                    <Route path="/parties/create-party/:id" element={<CreateParty />} />
                    <Route path="items/*" element={<Items_page />} />
                    <Route path="/items/inventory/:id" element={<ItemDetailsPage />} />
                    <Route path="sales/*" element={<SalesPage />} />
                    <Route path="purchases/*" element={<PurchasePage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="cash-bank" element={<CashAndBankPage />} />
                    <Route path="e-invoicing" element={<EInvoicingPage />} />
                     <Route path="automated-bills" element={<AutomatedBillsPage />} />
                     <Route path="expenses" element={<ExpensesPage />} />
                    <Route
                      path="create-category"
                      element={<CreateCategory />}
                    />
                    <Route path="purchase/create-invoice" element={<CreatePurchaseForm />} />
                    <Route path="sales/create-invoice" element={<CreateSalesForm />} />
                  </Routes>
                </div>
                <Footer />
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
