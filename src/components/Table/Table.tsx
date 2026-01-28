
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
    <div className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden secondary-font">
      <div className="overflow-x-auto max-h-[calc(100vh-300px)] ">
        <table className="w-full table-auto text-sm text-left text-black secondary-font">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-3 text-[0.9rem] text-gray-900 uppercase secondary-font ${
                    isInvoicePage ? "text-center" : ""
                  }`}
                  style={{ fontFamily: "Outfit, sans-serif", fontWeight: 500 }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 secondary-font">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-6 text-gray-400 secondary-font"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => rowClick?.(rowIndex, row)}
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 whitespace-nowrap secondary-font"
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