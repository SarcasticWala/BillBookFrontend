import { Link } from "react-router-dom";
import { useGetMeQuery } from "../../features/auth/authApiSlice";

interface BusinessInfoProps {
  /** Called when the block is clicked (e.g. to mark active / close mobile nav). */
  onNavigate?: () => void;
}

/** Sidebar account header — shows the logged-in business profile and links to Settings. */
const BusinessInfo: React.FC<BusinessInfoProps> = ({ onNavigate }) => {
  const { data: meData } = useGetMeQuery();
  const user = meData?.data;

  const businessName =
    user?.businessName?.trim() || user?.name?.trim() || "Business Name";
  const phone = user?.phone || "";
  const initial = businessName.charAt(0).toUpperCase() || "B";
  const logoUrl = user?.logoUrl || "";

  return (
    <div className="pb-4 border-b border-slate-700">
      <Link
        to="/settings"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-lg p-1 -m-1 hover:bg-slate-700 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-slate-800 text-lg font-bold overflow-hidden shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{businessName}</p>
          {phone && <p className="text-xs text-gray-400">{phone}</p>}
        </div>
      </Link>
    </div>
  );
};

export default BusinessInfo;
