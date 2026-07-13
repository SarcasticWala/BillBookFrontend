import React, { useState } from "react";
import CreateItemCategoryModal from "../../../../components/UI/CreateItemCategoryModal";
import { Button } from "../../../../components/UI/Button";
import { Card } from "../../../../components/UI/Card";

const CreateCategoryPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="secondary-font p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg sm:text-xl primary-font text-gray-900">Manage Categories</h1>
          <p className="text-sm light-font text-gray-500 mt-1">
            Organize your items into categories for easier billing.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsOpen(true)} className="w-full sm:w-auto">
          + Create Category
        </Button>
      </div>

      <Card className="p-6 sm:p-8 text-center">
        <p className="text-sm secondary-font text-gray-700">
          Create a category to group your items.
        </p>
        <p className="text-sm light-font text-gray-500 mt-1">
          Use the button above to add a new item category.
        </p>
      </Card>

      {/* Uses the persisting category modal (calls the create-category API). */}
      {isOpen && <CreateItemCategoryModal onClose={() => setIsOpen(false)} />}
    </div>
  );
};

export default CreateCategoryPage;
