import React, { useState } from 'react';
import CreateCategory from '../../../../components/Category/CreateCategory';

const CreateCategoryPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  const handleAddCategory = (category: string) => {
    console.log("Category added:", category);

    setIsOpen(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Manage Categories</h1>

      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        + Create Category
      </button>

      <CreateCategory
        isOpen={isOpen}
        onClose={handleClose}
        onAddCategory={handleAddCategory}
      />
    </div>
  );
};

export default CreateCategoryPage;
