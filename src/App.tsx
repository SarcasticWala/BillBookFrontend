import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useState, useEffect, type ReactNode } from "react";
import { BrandLoader } from "./components/UI/BrandLoader.tsx";
import { PageSkeleton } from "./components/layout/PageSkeleton.tsx";
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
const RefundPolicy = lazy(() => import("./pages/Legal/RefundPolicy"));
const Features = lazy(() => import("./pages/Info/Features"));
const EInvoicingInfo = lazy(() => import("./pages/Info/EInvoicingInfo"));
const InventoryInfo = lazy(() => import("./pages/Info/InventoryInfo"));
const About = lazy(() => import("./pages/Info/About"));
const Blog = lazy(() => import("./pages/Info/Blog"));
const Contact = lazy(() => import("./pages/Info/Contact"));
const NotFoundPage = lazy(() => import("./pages/NotFound"));
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // The target section (e.g. Pricing on Home) may still be behind a lazy
      // chunk that hasn't rendered yet, so the element might not exist in the
      // DOM the instant this effect runs — poll a few frames until it does
      // instead of giving up (or, worse, forcing scroll back to 0,0 below).
      const id = hash.slice(1);
      let attempts = 0;
      let frame: number;
      const tryScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (attempts < 50) {
          attempts += 1;
          frame = requestAnimationFrame(tryScroll);
        }
      };
      tryScroll();
      return () => cancelAnimationFrame(frame);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);
  return null;
}

/** Public marketing/auth pages — no auth check, no dashboard chrome. */
const PUBLIC_ROUTES: Array<{ path: string; element: ReactNode }> = [
  { path: "/", element: <Home /> },
  { path: "login", element: <Login /> },
  { path: "privacy-policy", element: <PrivacyPolicy /> },
  { path: "terms-conditions", element: <TermsAndConditions /> },
  { path: "refund-policy", element: <RefundPolicy /> },
  { path: "features", element: <Features /> },
  { path: "gst-e-invoicing", element: <EInvoicingInfo /> },
  { path: "inventory-management", element: <InventoryInfo /> },
  { path: "about", element: <About /> },
  { path: "blog", element: <Blog /> },
  { path: "contact", element: <Contact /> },
];

/**
 * Every dashboard screen, each mounted inside its own keyed <Suspense>.
 *
 * React Router 7 runs navigations inside `startTransition`, and during a
 * transition React deliberately keeps the *previously revealed* UI on screen
 * rather than falling back to an already-mounted <Suspense> boundary. The URL
 * and the Sidebar highlight are not suspended, so they update immediately:
 * without a per-route boundary you get the new URL, the new sidebar highlight,
 * and the *old page* still in the content area until the chunk lands — which
 * reads as "the click did nothing". Locally the chunk is instant and this is
 * invisible; over the network it is not.
 *
 * A *newly mounted* boundary does show its fallback mid-transition, hence the
 * `key`: it is the route's own path, so a boundary is torn down and rebuilt
 * exactly when the matched route changes. Wildcard sections (`items/*`,
 * `sales/*`, `purchases/*`) keep one key across their whole subtree, so
 * navigating inside them preserves the page's internal state.
 */
const DASHBOARD_ROUTES: Array<{ path: string; element: ReactNode }> = [
  { path: "dashboard", element: <DashboardPage /> },
  { path: "parties", element: <Parties_Page /> },
  { path: "party/:id", element: <PartyDetail /> },
  { path: "parties/create-party", element: <CreateParty /> },
  { path: "parties/create-party/:id", element: <CreateParty /> },
  { path: "items/*", element: <Items_page /> },
  { path: "items/inventory/:id", element: <ItemDetailsPage /> },
  { path: "sales/*", element: <SalesPage /> },
  { path: "purchases/*", element: <PurchasePage /> },
  { path: "reports", element: <ReportsPage /> },
  { path: "cash-bank", element: <CashAndBankPage /> },
  { path: "cash-bank/account/:id", element: <AccountDetailPage /> },
  { path: "e-invoicing", element: <EInvoicingPage /> },
  { path: "automated-bills", element: <AutomatedBillsPage /> },
  { path: "expenses", element: <ExpensesPage /> },
  { path: "settings", element: <SettingsPage /> },
  { path: "book-demo", element: <BookDemoPage /> },
  { path: "pos-billing", element: <PosBillingPage /> },
  { path: "admin/demo-requests", element: <AdminDemoRequests /> },
  { path: "create-category", element: <CreateCategory /> },
  { path: "purchase/create-invoice", element: <CreatePurchaseForm /> },
  { path: "sales/create-invoice", element: <CreateSalesForm /> },
  { path: "sales/invoice/:id", element: <InvoiceDetailPage type="SALE" /> },
  { path: "purchases/invoice/:id", element: <InvoiceDetailPage type="PURCHASE" /> },
  { path: "sales/invoice/:id/edit", element: <CreateSalesForm /> },
  { path: "purchases/invoice/:id/edit", element: <CreatePurchaseForm /> },
];

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
        {PUBLIC_ROUTES.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={
              // Same keyed-boundary reasoning as DASHBOARD_ROUTES — these pages
              // suspend on their own chunks too, so without this a click on
              // "Features" leaves the Home page on screen until it arrives.
              <Suspense key={path} fallback={<BrandLoader visible />}>
                {element}
              </Suspense>
            }
          />
        ))}

        {/* Every child below requires auth (ProtectedRoute renders <Outlet/> or
            redirects to /login) AND gets the dashboard chrome (DashboardLayout).
            Because these are real sibling paths — not a "/*" wildcard — a URL
            that matches none of them falls through to the top-level "*" route
            below instead of ever reaching the auth check. */}
        <Route element={<ProtectedRoute />}>
          {/* The chrome is lazy too, so entering the dashboard from a public
              page (e.g. straight after login) suspends here, one level above
              the per-route boundaries below. Without its own boundary that
              first entry leaves the previous public page on screen. */}
          <Route
            element={
              <Suspense key="dashboard-chrome" fallback={<BrandLoader visible />}>
                <DashboardLayout />
              </Suspense>
            }
          >
            {DASHBOARD_ROUTES.map(({ path, element }) => (
              <Route
                key={path}
                path={path}
                element={
                  <Suspense key={path} fallback={<PageSkeleton />}>
                    {element}
                  </Suspense>
                }
              />
            ))}
          </Route>
        </Route>

        {/* Genuinely unmatched URL, logged in or not — shown directly, no
            auth check, no dashboard chrome. */}
        <Route
          path="*"
          element={
            <Suspense key="not-found" fallback={<BrandLoader visible />}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Routes>
      </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
