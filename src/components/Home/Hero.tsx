import React, { useEffect, useState } from "react";
import { Button } from "../UI/Button";
import InvoiceCardSkeleton from "./InvoiceCardSkeleton";

const stats = [
  { value: "1 Cr+", label: "Businesses trust us" },
  { value: "12 Cr+", label: "Invoices generated" },
  { value: "28", label: "States covered" },
  { value: "99.9%", label: "Uptime" },
];

const features = [
  {
    title: "GST E-Invoicing",
    description: "Auto-generate IRN & QR codes, fully compliant with the latest GST rules.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: "E-Way Bill",
    description: "Generate and track e-way bills in a couple of clicks, no separate portal login.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    title: "Inventory & Stock",
    description: "Real-time stock tracking across warehouses, with low-stock alerts built in.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    title: "Multi-Branch Billing",
    description: "Run billing across multiple branches or outlets from a single dashboard.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9h.01M9 13h.01M9 17h.01" />
      </svg>
    ),
  },
];

const Hero: React.FC = () => {
  // Brief skeleton on the invoice preview card, then reveal.
  const [cardLoading, setCardLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setCardLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative w-full secondary-font overflow-hidden">
      {/* Background (dot grid + gradient) is provided at the page root now. */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-16">
        <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-10">
          {/* LEFT: copy */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              Trusted by 1 Crore+ Indian businesses
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl primary-font text-slate-900 mb-5 leading-[1.1] tracking-tight">
              GST billing software,
              <br />
              built for how India invoices
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed">
              Create GST-compliant invoices, manage inventory, and file e-way bills
              from one dashboard — trusted by retailers, distributors, and
              accountants across the country.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-10">
              <Button>Start Free Billing</Button>
              <button className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors">
                Watch product tour
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* trust bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-slate-200 pt-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900">{s.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: real invoice mockup instead of decorative blobs */}
          <div className="flex-1 flex justify-center lg:justify-end w-full">
            <div className="relative w-full max-w-sm">
              <div className="absolute -top-3 -right-3 w-full h-full rounded-2xl bg-indigo-100 -z-10" />
              {cardLoading ? (
                <InvoiceCardSkeleton />
              ) : (
                <>
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div>
                    <div className="text-sm font-bold text-slate-900">INV-2026-0347</div>
                    <div className="text-xs text-slate-400">Issued 12 Jul 2026</div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Paid
                  </span>
                </div>

                <div className="px-5 py-4 space-y-3">
                  {[
                    { name: "Consulting Services", qty: "1 x", amount: "₹18,000" },
                    { name: "Web Hosting (Annual)", qty: "1 x", amount: "₹4,500" },
                    { name: "Support Retainer", qty: "3 x", amount: "₹6,000" },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div>
                        <div className="text-slate-700 font-medium">{item.name}</div>
                        <div className="text-xs text-slate-400">{item.qty}</div>
                      </div>
                      <div className="text-slate-900 font-medium">{item.amount}</div>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Subtotal</span>
                    <span>₹28,500</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>CGST + SGST (18%)</span>
                    <span>₹5,130</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                    <span>Total</span>
                    <span>₹33,630</span>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-5 bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">IRN generated</div>
                  <div className="text-[11px] text-slate-400">e-Invoice compliant</div>
                </div>
              </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* FEATURES: replaces the single paragraph with real content */}
        <div className="mt-24 sm:mt-28">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              One platform for every part of billing
            </h2>
            <p className="text-slate-600">
              Built for small and medium businesses across India — from a single
              shop to a multi-branch distribution business.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-200 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-12">
            <span className="inline-flex items-center px-3.5 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
              🇮🇳 Made in India, for India
            </span>
            <span className="text-xs text-slate-400">Paid plans starting from ₹33/month</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;