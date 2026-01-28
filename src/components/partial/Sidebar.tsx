import { useState, useEffect } from "react";
import { Link, } from "react-router-dom";
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
} from "react-icons/md";

const Sidebar = () => {
  const [active, setActive] = useState(() => localStorage.getItem("activeSidebar") || "");
  const [openItems, setOpenItems] = useState(false);
  const [openSales, setOpenSales] = useState(false);
  const [openPurchases, setOpenPurchases] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openAccounting, setOpenAccounting] = useState(false);
  const [loading, setLoading] = useState(true);

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const closeMobile = () => setIsMobileOpen(false);

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
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all duration-200 ${active === label
        ? "bg-blue-600 text-white font-medium shadow-md"
        : "text-gray-300 hover:bg-slate-700 hover:text-white"
        }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );

 const renderSkeleton = () => (
    <div className="px-4 py-6 space-y-4 animate-pulse">
     
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
        className="fixed top-3 right-3 z-50 p-2 bg-slate-800 text-white rounded-md shadow sm:hidden cursor-pointer"
        onClick={toggleMobile}
      >
        <MdMenu size={24} />
      </button>

      {isMobileOpen && (
        <div
          className="fixed inset-0  bg-opacity-25 z-40 sm:hidden cursor-pointer"
          onClick={closeMobile}
        />
      )}


      <div
        className={`
    fixed top-0 left-0 z-50 bg-slate-800 w-60  flex flex-col h-screen
    sm:top-0 sm:left-0 sm:bottom-2 sm:h-screen  shadow-2xl
    transform transition-transform duration-300 ease-in-out
    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
    sm:translate-x-0
    primary-font
  `}>

        <div className="sm:hidden flex justify-end p-3 cursor-pointer">
          <button onClick={closeMobile}>
            <MdClose size={24} />
          </button>
        </div>

  {loading ? (
          renderSkeleton()
        ) : (
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 hide-scrollbar">
          {/* Business Info Section */}
          <div className="space-y-3 pb-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-slate-800 text-lg font-bold">
                B
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Business Name
                </p>
                <p className="text-xs text-gray-400">9800054895</p>
              </div>
            </div>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer">
            + Create Sales Invoice
          </button>

          {/* General Section */}
          <div className="space-y-2">
            <p className="text-xs text-gray-400 px-3 font-medium tracking-wider uppercase">General</p>
            {general.map(({ label, icon, path }, idx) => renderLink(path, label, icon, idx))}

            {/* Items Dropdown */}
            <div>
              <div
                onClick={() => setOpenItems(!openItems)}
                className={`flex justify-between items-center px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all duration-200 ${active === "Items"
                  ? "bg-blue-600 text-white font-medium shadow-md"
                  : "text-gray-300 hover:bg-slate-700 hover:text-white"
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
                  ? "bg-blue-600 text-white font-medium shadow-md"
                  : "text-gray-300 hover:bg-slate-700 hover:text-white"
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
                  ? "bg-blue-600 text-white font-medium shadow-md"
                  : "text-gray-300 hover:bg-slate-700 hover:text-white"
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
                  ? "bg-blue-600 text-white font-medium shadow-md"
                  : "text-gray-300 hover:bg-slate-700 hover:text-white"
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
                    ? "bg-blue-600 text-white font-medium shadow-md"
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
      </div> 
    </>
  );
};

export default Sidebar;

