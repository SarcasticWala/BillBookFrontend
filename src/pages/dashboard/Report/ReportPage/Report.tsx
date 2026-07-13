import { useState } from "react";
import { FiFilter } from "react-icons/fi";
import { MdOutlineStar } from "react-icons/md";
import { Card } from "../../../../components/UI/Card";

const categories = ["Party", "Category", "Payment Collection", "Item", "Invoice Details", "Summary"];

const sections = [
  {
    title: "Favourite",
    icon: <MdOutlineStar className="text-yellow-500" />, 
    items: ["Balance Sheet", "GSTR-1 (Sales)", "Profit and Loss Report", "Sales Summary"],
  },
  {
    title: "GST",
    items: [
      "GSTR-2 (Purchase)",
      "GSTR-3B",
      "GST Purchase (With HSN)",
      "GST Sales (With HSN)",
      "HSN Wise Sales Summary",
      "TDS Payable",
      "TDS Receivable",
      "TCS Payable",
      "TCS Receivable",
    ],
  },
  {
    title: "Transaction",
    items: [
      "Audit Trail",
      "Bill Wise Profit",
      "Cash and Bank Report (All Payments)",
      "Daybook",
      "Expense Category Report",
      "Expense Transaction Report",
      "Purchase Summary",
    ],
  },
  {
    title: "Item",
    items: [
      "Item Report By Party",
      "Item Sales and Purchase Summary",
      "Low Stock Summary",
      "Rate List",
      "Stock Detail Report",
      "Stock Summary",
    ],
  },
  {
    title: "Party",
    items: [
      "Receivable Aging Report",
      "Party Report (By Item)",
      "Party Statement (Ledger)",
      "Party Wise Outstanding",
      "Sales Summary - Category Wise",
    ],
  },
];

const ReportPage = () => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  const toggleExpand = (title: string) => {
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen secondary-font">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl primary-font text-gray-900">Reports</h1>
        <p className="text-sm light-font text-gray-500 mt-1">
          Browse and generate detailed business reports
        </p>
      </div>

      {/* Filter Tags */}
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <span className="text-sm secondary-font text-gray-600 flex items-center gap-1.5">
          <FiFilter /> Filter By
        </span>
        {categories.map((cat) => (
          <span
            key={cat}
            className="px-3 py-1 border border-gray-200 rounded-full text-sm text-gray-700 bg-white hover:border-primary hover:text-primary transition-colors cursor-pointer"
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Grid Layout for Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {sections.map((section) => {
          const expanded = expandedSections[section.title] || false;
          const visibleItems = expanded ? section.items : section.items.slice(0, 5);

          return (
            <Card key={section.title} className="p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 primary-font text-gray-800">
                  {section.icon}
                  {section.title}
                </div>
                {section.items.length > 5 && (
                  <button
                    onClick={() => toggleExpand(section.title)}
                    className="text-xs text-primary secondary-font hover:underline"
                  >
                    {expanded ? "See less ↑" : "See more ↓"}
                  </button>
                )}
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                {visibleItems.map((item, idx) => (
                  <li
                    key={idx}
                    className="px-2 py-1.5 -mx-2 rounded-md hover:bg-primary/5 hover:text-primary cursor-pointer transition-colors"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ReportPage;
