import { Shimmer } from "../UI/Shimmer";

/**
 * Content-area placeholder shown while a dashboard route's lazy chunk is in
 * flight. Deliberately generic — it stands in for any page, so it sketches the
 * shape most of them share (title, subtitle, stat row, table) rather than
 * trying to match one exactly.
 */
export const PageSkeleton = () => (
  <div className="space-y-4 pt-1" aria-busy="true" aria-label="Loading page">
    <Shimmer className="h-8 w-52 rounded-lg" />
    <Shimmer className="h-4 w-72 rounded" />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-3">
      <Shimmer className="h-28 rounded-xl" />
      <Shimmer className="h-28 rounded-xl" />
      <Shimmer className="h-28 rounded-xl" />
    </div>
    <Shimmer className="h-72 rounded-xl" />
  </div>
);

export default PageSkeleton;
