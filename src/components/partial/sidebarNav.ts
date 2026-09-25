/**
 * Which sidebar entry a URL belongs to.
 *
 * The highlight is derived from the URL, never from the click that got you
 * there. It used to be click-driven state persisted in localStorage, which is
 * wrong for every navigation that isn't a sidebar click: straight after login
 * nothing was highlighted at all (logout clears the key, and no click has
 * happened yet), a refresh or a deep link restored whatever was last clicked
 * rather than where you actually are, and browser back/forward plus in-app
 * navigation ("Create Sales Invoice", the back button on an account detail
 * page) left the highlight behind on the previous page.
 *
 * `group` is the collapsible section a path lives in, so the right dropdown is
 * already open on load. Paths that aren't sidebar entries themselves (detail
 * and create screens) are listed too, so the section you're inside stays lit.
 * Matching is longest-prefix, so `/sales/invoices` beats the `/sales` catch-all
 * while `/sales/invoice/:id` still falls back to it.
 */
export type NavMatch = { path: string; label?: string; group?: string };

export const NAV_MATCHES: NavMatch[] = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/parties", label: "Parties" },
  { path: "/party", label: "Parties" },
  { path: "/reports", label: "Reports" },
  { path: "/book-demo", label: "Book a Demo" },
  { path: "/admin/demo-requests", label: "Demo Requests" },
  { path: "/settings", label: "Settings" },

  { path: "/items", label: "Inventory", group: "Items" },
  { path: "/items/inventory", label: "Inventory", group: "Items" },
  { path: "/items/godown", label: "Godown", group: "Items" },
  { path: "/create-category", group: "Items" },

  { path: "/sales", label: "Sales Invoice", group: "Sales" },
  { path: "/sales/invoices", label: "Sales Invoice", group: "Sales" },
  { path: "/sales/quotation", label: "Quotation / Estimate", group: "Sales" },
  { path: "/sales/paymentin", label: "Payment In", group: "Sales" },
  { path: "/sales/return", label: "Sales Return", group: "Sales" },
  { path: "/sales/creditnote", label: "Credit Note", group: "Sales" },
  { path: "/sales/proforma", label: "Proforma Invoice", group: "Sales" },

  // Both spellings are real routes: the list lives at `/purchases/*`, but the
  // create form is mounted at `/purchase/create-invoice` (singular).
  { path: "/purchases", label: "Purchase Invoice", group: "Purchases" },
  { path: "/purchase", label: "Purchase Invoice", group: "Purchases" },
  { path: "/purchases/purchaseInvoice", label: "Purchase Invoice", group: "Purchases" },
  { path: "/purchases/debitnote", label: "Debit Note", group: "Purchases" },
  { path: "/purchases/purchaseReturn", label: "Purchase Return", group: "Purchases" },
  { path: "/purchases/paymentout", label: "Payment Out", group: "Purchases" },
  { path: "/purchases/purchaseorder", label: "Purchase Order", group: "Purchases" },

  { path: "/cash-bank", label: "Cash & Bank", group: "Accounting" },
  { path: "/e-invoicing", label: "E-Invoicing", group: "Accounting" },
  { path: "/automated-bills", label: "Automated Bills", group: "Accounting" },
  { path: "/expenses", label: "Expenses", group: "Accounting" },
  { path: "/pos-billing", label: "POS Billing", group: "Accounting" },
];

export function matchNav(pathname: string): NavMatch | undefined {
  let best: NavMatch | undefined;
  for (const item of NAV_MATCHES) {
    if (pathname === item.path || pathname.startsWith(`${item.path}/`)) {
      if (!best || item.path.length > best.path.length) best = item;
    }
  }
  return best;
}

