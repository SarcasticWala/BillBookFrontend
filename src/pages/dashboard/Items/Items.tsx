import { Routes, Route } from "react-router-dom";
import Godown from "../../../components/items/Godwon";
import Inventory from "../../../components/items/Inventory";

export const Items_page = () => {
  return (
    <div className="secondary-font bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex-1 min-w-[200px]">
      <Routes>
        <Route path="inventory" element={<Inventory />} />
        <Route path="godown" element={<Godown />} />
        <Route
          path=""
          element={
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <h1 className="text-xl primary-font text-gray-900">Select an Item option</h1>
              <p className="mt-1 text-sm light-font text-gray-500">
                Choose Inventory or Godown to get started.
              </p>
            </div>
          }
        />
      </Routes>
    </div>
  );
};

export default Items_page;
