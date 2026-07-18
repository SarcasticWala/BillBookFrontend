import { FaFileExcel, FaMoneyBillWave, FaCreditCard } from "react-icons/fa";
import { MdBarChart, MdSearch } from "react-icons/md";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CategorySelector } from "../Category/CategorySelector";
import { Button } from "../UI/Button";
import { Card } from "../UI/Card";
import {
  useGetCategoriesQuery,
  useBulkCreatePartiesMutation,
} from "../../features/party/partyApiSlice";
import CreateCategoryModal from '../UI/CreateCategoryModal';
import BulkUploadModal from "../UI/BulkUploadModal";

interface Props {
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  stats: { count: number; toCollect: number; toPay: number };
  statsLoading: boolean;
}

export const PartiesHeader: React.FC<Props> = ({
  selectedCategories,
  setSelectedCategories,
  searchTerm,
  setSearchTerm,
  stats,
  statsLoading,
}) => {
  const navigate = useNavigate();
  const { data: categoriesData } = useGetCategoriesQuery(undefined);
  const [bulkCreateParties] = useBulkCreatePartiesMutation();

  const categoryOptions = categoriesData?.data || [];

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const isLoading = statsLoading;
  const totalParties = stats.count;
  const toCollectTotal = stats.toCollect;
  const toPayTotal = stats.toPay;

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card interactive className="flex items-start gap-3.5 min-w-[200px]">
          <span className="shrink-0 h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center ring-1 ring-inset ring-blue-600/10">
            <MdBarChart className="text-xl" />
          </span>
          <div className="min-w-0">
            <p className="text-xs secondary-font text-gray-500 uppercase tracking-wide">All Parties</p>
            {isLoading ? (
              <div className="h-7 w-16 mt-1 shimmer rounded" />
            ) : (
              <p className="primary-font text-2xl text-gray-900 leading-tight mt-0.5">{totalParties}</p>
            )}
          </div>
        </Card>

        <Card interactive className="flex items-start gap-3.5 min-w-[200px]">
          <span className="shrink-0 h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-inset ring-emerald-600/10">
            <FaMoneyBillWave className="text-lg" />
          </span>
          <div className="min-w-0">
            <p className="text-xs secondary-font text-gray-500 uppercase tracking-wide">To Collect</p>
            {isLoading ? (
              <div className="h-7 w-20 mt-1 shimmer rounded" />
            ) : (
              <p className="primary-font text-2xl text-emerald-600 leading-tight mt-0.5">
                ₹{toCollectTotal.toLocaleString("en-IN")}
              </p>
            )}
          </div>
        </Card>

        <Card interactive className="flex items-start gap-3.5 min-w-[200px]">
          <span className="shrink-0 h-10 w-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center ring-1 ring-inset ring-red-600/10">
            <FaCreditCard className="text-lg" />
          </span>
          <div className="min-w-0">
            <p className="text-xs secondary-font text-gray-500 uppercase tracking-wide">To Pay</p>
            {isLoading ? (
              <div className="h-7 w-20 mt-1 shimmer rounded" />
            ) : (
              <p className="primary-font text-2xl text-red-600 leading-tight mt-0.5">
                ₹{toPayTotal.toLocaleString("en-IN")}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Filters + Actions */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="relative w-full sm:w-[260px]">
          <MdSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-gray-400" />
          <input
            type="text"
            name="parties-search"
            placeholder="Search parties by name or mobile…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-9"
          />
        </div>

        <CategorySelector
          value=""
          onChange={handleCategorySelect}
          options={categoryOptions}
          CreateModalComponent={CreateCategoryModal}
        />

        {/* Selected Categories Chips */}
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((id) => {
            const category = categoryOptions.find((c: any) => c.id === id);
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/15 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium"
              >
                {category?.name || category?.catagory || category?.label || "Unknown"}
                <button
                  onClick={() => handleCategoryRemove(id)}
                  aria-label="Remove filter"
                  className="inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-500 hover:bg-blue-100 hover:text-blue-800 transition-colors cursor-pointer"
                >
                  &times;
                </button>
              </span>
            );
          })}
        </div>

        <div className="w-full sm:w-auto sm:ml-auto flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setIsBulkModalOpen(true)}
            className="secondary-font cursor-pointer w-full sm:w-auto"
          >
            <FaFileExcel className="text-emerald-600" />
            Bulk Upload
          </Button>

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
            className="cursor-pointer primary-font w-full sm:w-auto"
          >
            Create Party
          </Button>
        </div>
      </div>
    </div>
  );
};
