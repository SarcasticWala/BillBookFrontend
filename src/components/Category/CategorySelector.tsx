import { useState } from "react";

interface CategoryOption {
  id: string;
  catagory: string;
}

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
        className="input-field w-full border px-3 py-2 rounded"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.catagory}
          </option>
        ))}
        <option
          value="__create__"
          className="text-blue-600 font-medium"
          style={{
            borderTop: "1px dotted #ccc",
            marginTop: "4px",
            paddingTop: "8px",
          }}
        >
          {createLabel}
        </option>
      </select>

      {showModal && <CreateModalComponent onClose={handleCreateClose} />}
    </div>
  );
};
