import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { MdEdit, MdDeleteOutline, MdOutlineCurrencyRupee } from "react-icons/md";
import { FaMoneyBillWave, FaUniversity } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  useGetAccountByIdQuery,
  useGetTransactionsQuery,
  useDeleteAccountMutation,
} from "../../features/account/accountApiSlice";
import { Badge } from "../UI/Badge";
import { Button } from "../UI/Button";
import { PageHeader } from "../UI/PageHeader";
import { FormSection } from "../UI/FormSection";
import { Table, type Column } from "../Table/Table";
import { AddAccountModal } from "./AccountModals";

const inr = (v: unknown) => `₹${Number(v || 0).toLocaleString("en-IN")}`;
const fmtDate = (v: any) => {
  if (!v) return "-";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "-" : format(d, "dd MMM yyyy");
};

const TYPE_LABEL: Record<string, string> = {
  IN: "Money In",
  OUT: "Money Out",
  TRANSFER_IN: "Transfer In",
  TRANSFER_OUT: "Transfer Out",
};

export const AccountDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);

  const { data, isLoading, isError } = useGetAccountByIdQuery(id || "", {
    skip: !id,
  });
  const { data: txnResp } = useGetTransactionsQuery(id || "", { skip: !id });
  const [deleteAccount, { isLoading: deleting }] = useDeleteAccountMutation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 secondary-font">
        Loading account…
      </div>
    );
  }
  if (isError || !data?.data) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500 secondary-font">
        Failed to fetch account.
      </div>
    );
  }

  const acc: any = data.data;
  const txns: any[] = txnResp?.data || [];

  const handleDelete = async () => {
    if (!window.confirm(`Delete account "${acc.name}"? Its transactions will be removed.`))
      return;
    try {
      await deleteAccount(acc.id).unwrap();
      toast.success("Account deleted");
      navigate("/cash-bank");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete account");
    }
  };

  const rows = txns.map((t) => {
    const credit = t.type === "IN" || t.type === "TRANSFER_IN";
    return {
      id: t.id,
      date: fmtDate(t.date),
      type: t.type,
      description:
        t.description ||
        (t.counterparty?.name
          ? `${t.type === "TRANSFER_IN" ? "From" : "To"} ${t.counterparty.name}`
          : "-"),
      signed: credit ? Number(t.amount) : -Number(t.amount),
    };
  });

  const columns: Column<(typeof rows)[number]>[] = [
    { header: "Date", accessor: "date" },
    {
      header: "Type",
      render: (_v, row) => {
        const credit = row.type === "IN" || row.type === "TRANSFER_IN";
        return (
          <Badge variant={credit ? "success" : "danger"}>
            {TYPE_LABEL[row.type] || row.type}
          </Badge>
        );
      },
    },
    { header: "Description", accessor: "description" },
    {
      header: "Amount",
      render: (_v, row) => (
        <div
          className={`text-right font-medium ${
            row.signed >= 0 ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {row.signed >= 0 ? "+" : "-"}
          {inr(Math.abs(row.signed))}
        </div>
      ),
    },
  ];

  return (
    <div className="secondary-font">
      <PageHeader
        title={acc.name}
        subtitle={acc.type === "CASH" ? "Cash account" : "Bank account"}
        onBack={() => navigate("/cash-bank")}
        actions={
          <>
            <Button variant="outline" size="sm" type="button" onClick={() => setEditOpen(true)}>
              <MdEdit /> Edit
            </Button>
            {!acc.isDefault && (
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="!text-red-600 !border-red-200 hover:!bg-red-50"
              >
                <MdDeleteOutline /> {deleting ? "Deleting…" : "Delete"}
              </Button>
            )}
          </>
        }
      />

      <div className="space-y-5 max-w-5xl">
        {/* Summary card */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-4 sm:p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-gray-200 flex items-center justify-center text-2xl text-primary">
              {acc.type === "CASH" ? <FaMoneyBillWave /> : <FaUniversity />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg primary-font text-gray-900 truncate">{acc.name}</h2>
                <Badge variant="info">{acc.type}</Badge>
              </div>
              {acc.bankName && (
                <p className="text-sm text-gray-500">{acc.bankName}</p>
              )}
            </div>
            <div className="ml-auto text-right">
              <span className="block text-xs light-font text-gray-500">Current Balance</span>
              <span className="flex items-center justify-end text-2xl primary-font text-primary">
                <MdOutlineCurrencyRupee className="text-xl" />
                {Number(acc.balance).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </section>

        {/* Bank details */}
        {acc.type === "BANK" && (
          <FormSection title="Bank Details" layout="plain">
            <div className="divide-y divide-gray-100">
              <Row label="Bank Name" value={acc.bankName} />
              <Row label="Account Number" value={acc.accountNumber} />
              <Row label="IFSC Code" value={acc.ifsc} />
              <Row label="UPI ID" value={acc.upiId} />
            </div>
          </FormSection>
        )}

        <FormSection title="Balance" layout="plain">
          <div className="divide-y divide-gray-100">
            <Row label="Opening Balance" value={inr(acc.openingBalance)} />
            <Row label="Current Balance" value={inr(acc.balance)} strong />
          </div>
        </FormSection>

        {/* Transactions */}
        <FormSection title="Transactions" layout="plain">
          <Table columns={columns} data={rows} emptyMessage="No transactions yet" />
        </FormSection>
      </div>

      {editOpen && (
        <AddAccountModal accountToEdit={acc} onClose={() => setEditOpen(false)} />
      )}
    </div>
  );
};

const Row = ({
  label,
  value,
  strong,
}: {
  label: string;
  value?: string | number | null;
  strong?: boolean;
}) => {
  const display = value !== undefined && value !== null && value !== "" ? String(value) : "-";
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
      <span className="text-gray-500 light-font shrink-0">{label}</span>
      <span
        className={`text-right ${
          strong ? "primary-font text-gray-900" : "secondary-font text-gray-800"
        }`}
      >
        {display}
      </span>
    </div>
  );
};

export default AccountDetailPage;
