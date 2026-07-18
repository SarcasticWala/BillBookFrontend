import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo lockup */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-[0_4px_12px_-2px_rgba(79,70,229,0.5)] transition-transform group-hover:scale-105">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </span>
          <span className="primary-font text-xl sm:text-2xl leading-none tracking-tight">
            <span className="text-indigo-700">Bill</span>
            <span className="text-slate-900">Book</span>
          </span>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3 primary-font">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="hidden sm:inline-flex items-center px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Book a demo
          </button>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="inline-flex items-center justify-center rounded-[10px] bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-[0_1px_2px_rgba(79,70,229,0.3)] hover:bg-indigo-700 active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-1"
          >
            Login
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
