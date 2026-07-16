import { MdChevronLeft, MdChevronRight } from "react-icons/md";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

/**
 * Compact pager for server-paginated tables: "showing X–Y of Z" + prev/next
 * and a small window of page numbers. Hides itself when there's a single page.
 */
export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}) => {
  if (total === 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // A small window of page buttons around the current page.
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages: number[] = [];
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-2 border-t border-gray-100 secondary-font">
      <span className="text-xs text-gray-500">
        Showing <span className="text-gray-800">{from}</span>–
        <span className="text-gray-800">{to}</span> of{" "}
        <span className="text-gray-800">{total}</span>
      </span>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Previous page"
          >
            <MdChevronLeft />
          </button>

          {start > 1 && (
            <>
              <PageBtn p={1} active={page === 1} onClick={onPageChange} />
              {start > 2 && <span className="px-1 text-gray-400">…</span>}
            </>
          )}

          {pages.map((p) => (
            <PageBtn key={p} p={p} active={p === page} onClick={onPageChange} />
          ))}

          {end < totalPages && (
            <>
              {end < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
              <PageBtn p={totalPages} active={page === totalPages} onClick={onPageChange} />
            </>
          )}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Next page"
          >
            <MdChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

const PageBtn = ({
  p,
  active,
  onClick,
}: {
  p: number;
  active: boolean;
  onClick: (p: number) => void;
}) => (
  <button
    type="button"
    onClick={() => onClick(p)}
    className={`h-8 min-w-8 px-2 flex items-center justify-center rounded-md text-sm cursor-pointer transition-colors ${
      active
        ? "bg-primary text-white"
        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
    }`}
  >
    {p}
  </button>
);

export default Pagination;
