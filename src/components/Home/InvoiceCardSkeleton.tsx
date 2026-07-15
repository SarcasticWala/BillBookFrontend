import React from "react";
import { Shimmer } from "../UI/Shimmer";

/** Skeleton matching the hero invoice card's shape (no layout shift on swap). */
const InvoiceCardSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 overflow-hidden">
    {/* header */}
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
      <div className="space-y-2">
        <Shimmer className="h-4 w-28 rounded" />
        <Shimmer className="h-3 w-20 rounded" />
      </div>
      <Shimmer className="h-6 w-14 rounded-full" />
    </div>

    {/* line items */}
    <div className="px-5 py-4 space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="space-y-2">
            <Shimmer className="h-3.5 w-36 rounded" />
            <Shimmer className="h-3 w-10 rounded" />
          </div>
          <Shimmer className="h-3.5 w-16 rounded" />
        </div>
      ))}
    </div>

    {/* totals */}
    <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 space-y-2.5">
      <div className="flex justify-between">
        <Shimmer className="h-3 w-16 rounded" />
        <Shimmer className="h-3 w-14 rounded" />
      </div>
      <div className="flex justify-between">
        <Shimmer className="h-3 w-28 rounded" />
        <Shimmer className="h-3 w-14 rounded" />
      </div>
      <div className="flex justify-between pt-1.5 border-t border-slate-200">
        <Shimmer className="h-4 w-12 rounded" />
        <Shimmer className="h-4 w-20 rounded" />
      </div>
    </div>
  </div>
);

export default InvoiceCardSkeleton;
