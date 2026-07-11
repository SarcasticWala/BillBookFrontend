
import { PartiesTable } from "../../../components/Parties/PartiesTable";
import { PartiesHeader } from "../../../components/Parties/PartiesHeader";
import { useState } from "react";

export const Parties_Page = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  return (
 <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex-1 min-w-[200px] ">
      <h1 className="text-2xl primary-font text-gray-800 mb-6"
      >Parties</h1>
      <PartiesHeader
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <PartiesTable
        selectedCategories={selectedCategories}
        searchTerm={searchTerm}
      />
    </div>
  );
};
export default Parties_Page;
