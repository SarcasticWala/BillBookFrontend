import { Routes, Route } from "react-router-dom";
import Godown from "../../../components/items/Godwon";
import Inventory from "../../../components/items/Inventory";

export const Items_page = () => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex-1 min-w-[200px]">
      <Routes>
        <Route path="inventory" element={<Inventory />} />
        <Route path="godown" element={<Godown />} />
        <Route path="" element={<h1 className="text-2xl font-bold">Select an Item option</h1>} />
      </Routes>
    </div>
  );
};

export default Items_page;
