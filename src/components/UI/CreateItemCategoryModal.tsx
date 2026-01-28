import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import { useCreateCategoryMutation } from "../../features/item/itemApiSlice";
interface Props {
  onClose: (createdId?: string) => void;
}

const CreateItemCategoryModal: React.FC<Props> = ({ onClose }) => {
  const [name, setName] = useState(""); 
  const [createCategory] = useCreateCategoryMutation();

  const handleSubmit = async () => {
    if (!name.trim()) return alert("Category name is required");
    try {
      const response = await createCategory({ catagory: name }).unwrap();
      toast.success("Item category created successfully");
      onClose(response.catagory); // return created category to parent
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#00000070] bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-md p-6 relative w-full max-w-sm">
        <IoClose
          className="absolute top-3 right-3 text-xl cursor-pointer"
          onClick={() => onClose()}
        />
        <h2 className="text-lg primary-font mb-4">Create Item Category</h2>
        <label className="input-label secondary-font mb-1">Category Name</label>
        <input
          type="text"
          value={name}
          placeholder="Ex: Electronics"
          onChange={(e) => setName(e.target.value)}
          className="input-field w-full mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onClose()}
            className="px-4 py-2 border border-gray-400 rounded"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 secondary-font text-white rounded"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateItemCategoryModal;
