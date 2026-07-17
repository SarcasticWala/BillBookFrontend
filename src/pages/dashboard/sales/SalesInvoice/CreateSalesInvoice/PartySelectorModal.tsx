import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { useGetPartiesPagedQuery } from "../../../../../features/party/partyApiSlice";
import { FaTimes, FaSearch } from "react-icons/fa";
import { useDebouncedValue } from "../../../../../hooks/useDebouncedValue";

export const PartySelectorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect: (party: any) => void;
}> = ({ isOpen, onClose, onSelect }) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  // Server-side search + pagination so a party beyond the first page is still
  // findable (previously the picker only saw a capped client-side list).
  const { data, isLoading, isError } = useGetPartiesPagedQuery({
    page: 1,
    limit: 30,
    search: debouncedSearch,
  });
  const parties = data?.data?.items || [];

  // Tolerant field readers — API returns the write shape (partyName/mobileNo/
  // billingAddressData).
  const partyName = (p: any): string => p.partyName || p.name || "";
  const partyAddress = (p: any): string => {
    const a = p.billingAddressData || p.billingAddress || {};
    return [a.ad, a.city, a.st, a.pin].filter(Boolean).join(", ") || p.address || "";
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0">
      <div className="fixed inset-0 bg-black/40" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white max-w-md w-full rounded shadow-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Select Party</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex items-center justify-center min-h-[44px] min-w-[44px] -mr-2 text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              <FaTimes />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search by name or mobile…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg pl-10 pr-3 py-2 text-sm outline-none"
            />
          </div>

          <ul className="max-h-72 overflow-auto">
            {isLoading && <li className="py-3 px-2 text-gray-500">Loading…</li>}
            {isError && (
              <li className="py-3 px-2 text-red-600">Failed to load parties.</li>
            )}
            {!isLoading && !isError && parties.length === 0 && (
              <li className="py-3 px-2 text-gray-500">
                {debouncedSearch
                  ? "No parties match your search."
                  : "No parties found. Create one from the Parties page first."}
              </li>
            )}
            {parties.map((party: any) => (
              <li
                key={party.id}
                className="cursor-pointer py-3 px-2 hover:bg-blue-50 border-b"
                onClick={() => {
                  onSelect(party);
                  onClose();
                }}
              >
                <div className="font-medium">{partyName(party)}</div>
                <div className="text-xs text-gray-600">
                  {party.mobileNo || party.mobileNumber
                    ? `${party.mobileNo || party.mobileNumber} · `
                    : ""}
                  {partyAddress(party)}
                </div>
              </li>
            ))}
          </ul>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
