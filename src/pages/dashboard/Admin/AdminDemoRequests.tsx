import React from "react";
import { toast } from "react-toastify";
import { MdOutlineOndemandVideo } from "react-icons/md";
import { Table, type Column } from "../../../components/Table/Table";
import {
  useGetAllDemosQuery,
  useUpdateDemoStatusMutation,
} from "../../../features/demo/demoApiSlice";

const interestLabels: Record<string, string> = {
  BILLING: "Billing & Invoicing",
  INVENTORY: "Inventory Management",
  GST: "GST & E-Invoicing",
  REPORTS: "Reports & Analytics",
  OTHER: "Other",
};

const statusOptions = ["PENDING", "SCHEDULED", "COMPLETED", "CANCELLED"];

interface AdminDemoRow {
  id: string;
  name: string;
  mobileNo: string;
  interest: string;
  preferredDate: string;
  preferredTime: string;
  attendees: number;
  status: string;
  createdAt: string;
  user?: { name?: string; phone?: string; businessName?: string } | null;
}

const fmtDate = (v: string) =>
  v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const AdminDemoRequests: React.FC = () => {
  const { data, isLoading, isError, error } = useGetAllDemosQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateDemoStatusMutation();
  const demos: AdminDemoRow[] = data?.data ?? [];

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success("Status updated");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const columns: Column<AdminDemoRow>[] = [
    {
      header: "Requester",
      render: (_v, row) => (
        <div>
          <p className="font-medium text-gray-800">
            {row.user?.businessName?.trim() || row.user?.name?.trim() || row.name || "—"}
          </p>
          <p className="text-xs text-gray-500">{row.user?.phone || row.mobileNo || ""}</p>
        </div>
      ),
    },
    {
      header: "Contact",
      render: (_v, row) => (
        <div>
          <p className="text-gray-800">{row.name || "—"}</p>
          <p className="text-xs text-gray-500">{row.mobileNo || ""}</p>
        </div>
      ),
    },
    { header: "Interest", accessor: "interest", render: (v) => interestLabels[v] || v || "—" },
    {
      header: "Preferred",
      render: (_v, row) => (
        <div>
          <p className="text-gray-800">{row.preferredDate || "—"}</p>
          <p className="text-xs text-gray-500">{row.preferredTime || ""}</p>
        </div>
      ),
    },
    { header: "Attendees", accessor: "attendees", render: (v) => v ?? 1 },
    { header: "Requested On", accessor: "createdAt", render: (v) => fmtDate(v) },
    {
      header: "Status",
      render: (_v, row) => (
        <select
          value={row.status}
          disabled={isUpdating}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          className="input-field bg-white !py-1.5 text-xs w-36"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 secondary-font">
      <div className="flex items-center gap-3 mb-1">
        <span className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-primary text-xl">
          <MdOutlineOndemandVideo />
        </span>
        <h1 className="text-xl sm:text-2xl primary-font text-gray-800">Demo Requests</h1>
      </div>
      <p className="text-sm light-font text-gray-500 mb-2">
        All demo bookings across users. Change a request's status as your team schedules it.
      </p>

      {!isLoading && !isError && (
        <p className="text-sm text-gray-600 mb-2">
          Total: <span className="font-semibold">{demos.length}</span>
        </p>
      )}

      {isError ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {(error as any)?.status === 403
            ? "You don't have admin access to view this page."
            : "Failed to load demo requests."}
        </div>
      ) : (
        <Table
          columns={columns}
          data={demos}
          emptyMessage={isLoading ? "Loading demo requests..." : "No demo requests yet."}
        />
      )}
    </div>
  );
};

export default AdminDemoRequests;
