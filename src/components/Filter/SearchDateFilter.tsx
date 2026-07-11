import React from 'react';
import { FiSearch, FiCalendar } from 'react-icons/fi';

interface SearchDateFilterProps {
  filterValue: string;
  onFilterChange: (value: string) => void;
  placeholder?: string;
  /** Optional controlled search text. When provided, the search input is wired. */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export const SearchDateFilter: React.FC<SearchDateFilterProps> = ({
  filterValue,
  onFilterChange,
  placeholder = 'Search',
  searchValue,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full light-font">
      {/* Search Input */}
      <div className="relative w-full sm:w-auto flex-1">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          name="search"
          placeholder={placeholder}
          value={searchValue ?? ''}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Date Filter */}
      <div className="relative w-full sm:w-auto flex-1">
        <FiCalendar className="absolute left-3 top-3 text-gray-400" />
        <select
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
        >
          <option>Today</option>
          <option>Yesterday</option>
          <option>This Week</option>
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 365 Days</option>
        </select>
      </div>
    </div>
  );
};
