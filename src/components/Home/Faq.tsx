import React, { useState } from "react";
import { Reveal } from "../UI/Reveal";

const faqs = [
  {
    q: "Is BillBook fully GST compliant?",
    a: "Yes. Every invoice follows the GST format with CGST/SGST/IGST breakup, HSN/SAC codes, and place-of-supply logic. Reports export cleanly for GSTR-1 and GSTR-3B filing.",
  },
  {
    q: "Can I generate e-invoices (IRN) and QR codes?",
    a: "Yes. BillBook auto-generates the IRN and signed QR code for e-invoicing as per the latest turnover thresholds, so your invoices are compliant the moment you save them.",
  },
  {
    q: "Does it handle e-way bills?",
    a: "You can generate and track e-way bills directly from an invoice in a couple of clicks — no separate portal login or re-entering details.",
  },
  {
    q: "How do HSN codes and multi-state filing work?",
    a: "Assign HSN/SAC codes to items once and they flow into every invoice and report. For businesses operating across states, BillBook keeps state-wise records ready for multi-state GST filing.",
  },
  {
    q: "Can I manage multiple branches and godowns?",
    a: "The Enterprise plan supports multi-branch billing and multiple godowns with real-time stock across locations, plus role-based access for your team.",
  },
  {
    q: "Is my business data secure?",
    a: "Your data is encrypted in transit over HTTPS and stored on secured cloud infrastructure with regular backups. Access is protected by verified accounts and role-based permissions.",
  },
  {
    q: "What are the pricing and refund terms?",
    a: "Plans start at ₹33/month and you can start free. Billing is monthly or yearly (2 months free on yearly), a GST invoice is provided, and you can cancel anytime.",
  },
  {
    q: "What support do I get?",
    a: "All plans include email support; Growth and Enterprise add priority support, and Enterprise includes a dedicated account manager to help with onboarding and filing.",
  },
];

const Faq: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="w-full py-20 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            Frequently asked questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Everything you need to know
          </h2>
          <p className="text-slate-600">Answers to the most common GST billing questions.</p>
        </Reveal>

        <div className="space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={i * 60}>
                <div
                  className={`rounded-xl border bg-white transition-colors ${
                    isOpen ? "border-indigo-200 shadow-sm" : "border-slate-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-semibold text-slate-900">{item.q}</span>
                    <svg
                      className={`w-5 h-5 text-indigo-600 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Faq;
