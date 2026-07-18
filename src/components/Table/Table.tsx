
import React from "react";
import { useLocation } from "react-router-dom";

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (value: any, row: T, rowIndex: number) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: React.ReactNode;
  rowClick?: (index: number, row: T) => void;
}

export function Table<T>({
  columns,
  data,
  emptyMessage = "No data found",
  rowClick,
}: TableProps<T>) {
  const location = useLocation();

  const isInvoicePage =
    location.pathname.includes("purchase/create-invoice") ||
    location.pathname.includes("sales/create-invoice");

  return (
    <div className="mt-4 sm:mt-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden secondary-font">
      <div className="overflow-x-auto max-h-[calc(100vh-300px)] ">
        <table className="w-full table-auto text-sm text-left text-slate-700 secondary-font">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 sm:px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                    isInvoicePage ? "text-center" : ""
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100 secondary-font">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-10 text-gray-400 secondary-font"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-primary/5 cursor-pointer transition-colors focus-visible:bg-primary/5"
                  onClick={() => rowClick?.(rowIndex, row)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") rowClick?.(rowIndex, row);
                  }}
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-4 sm:px-6 py-3.5 whitespace-nowrap secondary-font text-slate-700"
                    >
                      {col.render
                        ? col.render(
                            col.accessor ? row[col.accessor] : null,
                            row,
                            rowIndex
                          )
                        : col.accessor
                          ? String(row[col.accessor])
                          : ""}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}