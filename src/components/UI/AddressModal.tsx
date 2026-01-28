import React, { useState } from "react";
import Select from "react-select";
import { useGetLocationsQuery } from "../../features/party/partyApiSlice";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: {
    ad: string;
    st: string;
    city: string;
    pin: string;
  }) => void;
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
}) => {
  const [street, setStreet] = useState("");
  const [state, setState] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [pincode, setPincode] = useState("");

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
    onSave({
      ad: street,
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
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
