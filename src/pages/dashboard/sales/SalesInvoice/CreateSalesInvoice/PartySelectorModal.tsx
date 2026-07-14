import { Dialog } from "@headlessui/react";
import { useGetPartiesQuery } from "../../../../../features/party/partyApiSlice";
import { FaTimes } from "react-icons/fa";
import { useLocation } from "react-router-dom";

export const PartySelectorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect: (party: any) => void;
}> = ({ isOpen, onClose, onSelect }) => {
  const { data, isLoading, isError } = useGetPartiesQuery(undefined);
  const parties = data?.data || [];
  const location = useLocation();
  const pathname = location.pathname;

  // Tolerant field readers — the API returns the write shape (partyName/mobileNo/
  // billingAddressData), matching PartiesTable. Fall back to mapped read shapes too.
  const partyName = (p: any): string => p.partyName || p.name || "";
  const partyAddress = (p: any): string => {
    const a = p.billingAddressData || p.billingAddress || {};
    return [a.ad, a.city, a.st, a.pin].filter(Boolean).join(", ") || p.address || "";
  };

  const wantedType = pathname.includes("purchase") ? "SUPPLIER" : "CUSTOMER";
  const filteredParties = parties.filter((p: any) => p.partyType === wantedType);

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
          <ul className="max-h-60 overflow-auto">
            {isLoading && <li className="py-3 px-2 text-gray-500">Loading…</li>}
            {isError && (
              <li className="py-3 px-2 text-red-600">Failed to load parties.</li>
            )}
            {!isLoading && !isError && filteredParties.length === 0 && (
              <li className="py-3 px-2 text-gray-500">
                No {wantedType === "SUPPLIER" ? "suppliers" : "customers"} found.
                Create one from the Parties page first.
              </li>
            )}
            {filteredParties.map((party: any) => (
              <li
                key={party.id}
                className="cursor-pointer py-3 px-2 hover:bg-blue-50 border-b"
                onClick={() => {
                  onSelect(party);
                  onClose();
                }}
              >
                <div className="font-medium">{partyName(party)}</div>
                <div className="text-xs text-gray-600">{partyAddress(party)}</div>
              </li>
            ))}
          </ul>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
