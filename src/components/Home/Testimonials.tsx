import React from "react";
import { Reveal } from "../UI/Reveal";

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Retailer · Jaipur",
    initials: "RK",
    quote:
      "Switched from paper bills to BillBook and my GST filing is now a 10-minute job. IRN and e-way bills generate automatically.",
  },
  {
    name: "Priya Nair",
    role: "Distributor · Kochi",
    initials: "PN",
    quote:
      "Managing stock across three godowns used to be chaos. Real-time inventory and multi-branch billing keep everything in one place.",
  },
  {
    name: "Amit Shah",
    role: "Chartered Accountant · Ahmedabad",
    initials: "AS",
    quote:
      "I handle 40+ clients. HSN-wise reports and clean GSTR exports save me hours every month. My clients love the invoice format too.",
  },
];

const avatarColors = [
  "bg-indigo-100 text-indigo-700",
  "bg-purple-100 text-purple-700",
  "bg-violet-100 text-violet-700",
];

const Testimonials: React.FC = () => {
  return (
    <section className="w-full py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            Loved by businesses across India
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Don't just take our word for it
          </h2>
          <p className="text-slate-600">
            Retailers, distributors, and accountants run their billing on BillBook every day.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 120}>
              <figure className="h-full rounded-2xl border border-slate-200 bg-white p-6 hover:border-indigo-200 hover:shadow-md transition-all">
                <svg className="w-8 h-8 text-indigo-200 mb-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7.17 6A5.17 5.17 0 002 11.17V18h6.83v-6.83H5.5A2.5 2.5 0 018 8.67V6H7.17zm9 0A5.17 5.17 0 0011 11.17V18h6.83v-6.83H14.5A2.5 2.5 0 0117 8.67V6h-.83z" />
                </svg>
                <blockquote className="text-sm text-slate-600 leading-relaxed mb-6">
                  "{t.quote}"
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <span
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${avatarColors[i % avatarColors.length]}`}
                  >
                    {t.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">{t.name}</span>
                    <span className="block text-xs text-slate-500">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
