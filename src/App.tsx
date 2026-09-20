import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";
import { BrandLoader } from "./components/UI/BrandLoader.tsx";
import PartyDetail from "./components/Parties/PartyDetail.tsx";
import { ItemDetailsPage } from "./components/items/ItemDetailsPage.tsx";
import { InvoiceDetailPage } from "./components/invoices/InvoiceDetailPage.tsx";
import { AccountDetailPage } from "./components/accounting/AccountDetailPage.tsx";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";

// Lazy components
const CreateCategory = lazy(
  () => import("./pages/dashboard/Items/CreateItems/CreateCategory")
);
const Home = lazy(() => import("./pages/Home/Home.tsx"));
const DashboardLayout = lazy(() => import("./components/layout/DashboardLayout"));
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
const CreatePurchaseForm = lazy(() => import("./pages/dashboard/Purchace/PurchaseCreate/PurchaseCreate"));
const CreateSalesForm = lazy(() => import("./pages/dashboard/sales/SalesInvoice/CreateSalesInvoice/CreateSalesInvoices"));
const ExpensesPage = lazy(() => import("./pages/dashboard/Expenss/ExpensesPage"));
const SettingsPage = lazy(() => import("./pages/dashboard/Settings/Settings"));
const BookDemoPage = lazy(() => import("./pages/dashboard/BookDemo/BookDemoPage"));
const PosBillingPage = lazy(() => import("./pages/dashboard/PosBilling/PosBillingPage"));
const AdminDemoRequests = lazy(() => import("./pages/dashboard/Admin/AdminDemoRequests"));
const PrivacyPolicy = lazy(() => import("./pages/Legal/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./pages/Legal/TermsAndConditions"));
const NotFoundPage = lazy(() => import("./pages/NotFound"));
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function App() {
  // Brief branded splash on initial app load, with a smooth fade-out.
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <BrandLoader visible={booting} />
      <ErrorBoundary>
      <Suspense fallback={<BrandLoader visible />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms-conditions" element={<TermsAndConditions />} />

        {/* Every child below requires auth (ProtectedRoute renders <Outlet/> or
            redirects to /login) AND gets the dashboard chrome (DashboardLayout).
            Because these are real sibling paths — not a "/*" wildcard — a URL
            that matches none of them falls through to the top-level "*" route
            below instead of ever reaching the auth check. */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="parties" element={<Parties_Page />} />
            <Route path="party/:id" element={<PartyDetail />} />
            <Route path="parties/create-party" element={<CreateParty />} />
            <Route path="parties/create-party/:id" element={<CreateParty />} />
            <Route path="items/*" element={<Items_page />} />
            <Route path="items/inventory/:id" element={<ItemDetailsPage />} />
            <Route path="sales/*" element={<SalesPage />} />
            <Route path="purchases/*" element={<PurchasePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="cash-bank" element={<CashAndBankPage />} />
            <Route path="cash-bank/account/:id" element={<AccountDetailPage />} />
            <Route path="e-invoicing" element={<EInvoicingPage />} />
            <Route path="automated-bills" element={<AutomatedBillsPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="book-demo" element={<BookDemoPage />} />
            <Route path="pos-billing" element={<PosBillingPage />} />
            <Route path="admin/demo-requests" element={<AdminDemoRequests />} />
            <Route path="create-category" element={<CreateCategory />} />
            <Route path="purchase/create-invoice" element={<CreatePurchaseForm />} />
            <Route path="sales/create-invoice" element={<CreateSalesForm />} />
            <Route path="sales/invoice/:id" element={<InvoiceDetailPage type="SALE" />} />
            <Route path="purchases/invoice/:id" element={<InvoiceDetailPage type="PURCHASE" />} />
            <Route path="sales/invoice/:id/edit" element={<CreateSalesForm />} />
            <Route path="purchases/invoice/:id/edit" element={<CreatePurchaseForm />} />
          </Route>
        </Route>

        {/* Genuinely unmatched URL, logged in or not — shown directly, no
            auth check, no dashboard chrome. */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
