import React from "react";
import Navbar from "../Home/Navbar";
import LandingFooter from "../Home/LandingFooter";
import { DotBackground } from "../UI/DotBackground";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated?: string;
  subtitle?: string;
  children: React.ReactNode;
}

/** Shared shell for public legal/informational pages — same chrome as Home. */
export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  title,
  lastUpdated,
  subtitle,
  children,
}) => {
  return (
    <div className="relative isolate min-h-screen w-full overflow-x-clip bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      <DotBackground className="-z-10" />
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <h1 className="primary-font text-3xl sm:text-4xl text-slate-900 tracking-tight">
            {title}
          </h1>
          {lastUpdated && (
            <p className="text-sm text-slate-500 mt-2">Last updated: {lastUpdated}</p>
          )}
          {subtitle && (
            <p className="text-base text-slate-500 mt-3 max-w-xl">{subtitle}</p>
          )}
          <div className="mt-10 space-y-8 secondary-font text-slate-600 leading-relaxed">
            {children}
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
};

export const LegalSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section>
    <h2 className="primary-font text-lg text-slate-900 mb-2">{title}</h2>
    <div className="space-y-3 text-sm">{children}</div>
  </section>
);

export default LegalPageLayout;
