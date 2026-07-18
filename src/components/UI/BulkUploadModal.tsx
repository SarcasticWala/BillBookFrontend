import { useState } from "react";
import { FaFileExcel } from "react-icons/fa";
import { toast } from "react-toastify";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (formData: FormData) => Promise<any>;
  sampleFileName: string;
  title: string;
  description: string;
}

const BulkUploadModal = ({
  isOpen,
  onClose,
  onUpload,
  sampleFileName,
  title,
  description,
}: BulkUploadModalProps) => {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.name.endsWith(".xls") || file.name.endsWith(".xlsx"))) {
      setExcelFile(file);
    } else {
      alert("Please upload a valid Excel file (.xls or .xlsx)");
      e.target.value = "";
    }
  };

  const handleDownloadSample = () => {
    const sampleUrl = `/${sampleFileName}.xlsx`;
    const link = document.createElement("a");
    link.href = sampleUrl;
    link.download = `${sampleFileName}.xlsx`;
    link.click();
  };

  const handleUpload = async () => {
    if (!excelFile) return;

    const formData = new FormData();
    formData.append("file", excelFile);

    try {
      setIsUploading(true);
      const res = await onUpload(formData);
      toast.success(res.message || `${title} uploaded successfully`);
      onClose();
    } catch (err: any) {
      if (err?.file?.data instanceof ArrayBuffer) {
        const blob = new Blob([err.file.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${sampleFileName}-upload-errors.xlsx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.error(err.message || "Some rows had validation errors");
      } else {
        toast.error("Something went wrong during upload");
        console.error("Upload Error:", err);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm animate-overlay-in z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[var(--shadow-overlay)] animate-modal-in w-full max-w-lg p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto mx-auto">
        <button
          className="absolute top-2 right-2 sm:top-3 sm:right-4 text-gray-600 text-2xl leading-none hover:text-gray-900 flex items-center justify-center h-10 w-10"
          onClick={onClose}
        >
          &times;
        </button>

        <div className="flex items-center gap-3 mb-4 pr-8">
          <FaFileExcel className="text-green-600 text-2xl shrink-0" />
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Excel File
            </label>
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:border file:rounded-md file:text-sm file:bg-green-50 file:text-green-700"
            />
            {excelFile && (
              <p className="text-sm text-gray-500 mt-1">
                Selected: {excelFile.name}
              </p>
            )}
          </div>

          <button
            onClick={handleDownloadSample}
            className="inline-block text-blue-600 text-sm underline hover:text-blue-800 py-2"
          >
            Download Sample File
          </button>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 text-sm border rounded text-gray-600 hover:bg-gray-100"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={!excelFile || isUploading}
            >
              {isUploading ? "Uploading..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
