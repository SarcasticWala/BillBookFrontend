import React, { useState } from "react";
import { toast } from "react-toastify";
import { useCreateCategoryMutation } from "../../features/party/partyApiSlice";
import { Modal } from "./Modal";
import { Input } from "./Input";
import { Button } from "./Button";

interface Props {
  onClose: (createdId?: string) => void;
}

const CreateCategoryModal: React.FC<Props> = ({ onClose }) => {
  const [name, setName] = useState("");
  const [createCategory, { isLoading }] = useCreateCategoryMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      const response = await createCategory({ catagory: name.trim() }).unwrap();
      toast.success("Category created successfully");
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
      title="Create New Category"
      maxWidthClassName="max-w-sm"
      footer={
        <>
          <Button variant="outline" type="button" onClick={() => onClose()}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="create-party-category-form"
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add"}
          </Button>
        </>
      }
    >
      <form id="create-party-category-form" onSubmit={handleSubmit}>
        <Input
          label="Category Name"
          value={name}
          placeholder="Ex: Wholesale"
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
      </form>
    </Modal>
  );
};

export default CreateCategoryModal;
