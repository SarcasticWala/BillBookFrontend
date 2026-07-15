import React, { useState } from "react";
import { Reveal } from "../UI/Reveal";

type Billing = "monthly" | "yearly";

const tiers = [
  {
    name: "Starter",
    tagline: "For a single shop getting started",
    monthly: 33,
    yearly: 28,
    features: [
      "GST-compliant invoices",
      "Up to 100 items",
      "Basic inventory tracking",
      "Email support",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Growth",
    tagline: "For growing retailers & distributors",
    monthly: 99,
    yearly: 82,
    features: [
      "Everything in Starter",
      "Unlimited items & parties",
      "E-invoicing (IRN) & e-way bills",
      "GSTR-ready reports (HSN-wise)",
      "Priority support",
    ],
    cta: "Start Free Billing",
    popular: true,
  },
  {
    name: "Enterprise",
    tagline: "For multi-branch businesses",
    monthly: 299,
    yearly: 249,
    features: [
      "Everything in Growth",
      "Multi-branch & multi-godown",
      "Multi-state GST filing",
      "Role-based team access",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const Check = () => (
  <svg className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
  </svg>
);

const Pricing: React.FC = () => {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <section className="w-full py-20 sm:py-24 bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            Simple, transparent pricing
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Plans that scale with your business
          </h2>
          <p className="text-slate-600">No hidden charges. Cancel anytime. GST invoice provided.</p>
        </Reveal>

        {/* Billing toggle */}
        <Reveal className="flex items-center justify-center gap-3 mb-12">
          <span className={`text-sm font-medium ${billing === "monthly" ? "text-slate-900" : "text-slate-400"}`}>
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={billing === "yearly"}
            onClick={() => setBilling((b) => (b === "monthly" ? "yearly" : "monthly"))}
            className="relative w-14 h-7 rounded-full bg-indigo-600 transition-colors cursor-pointer"
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
                billing === "yearly" ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billing === "yearly" ? "text-slate-900" : "text-slate-400"}`}>
            Yearly
          </span>
          <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
            Save 2 months
          </span>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {tiers.map((tier, i) => {
            const price = billing === "monthly" ? tier.monthly : tier.yearly;
            return (
              <Reveal key={tier.name} delay={i * 120}>
                <div
                  className={`relative h-full rounded-2xl bg-white p-6 sm:p-7 transition-all ${
                    tier.popular
                      ? "border-2 border-indigo-500 shadow-xl shadow-indigo-200/50 md:scale-[1.04]"
                      : "border border-slate-200 hover:border-indigo-200 hover:shadow-md"
                  }`}
                >
                  {tier.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full shadow">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                  <p className="text-sm text-slate-500 mt-1 mb-5">{tier.tagline}</p>

                  <div className="flex items-end gap-1 mb-1 h-12">
                    <span className="text-slate-500 text-lg mb-1">₹</span>
                    <span
                      key={`${tier.name}-${billing}`}
                      className="text-4xl font-bold text-slate-900 tracking-tight [animation:fadeUpPrice_.35s_ease-out]"
                    >
                      {price}
                    </span>
                    <span className="text-slate-500 text-sm mb-1.5">/mo</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    {billing === "yearly" ? "billed annually" : "billed monthly"}
                  </p>

                  <a
                    href="/login"
                    className={`block text-center w-full py-2.5 rounded-lg text-sm font-semibold transition-colors mb-6 ${
                      tier.popular
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                        : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                    }`}
                  >
                    {tier.cta}
                  </a>

                  <ul className="space-y-2.5">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
