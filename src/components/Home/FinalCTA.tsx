import React from "react";
import { Reveal } from "../UI/Reveal";

const FinalCTA: React.FC = () => {
  return (
    <section className="w-full py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-600 px-6 py-14 sm:px-16 sm:py-20 text-center">
            {/* animated background blobs */}
            <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
              <div className="animate-blob absolute -top-16 -left-10 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
              <div className="animate-blob [animation-delay:4s] absolute -bottom-20 right-0 w-80 h-80 rounded-full bg-purple-400/20 blur-3xl" />
              <div className="animate-blob [animation-delay:8s] absolute top-10 right-1/3 w-56 h-56 rounded-full bg-indigo-300/20 blur-3xl" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Start billing the right way
            </h2>
            <p className="text-indigo-100 text-base sm:text-lg max-w-xl mx-auto mb-8">
              Join lakhs of Indian businesses creating GST-compliant invoices in seconds.
              No credit card required.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="/login"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-indigo-700 text-sm font-semibold shadow-lg hover:bg-indigo-50 transition-colors"
              >
                Start Free Billing
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-white/40 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                Book a demo
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default FinalCTA;
