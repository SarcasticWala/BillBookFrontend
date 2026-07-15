import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import BusinessInfo from "./BusinessInfo";
import { useAuth } from "../../hooks/useAuth";
import {
  MdDashboard,
  MdGroups,
  MdInventory,
  MdShoppingCart,
  MdAssessment,
  MdAccountBalanceWallet,
  MdReceipt,
  MdAutoGraph,
  MdPayments,
  MdPointOfSale,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdInventory2,
  MdWarehouse,
  MdRequestQuote,
  MdReceiptLong,
  MdPayment,
  MdAssignmentReturn,
  MdCreditCard,
  MdDescription,
  MdMenu,
  MdClose,
  MdOutlineOndemandVideo,
  MdAdminPanelSettings,
  MdLogout,
  MdSecurity,
  MdVerifiedUser,
} from "react-icons/md";
import { useGetMeQuery } from "../../features/auth/authApiSlice";

const Sidebar = () => {
  const [active, setActive] = useState(() => localStorage.getItem("activeSidebar") || "");
  const [openItems, setOpenItems] = useState(false);
  const [openSales, setOpenSales] = useState(false);
  const [openPurchases, setOpenPurchases] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openAccounting, setOpenAccounting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { data: meData } = useGetMeQuery();
  const isAdmin = !!meData?.data?.isAdmin;
  const navigate = useNavigate();
  const { logout } = useAuth();

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const closeMobile = () => setIsMobileOpen(false);

  const handleLogout = () => {
    logout();
    closeMobile();
    localStorage.removeItem("activeSidebar");
    navigate("/login", { replace: true });
  };

  const handleActive = (label: string) => {
    setActive(label);
    localStorage.setItem("activeSidebar", label);
    closeMobile();
  };

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (["Inventory", "Godown"].includes(active)) setOpenItems(true);
    if (
      ["Sales Invoice", "Quotation / Estimate", "Payment In", "Sales Return", "Credit Note", "Proforma Invoice"].includes(active)
    )
      setOpenSales(true);
    if (
      ["Purchase Invoice", "Debit Note", "Purchase Return", "Payment Out", "Purchase Order"].includes(active)
    )
      setOpenPurchases(true);
    if (
      ["Cash & Bank", "E-Invoicing", "Automated Bills", "Expenses", "POS Billing"].includes(active)

    )
      setOpenAccounting(true);
  }, [active]);
  const general = [
    { label: "Dashboard", icon: <MdDashboard />, path: "/dashboard" },
    { label: "Parties", icon: <MdGroups />, path: "/parties" },
    { label: "Reports", icon: <MdAssessment />, path: "/reports" },
    { label: "Book a Demo", icon: <MdOutlineOndemandVideo />, path: "/book-demo" },
  ];



  // const businessTools = [
  //   { label: "Staff Attendance & Payroll", icon: <MdCalendarToday /> },
  //   { label: "Manage Users", icon: <MdPerson /> },
  //   { label: "Online Store", icon: <MdStore /> },
  //   { label: "SMS Marketing", icon: <MdSms /> },
  //   { label: "Apply For Loan", icon: <MdOutlineAccountBalance />, badge: "New" },
  //   { label: "Settings", icon: <MdSettings />, path: "/settings", badge: null },
  // ];

  const renderLink = (
    to: string,
    label: string,
    icon: React.ReactElement,
    key?: number
  ) => (
    <Link
      to={to}
      key={key}
      onClick={() => handleActive(label)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors ${active === label
        ? "bg-primary text-white font-medium shadow-sm"
        : "text-slate-300 hover:bg-slate-700/70 hover:text-white"
        }`}
    >
      <span className="w-5 flex items-center justify-center text-lg shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );

 const renderSkeleton = () => (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-4 animate-pulse hide-scrollbar">
     
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-400" />
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-300 rounded" />
          <div className="h-3 w-16 bg-gray-300 rounded" />
        </div>
      </div>

      
      <div className="h-10 bg-gray-300 rounded w-full" />

 
      {[...Array(20)].map((_, i) => (
        <div key={i} className="h-4 bg-gray-300 rounded w-full" />
      ))}
    </div>
  );

  return (
    <>
      <button
        className="fixed top-3 right-3 z-50 p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center bg-slate-800 text-white rounded-md shadow sm:hidden cursor-pointer"
        onClick={toggleMobile}
      >
        <MdMenu size={24} />
      </button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 sm:hidden cursor-pointer"
          onClick={closeMobile}
        />
      )}


      <div
        className={`
    fixed top-0 left-0 z-50 bg-slate-800 w-[85vw] max-w-[16rem] sm:w-60 flex flex-col
    h-[100dvh] shadow-2xl
    transform transition-transform duration-300 ease-in-out
    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
    sm:translate-x-0
    primary-font
  `}>

        <div className="sm:hidden flex justify-end p-3 cursor-pointer">
          <button
            onClick={closeMobile}
            className="text-gray-300 hover:text-white p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <MdClose size={24} />
          </button>
        </div>

  {loading ? (
          renderSkeleton()
        ) : (
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pt-2 pb-10 space-y-6 hide-scrollbar">
          {/* Business Info Section — links to profile settings */}
          <BusinessInfo onNavigate={() => handleActive("Settings")} />

          <Link
            to="/sales/create-invoice"
            onClick={closeMobile}
            className="block text-center w-full bg-primary hover:bg-primary-hover text-white text-sm font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
          >
            + Create Sales Invoice
          </Link>

          {/* General Section */}
          <div className="space-y-2">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">General</p>
            {general.map(({ label, icon, path }, idx) => renderLink(path, label, icon, idx))}
            {isAdmin &&
              renderLink("/admin/demo-requests", "Demo Requests", <MdAdminPanelSettings />)}

            {/* Items Dropdown */}
            <div>
              <div
                onClick={() => setOpenItems(!openItems)}
                className={`flex justify-between items-center px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all duration-200 ${active === "Items"
                  ? "bg-primary text-white font-medium shadow-sm"
                  : "text-slate-300 hover:bg-slate-700/70 hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <MdInventory className="text-lg" />
                  <span>Items</span>
                </div>
                {openItems ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
              </div>
              {openItems && (
                <div className="ml-6 mt-2 space-y-1">
                  {renderLink(
                    "/items/inventory",
                    "Inventory",
                    <MdInventory2 />
                  )}
                  {renderLink("/items/godown", "Godown", <MdWarehouse />)}
                </div>
              )}
            </div>

            {/* Sales Dropdown */}
            <div>
              <div
                onClick={() => setOpenSales(!openSales)}
                className={`flex justify-between items-center px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all duration-200 ${active === "Sales"
                  ? "bg-primary text-white font-medium shadow-sm"
                  : "text-slate-300 hover:bg-slate-700/70 hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <MdShoppingCart className="text-lg" />
                  <span>Sales</span>
                </div>
                {openSales ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
              </div>
              {openSales && (
                <div className="ml-2 mt-2 space-y-1">
                  {renderLink("/sales/invoices", "Sales Invoice", <MdReceiptLong />)}
                  {renderLink("/sales/quotation", "Quotation / Estimate", <MdRequestQuote />)}
                  {renderLink("/sales/paymentin", "Payment In", <MdPayment />)}
                  {renderLink(
                    "/sales/return",
                    "Sales Return",
                    <MdAssignmentReturn />
                  )}
                  {renderLink(
                    "/sales/creditnote",
                    "Credit Note",
                    <MdCreditCard />
                  )}
                  {renderLink(
                    "/sales/proforma",
                    "Proforma Invoice",
                    <MdDescription />
                  )}
                </div>
              )}
            </div>

            {/* Purchases Dropdown */}
            <div>
              <div
                onClick={() => setOpenPurchases(!openPurchases)}
                className={`flex justify-between items-center px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all duration-200 ${active === "Purchases"
                  ? "bg-primary text-white font-medium shadow-sm"
                  : "text-slate-300 hover:bg-slate-700/70 hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <MdShoppingCart className="text-lg" />
                  <span>Purchases</span>
                </div>
                {openPurchases ? (
                  <MdKeyboardArrowUp />
                ) : (
                  <MdKeyboardArrowDown />
                )}
              </div>
              {openPurchases && (
                <div className="ml-6 mt-2 space-y-1">
                  {renderLink(
                    "/purchases/purchaseInvoice",
                    "Purchase Invoice",
                    <MdReceiptLong />
                  )}
                  {renderLink(
                    "/purchases/debitnote",
                    "Debit Note",
                    <MdRequestQuote />
                  )}
                  {renderLink(
                    "/purchases/purchaseReturn",
                    "Purchase Return",
                    <MdPayment />
                  )}
                  {renderLink(
                    "/purchases/paymentout",
                    "Payment Out",
                    <MdAssignmentReturn />
                  )}
                  {renderLink(
                    "/purchases/purchaseorder",
                    "Purchase Order",
                    <MdCreditCard />
                  )}
                </div>
              )}
            </div>
            {/* Accounting Solutions Section */}
            <div>
              <div
                onClick={() => setOpenAccounting(!openAccounting)}
                className={`flex justify-between items-center px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all duration-200 ${active === "Accounting"
                  ? "bg-primary text-white font-medium shadow-sm"
                  : "text-slate-300 hover:bg-slate-700/70 hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <MdReceipt className="text-lg" />
                  <span>Accounting</span>
                </div>
                {openAccounting ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
              </div>
              {openAccounting && (
                <div className="ml-2 mt-2 space-y-1">
                  {renderLink("/cash-bank", "Cash & Bank", <MdAccountBalanceWallet />)}
                  {renderLink("/e-invoicing", "E-Invoicing", <MdReceipt />)}
                  {renderLink("/automated-bills", "Automated Bills", <MdAutoGraph />)}
                  {renderLink("/expenses", "Expenses", <MdPayments />)}
                  <div className="relative">
                    {renderLink("/pos-billing", "POS Billing", <MdPointOfSale />)}
                    <span className="absolute right-3 top-2 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                      New
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>





          {/* Business Tools Section */}
          {/* <div className="space-y-2 pb-6">
            <p className="text-xs text-gray-400 px-3 font-medium tracking-wider uppercase">Business Tools</p>
            {businessTools.map(({ label, icon, badge }) => (
              <div
                key={label}
                onClick={() => {
                  setActive(label);
                  closeMobile();
                }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all duration-200 relative ${
                  active === label
                    ? "bg-primary text-white font-medium shadow-md"
                    : "text-gray-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{icon}</span>
                  <span>{label}</span>
                </div>
                {badge && (
                  <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    {badge}
                  </span>
                )}
              </div>
            ))}
          </div> */}
        </div>
         )}

        {/* Footer — logout + trust badges + version, pinned to the bottom. */}
        <div className="shrink-0 border-t border-slate-700/70 px-4 py-3 space-y-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-700/70 hover:text-white transition-colors cursor-pointer"
          >
            <MdLogout className="text-lg" />
            <span>Log out</span>
          </button>

          <div className="flex items-center gap-4 px-1 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1">
              <MdSecurity className="text-sm text-emerald-400" /> 100% Secure
            </span>
            <span className="inline-flex items-center gap-1">
              <MdVerifiedUser className="text-sm text-indigo-400" /> ISO Certified
            </span>
          </div>

          <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
            <span className="font-semibold tracking-tight">
              <span className="text-indigo-400">Bill</span>
              <span className="text-slate-300">Book</span>
            </span>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

