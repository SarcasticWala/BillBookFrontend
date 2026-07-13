import React, { useState } from "react";
import { toast } from "react-toastify";
import { useCreateCategoryMutation } from "../../features/item/itemApiSlice";
import { Modal } from "./Modal";
import { Input } from "./Input";
import { Button } from "./Button";

interface Props {
  onClose: (createdId?: string) => void;
}

const CreateItemCategoryModal: React.FC<Props> = ({ onClose }) => {
  const [name, setName] = useState("");
  const [createCategory, { isLoading }] = useCreateCategoryMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      const response = await createCategory({ name: name.trim() }).unwrap();
      toast.success("Item category created successfully");
      // Return the new category's id so the caller can auto-select it.
      onClose(response?.data?.id);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create category");
    }
  };

  return (
    <Modal
      isOpen
      onClose={() => onClose()}
      title="Create Item Category"
      maxWidthClassName="max-w-sm"
      footer={
        <>
          <Button variant="outline" type="button" onClick={() => onClose()}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="create-item-category-form"
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add"}
          </Button>
        </>
      }
    >
      <form id="create-item-category-form" onSubmit={handleSubmit}>
        <Input
          label="Category Name"
          value={name}
          placeholder="Ex: Electronics"
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
      </form>
    </Modal>
  );
};

export default CreateItemCategoryModal;
