import { FaFileExcel, FaMoneyBillWave, FaCreditCard } from "react-icons/fa";
import { MdBarChart } from "react-icons/md";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CategorySelector } from "../Category/CategorySelector";
import { Button } from "../UI/Button";
import {
  useGetCategoriesQuery,
  useGetPartiesQuery,
  useBulkCreatePartiesMutation,
} from "../../features/party/partyApiSlice";
import CreateCategoryModal from '../UI/CreateCategoryModal';
import BulkUploadModal from "../UI/BulkUploadModal";

interface Props {
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

export const PartiesHeader: React.FC<Props> = ({
  selectedCategories,
  setSelectedCategories,
}) => {
  const navigate = useNavigate();
  const { data: partiesDataRaw, isLoading } = useGetPartiesQuery(undefined);
  const { data: categoriesData } = useGetCategoriesQuery(undefined);
  const [bulkCreateParties] = useBulkCreatePartiesMutation();

  const partiesData = partiesDataRaw?.data || [];
  const categoryOptions = categoriesData?.data || [];

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const totalParties = partiesData.length;
  const toCollectTotal = partiesData
    .filter((p: any) => p.openingBalanceType === "TO_COLLECT")
    .reduce((acc: number, curr: any) => acc + curr.openingBalance, 0);

  const toPayTotal = partiesData
    .filter((p: any) => p.openingBalanceType === "TO_PAY")
    .reduce((acc: number, curr: any) => acc + curr.openingBalance, 0);

  const handleCategorySelect = (val: string) => {
    if (!selectedCategories.includes(val)) {
      setSelectedCategories([...selectedCategories, val]);
    }
  };

  const handleCategoryRemove = (id: string) => {
    setSelectedCategories(selectedCategories.filter((cid) => cid !== id));
  };

  const handleCreateParty = () => {
    navigate("/parties/create-party");
  };

  const handleBulkUpload = async (formData: FormData) => {
    const res = await bulkCreateParties(formData).unwrap();
    return res;
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      {/*************************** IT WILL USE LATER *************************************/}

      {/* <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex gap-3 ml-auto">
          <Button
            variant="outline"
            className="flex items-center secondary-font gap-2 justify-center w-full sm:w-auto cursor-pointer"
          >
            <FiDownload className="text-gray-500 " /> Reports
          </Button>
          <Button
            variant="outline"
            className="flex items-center secondary-font gap-2 justify-center w-full sm:w-auto cursor-pointer"
          >
            <FiSettings className="text-gray-500" /> Settings
          </Button>
          <Button
            variant="outline"
            className="flex items-center secondary-font gap-2 justify-center w-full sm:w-auto cursor-pointer"
          >
            <MdOutlineMoreVert className="text-gray-500" /> More
          </Button>
        </div>
      </div> */}
      <div className="flex flex-wrap gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex-1 min-w-[200px] cursor-pointer transition-all duration-200 hover:border-blue-500">
          <div className="flex items-center secondary-fon  gap-1 text-blue-400 mb-1">
            <MdBarChart className="text-base" />
            <p className="text-sm secondary-font">All Parties</p>
          </div>
          {isLoading ? (
            <div className="h-6 w-16 bg-gray-200 animate-pulse rounded" />
          ) : (
            <p className="text-black secondary-font text-lg ml-[2px]">
              {totalParties}
            </p>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex-1 min-w-[200px] cursor-pointer transition-all duration-200 hover:border-green-500">
          <div className="flex items-center secondary-font gap-1 text-emerald-500 mb-1">
            <FaMoneyBillWave className="text-base" />
            <p className="text-sm secondary-font">To Collect</p>
          </div>
          {isLoading ? (
            <div className="h-6 w-16 bg-gray-200 animate-pulse rounded" />
          ) : (
            <p className="text-black secondary-font text-lg ml-[2px]">
              ₹{toCollectTotal.toLocaleString("en-IN")}
            </p>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex-1 min-w-[200px] cursor-pointer transition-all duration-200 hover:border-red-500">
          <div className="flex items-center secondary-font gap-1 text-red-500 mb-1">
            <FaCreditCard className="text-base" />
            <p className="text-sm secondary-font">To Pay</p>
          </div>
          {isLoading ? (
            <div className="h-6 w-16 bg-gray-200 animate-pulse rounded" />
          ) : (
            <p className="text-black secondary-font text-lg ml-[2px]">
              ₹{toPayTotal.toLocaleString("en-IN")}
            </p>
          )}
        </div>
      </div>

      {/* Filters + Actions */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <input
          type="text"
          name="parties-search"
          placeholder="Search Party"
          className="w-full sm:w-[200px] px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <CategorySelector
          value=""
          onChange={handleCategorySelect}
          options={categoryOptions}
          CreateModalComponent={CreateCategoryModal}
        />

        {/* Selected Categories Chips */}
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedCategories.map((id) => {
            const category = categoryOptions.find((c: any) => c.id === id);
            return (
              <span
                key={id}
                className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
              >
                {category?.catagory || "Unknown"}
                <button
                  onClick={() => handleCategoryRemove(id)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  &times;
                </button>
              </span>
            );
          })}
        </div>

        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-700 shadow-sm hover:bg-gray-100 flex gap-1 items-center"
          >
            <FaFileExcel />
            <span className="cursor-pointer light-font">Bulk Upload</span>
          </button>

          <BulkUploadModal
            isOpen={isBulkModalOpen}
            onClose={() => setIsBulkModalOpen(false)}
            onUpload={handleBulkUpload}
            sampleFileName="bulk_party"
            title="Bulk Add Parties"
            description="Upload parties in bulk using an Excel sheet"
          />

          <Button
            variant="primary"
            onClick={handleCreateParty}
            className="cursor-pointer primary-font"
          >
            Create Party
          </Button>
        </div>
      </div>
    </div>
  );
};
