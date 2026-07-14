import { useState } from "react";

interface CategoryOption {
  id: string;
  // The API returns categories with a `name` field; older/other shapes may use
  // `catagory` or `label`, so all are accepted.
  name?: string;
  catagory?: string;
  label?: string;
}

const optionLabel = (opt: CategoryOption): string =>
  opt.name || opt.catagory || opt.label || "";

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: CategoryOption[];
  CreateModalComponent: React.FC<{ onClose: (createdId?: string) => void }>;
  placeholder?: string;
  createLabel?: string;
  className?: string;
}

export const CategorySelector = ({
  value,
  onChange,
  options,
  CreateModalComponent,
  placeholder = "Select Category",
  createLabel = "+ Create New Category",
  className = "",
}: CategorySelectorProps) => {
  const [showModal, setShowModal] = useState(false);

  const handleCreateClose = (createdId?: string) => {
    setShowModal(false);
    if (createdId) {
      onChange(createdId);
    }
  };

  return (
    <div className={className}>
      <select
        value={value}
        onChange={(e) => {
          const selected = e.target.value;
          if (selected === "__create__") {
            e.target.value = ""; // reset visible selection
            setShowModal(true);
            return;
          }
          onChange(selected);
        }}
        className="input-field w-full"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {optionLabel(opt)}
          </option>
        ))}
        <option value="__create__" className="text-primary font-medium">
          {createLabel}
        </option>
      </select>

      {showModal && <CreateModalComponent onClose={handleCreateClose} />}
    </div>
  );
};
