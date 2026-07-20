import { Link } from "react-router-dom";
import { MdSettings } from "react-icons/md";
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
    <div className="pb-4 border-b border-slate-700/70">
      <Link
        to="/settings"
        onClick={onNavigate}
        title="Business settings"
        className="group flex items-center gap-3 rounded-lg p-2 -m-1 hover:bg-slate-700/70 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-yellow-500 ring-2 ring-slate-600/60 flex items-center justify-center text-slate-900 text-base font-bold overflow-hidden shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate leading-tight">{businessName}</p>
          {phone && <p className="text-xs text-slate-400 truncate">{phone}</p>}
        </div>
        <MdSettings
          className="text-xl text-slate-400 shrink-0 transition-all group-hover:text-white group-hover:rotate-45"
          aria-hidden="true"
        />
      </Link>
    </div>
  );
};

export default BusinessInfo;
