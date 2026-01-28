
import { Dialog } from "@headlessui/react";
import { useState, useEffect, useMemo } from "react";
import { FaTimes, FaSearch, FaCheckSquare, FaRegSquare } from "react-icons/fa";

interface SerialSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  serialNumbers: string[];
  preSelected?: string[];
  selectedSerials: string[];
  onConfirm: (serials: string[]) => void;
}

export const SerialSelectorModal: React.FC<SerialSelectorModalProps> = ({
  isOpen,
  onClose,
  serialNumbers,
  preSelected = [],
  selectedSerials,
  onConfirm,
}) => {
  const [selected, setSelected] = useState<string[]>(selectedSerials || []);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelected(preSelected || []);
      setSearch("");
    }
  }, [isOpen]);

  const filteredSerials = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term
      ? serialNumbers.filter((serial) => serial.toLowerCase().includes(term))
      : serialNumbers;
  }, [search, serialNumbers]);

  const toggleSerial = (serial: string) => {
    setSelected((prev) =>
      prev.includes(serial)
        ? prev.filter((s) => s !== serial)
        : [...prev, serial]
    );
  };

  const handleSelectAll = () => {
    const allVisibleSelected = filteredSerials.every((s) =>
      selected.includes(s)
    );
    if (allVisibleSelected) {
      setSelected((prev) => prev.filter((s) => !filteredSerials.includes(s)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...filteredSerials])));
    }
  };

  const handleSave = () => {
    onConfirm(selected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-gray-200 p-6 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Select Serials
            </h2>
            <button
              className="text-gray-500 hover:text-gray-800 transition"
              onClick={onClose}
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Search + Select All */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search serial number..."
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg w-full text-sm focus:border-blue-400 focus:ring focus:ring-blue-100 outline-none"
              />
            </div>
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 flex items-center gap-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition"
            >
              {filteredSerials.every((s) => selected.includes(s)) ? (
                <>
                  <FaCheckSquare className="text-blue-600" /> Deselect All
                </>
              ) : (
                <>
                  <FaRegSquare className="text-gray-500" /> Select All
                </>
              )}
            </button>
          </div>

          {/* Serial List */}
          {filteredSerials.length === 0 ? (
            <p className="text-gray-500 text-sm">No serial numbers found</p>
          ) : (
            <ul className="max-h-80 overflow-auto border border-gray-200 rounded-lg divide-y divide-gray-200">
              {filteredSerials.map((serial, index) => {
                const isSelected = selected.includes(serial);
                return (
                  <li
                    key={serial}
                    className={`flex items-center p-2 text-sm cursor-pointer select-none ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-50 transition`}
                    onClick={() => toggleSerial(serial)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 pointer-events-none"
                    />
                    <span className="text-gray-700">{serial}</span>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 flex items-center gap-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm"
            >
              Save
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};