import { PartiesTable } from "../../../components/Parties/PartiesTable";
import { PartiesHeader } from "../../../components/Parties/PartiesHeader";
import { Card } from "../../../components/UI/Card";
import { useState } from "react";

export const Parties_Page = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="secondary-font space-y-6">
      <div>
        <h1 className="text-xl primary-font text-gray-900">Parties</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage your customers and suppliers
        </p>
      </div>

      <PartiesHeader
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <Card>
        <PartiesTable
          selectedCategories={selectedCategories}
          searchTerm={searchTerm}
        />
      </Card>
    </div>
  );
};
export default Parties_Page;
