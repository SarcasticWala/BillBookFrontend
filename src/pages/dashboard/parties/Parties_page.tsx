
import { PartiesTable } from "../../../components/Parties/PartiesTable";
import { PartiesHeader } from "../../../components/Parties/PartiesHeader";
import { useState } from "react";

export const Parties_Page = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  return (
 <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex-1 min-w-[200px] ">
      <h1 className="text-xl primary-font text-gray-800 mb-6"
      >Parties</h1>
      <PartiesHeader
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />

      <PartiesTable selectedCategories={selectedCategories} />
    </div>
  );
};
export default Parties_Page;
