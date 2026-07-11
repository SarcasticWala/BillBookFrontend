import React, { useState } from "react";
import CreateItemCategoryModal from "../../../../components/UI/CreateItemCategoryModal";
import { Button } from "../../../../components/UI/Button";

const CreateCategoryPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-6">
      <h1 className="text-2xl primary-font mb-4">Manage Categories</h1>

      <Button variant="primary" onClick={() => setIsOpen(true)}>
        + Create Category
      </Button>

      {/* Uses the persisting category modal (calls the create-category API). */}
      {isOpen && <CreateItemCategoryModal onClose={() => setIsOpen(false)} />}
    </div>
  );
};

export default CreateCategoryPage;
