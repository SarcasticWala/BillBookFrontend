import React from "react";
import { FaXTwitter, FaLinkedinIn, FaInstagram, FaFacebookF } from "react-icons/fa6";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "E-Invoicing", href: "/gst-e-invoicing" },
      { label: "Inventory", href: "/inventory-management" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-conditions" },
      { label: "Refund Policy", href: "/refund-policy" },
    ],
  },
];

const socials = [
  { Icon: FaXTwitter, label: "X (Twitter)" },
  { Icon: FaLinkedinIn, label: "LinkedIn" },
  { Icon: FaInstagram, label: "Instagram" },
  { Icon: FaFacebookF, label: "Facebook" },
];

const FooterLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a
    href={href}
    className="relative inline-block text-sm text-slate-500 hover:text-slate-900 transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-slate-900 after:transition-all after:duration-300 hover:after:w-full"
  >
    {children}
  </a>
);

interface LandingFooterProps {
  /** Shorter, tighter version for use inside the dashboard chrome (every
   * page after login) — same links/content as the full marketing footer on
   * "/", just less vertical padding so it doesn't dominate a working screen. */
  compact?: boolean;
}

const LandingFooter: React.FC<LandingFooterProps> = ({ compact = false }) => {
  return (
    <footer className="w-full border-t border-slate-200 bg-white/70">
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${compact ? "py-6" : "py-14"}`}
      >
        <div className={`grid grid-cols-2 md:grid-cols-4 ${compact ? "gap-6" : "gap-10"}`}>
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className={`text-xl font-bold tracking-tight ${compact ? "mb-1.5" : "mb-3"}`}>
              <span className="text-indigo-600">BillBook</span>
              <span className="text-slate-900">Software</span>
            </div>
            {!compact && (
              <p className="text-sm text-slate-500 leading-relaxed mb-5 max-w-xs">
                GST billing, e-invoicing, and inventory — built for how India invoices.
              </p>
            )}
            <div className="flex items-center gap-2.5">
              {socials.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className={`rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors ${
                    compact ? "w-9 h-9 xl:w-7 xl:h-7" : "w-11 h-11 xl:w-9 xl:h-9"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4
                className={`text-xs font-semibold uppercase tracking-wider text-slate-900 ${
                  compact ? "mb-2" : "mb-4"
                }`}
              >
                {col.title}
              </h4>
              <ul className={compact ? "space-y-1.5" : "space-y-3"}>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <FooterLink href={l.href}>{l.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-200">
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 ${
            compact ? "py-2.5" : "py-5"
          }`}
        >
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} BillBook Software. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 inline-flex items-center gap-1.5">
            Made in India
            {/* Plain flag emoji (🇮🇳) renders as bare "IN" text on Windows/Chrome
                instead of an actual flag glyph — use a tiny inline SVG instead
                so it looks the same on every OS. */}
            <svg
              aria-hidden="true"
              viewBox="0 0 24 16"
              className="w-4 h-[11px] rounded-[1.5px] overflow-hidden shrink-0"
            >
              <rect width="24" height="16" fill="#fff" />
              <rect width="24" height="5.33" fill="#FF9933" />
              <rect y="10.67" width="24" height="5.33" fill="#138808" />
              <circle cx="12" cy="8" r="2" fill="none" stroke="#000080" strokeWidth="0.3" />
              <circle cx="12" cy="8" r="0.4" fill="#000080" />
            </svg>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
