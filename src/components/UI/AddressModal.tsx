import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { useGetLocationsQuery } from "../../features/party/partyApiSlice";
import { Button } from "./Button";

interface AddressData {
  ad: string;
  st: string;
  city: string;
  pin: string;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: AddressData) => void;
  /** Existing address to prefill (edit mode / re-open). */
  initial?: AddressData | null;
}

interface CityDto {
  city: string;
  state: string;
}

interface StateDto {
  state: string;
}

const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initial,
}) => {
  const [street, setStreet] = useState("");
  const [state, setState] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [pincode, setPincode] = useState("");

  // Seed from the existing address each time the modal opens; clear otherwise
  // so stale billing values don't leak into the shipping form.
  useEffect(() => {
    if (isOpen) {
      setStreet(initial?.ad || "");
      setState(initial?.st || null);
      setCity(initial?.city || null);
      setPincode(initial?.pin || "");
    }
  }, [isOpen, initial]);

  const { data, isLoading } = useGetLocationsQuery(undefined, {
    skip: !isOpen,
  });

  const states: StateDto[] = data?.data?.states || [];
  const cities: CityDto[] = data?.data?.cities || [];

  const stateOptions = states.map((s) => ({
    value: s.state,
    label: s.state,
  }));

  const filteredCities = cities.filter((c) => c.state === state);
  const cityOptions = filteredCities.map((c) => ({
    value: c.city,
    label: c.city,
  }));

  const handleSave = () => {
    if (!street.trim()) {
      toast.error("Street address is required");
      return;
    }
    onSave({
      ad: street.trim(),
      st: state || "",
      city: city || "",
      pin: pincode,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#00000070] flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Enter Address</h2>
          <button
            onClick={onClose}
            className="text-xl font-bold text-gray-600 cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Street Address */}
          <div>
            <label className="input-label">
              Street Address <span className="text-red-500">*</span>
            </label>
            <textarea
              className="input-field w-full border px-3 py-2 rounded"
              placeholder="Enter street address"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
          </div>

          {/* State Dropdown */}
          <div>
            <label className="input-label">State</label>
            {isLoading ? (
              <div className="bg-gray-100 animate-pulse rounded px-3 py-2 h-[42px]" />
            ) : (
              <Select
                options={stateOptions}
                value={stateOptions.find((opt) => opt.value === state)}
                onChange={(selected) => {
                  setState(selected?.value || null);
                  setCity(null); // reset city when state changes
                }}
                placeholder="Select a state"
                isClearable
              />
            )}
          </div>

          {/* City Dropdown */}
          <div>
            <label className="input-label">City</label>
            {isLoading || !state ? (
              <div className="bg-gray-100 animate-pulse rounded px-3 py-2 h-[42px]" />
            ) : (
              <Select
                options={cityOptions}
                value={cityOptions.find((opt) => opt.value === city)}
                onChange={(selected) => setCity(selected?.value || null)}
                placeholder="Select a city"
                isClearable
              />
            )}
          </div>

          {/* Pincode */}
          <div>
            <label className="input-label">Pincode</label>
            <input
              className="input-field w-full border px-3 py-2 rounded"
              placeholder="Enter pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              maxLength={6}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
