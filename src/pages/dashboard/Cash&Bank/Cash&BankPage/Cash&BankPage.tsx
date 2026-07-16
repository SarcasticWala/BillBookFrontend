import { useState } from "react";
import { FiPlus, FiRepeat } from "react-icons/fi";
import {
  MdOutlineAccountBalanceWallet,
  MdOutlineCurrencyRupee,
  MdDeleteOutline,
} from "react-icons/md";
import { FaUniversity, FaMoneyBillWave } from "react-icons/fa";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Button } from "../../../../components/UI/Button";
import { Card } from "../../../../components/UI/Card";
import { Badge } from "../../../../components/UI/Badge";
import { Table, type Column } from "../../../../components/Table/Table";
import { SearchDateFilter } from "../../../../components/Filter/SearchDateFilter";
import {
  useGetAccountsQuery,
  useGetTransactionsQuery,
  useDeleteAccountMutation,
} from "../../../../features/account/accountApiSlice";
import {
  AddAccountModal,
  MoneyModal,
  TransferModal,
} from "../../../../components/accounting/AccountModals";

const inr = (v: unknown) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

type TxnRow = {
  id: string;
  date: string;
  accountName: string;
  type: string;
  description: string;
  signedAmount: number;
};

const TYPE_LABEL: Record<string, string> = {
  IN: "Money In",
  OUT: "Money Out",
  TRANSFER_IN: "Transfer In",
  TRANSFER_OUT: "Transfer Out",
};

const CashAndBankPage = () => {
  const [filter, setFilter] = useState("Last 365 Days");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showMoney, setShowMoney] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  const { data: accountsResp, isLoading: accountsLoading } = useGetAccountsQuery(undefined);
  const accounts: any[] = accountsResp?.data || [];

  const { data: txnResp, isLoading: txnLoading } = useGetTransactionsQuery(
    selectedAccountId || undefined
  );
  const txns: any[] = txnResp?.data || [];

  const [deleteAccount] = useDeleteAccountMutation();

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);
  const cashBalance = accounts
    .filter((a) => a.type === "CASH")
    .reduce((sum, a) => sum + Number(a.balance || 0), 0);

  const canTransfer = accounts.length >= 2;

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete account "${name}"? Its transactions will be removed.`))
      return;
    try {
      await deleteAccount(id).unwrap();
      toast.success("Account deleted");
      if (selectedAccountId === id) setSelectedAccountId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete account");
    }
  };

  const tableData: TxnRow[] = txns.map((t) => {
    const isCredit = t.type === "IN" || t.type === "TRANSFER_IN";
    return {
      id: t.id,
      date: t.date ? format(new Date(t.date), "dd MMM yyyy") : "-",
      accountName: t.account?.name || "-",
      type: t.type,
      description:
        t.description ||
        (t.counterparty?.name
          ? `${t.type === "TRANSFER_IN" ? "From" : "To"} ${t.counterparty.name}`
          : "-"),
      signedAmount: isCredit ? Number(t.amount) : -Number(t.amount),
    };
  });

  const columns: Column<TxnRow>[] = [
    { header: "Date", accessor: "date" },
    { header: "Account", accessor: "accountName" },
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
            row.signedAmount >= 0 ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {row.signedAmount >= 0 ? "+" : "-"}
          {inr(Math.abs(row.signedAmount))}
        </div>
      ),
    },
  ];

  return (
    <div className="secondary-font space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl primary-font text-gray-900">Cash &amp; Bank</h1>
        <div className="flex gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setShowMoney(true)}
            disabled={accountsLoading || accounts.length === 0}
          >
            <FiPlus /> Add/Reduce Money
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setShowTransfer(true)}
            disabled={!canTransfer}
            title={canTransfer ? "" : "Add another account to transfer money"}
          >
            <FiRepeat /> Transfer Money
          </Button>
          <Button
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setShowAddAccount(true)}
          >
            <FiPlus /> Add New Account
          </Button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Left Column — balances & accounts */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="space-y-3">
            <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 px-4 py-3">
              <div className="text-[13px] input-label mb-1">Total Balance</div>
              <div className="flex items-center gap-0.5 text-primary primary-font text-2xl">
                <MdOutlineCurrencyRupee className="text-xl" />
                {Number(totalBalance).toLocaleString("en-IN")}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Cash in hand: {inr(cashBalance)}
              </div>
            </div>

            {/* "All accounts" selector */}
            <button
              type="button"
              onClick={() => setSelectedAccountId(null)}
              className={`w-full text-left rounded-lg border px-4 py-3 transition-colors cursor-pointer ${
                selectedAccountId === null
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-primary"
              }`}
            >
              <span className="text-sm secondary-font text-gray-700">
                All Accounts
              </span>
            </button>

            {/* Account cards */}
            <div className="space-y-2">
              <span className="text-[13px] input-label">Accounts</span>
              {accountsLoading ? (
                <p className="text-sm text-gray-400 py-2">Loading accounts…</p>
              ) : (
                accounts.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAccountId(a.id)}
                    className={`group rounded-lg border px-3 py-2.5 flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                      selectedAccountId === a.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-gray-400 shrink-0">
                        {a.type === "CASH" ? <FaMoneyBillWave /> : <FaUniversity />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-800 truncate">{a.name}</p>
                        {a.bankName && (
                          <p className="text-xs text-gray-400 truncate">{a.bankName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-sm primary-font text-gray-900">
                        {inr(a.balance)}
                      </span>
                      {!a.isDefault && (
                        <button
                          type="button"
                          aria-label="Delete account"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(a.id, a.name);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity"
                        >
                          <MdDeleteOutline />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Panel — transactions */}
        <Card className="lg:col-span-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-gray-200 pb-3">
            <div className="text-sm primary-font text-primary border-b-2 border-primary -mb-3 pb-3">
              {selectedAccountId
                ? `${accounts.find((a) => a.id === selectedAccountId)?.name || ""} · Transactions`
                : "All Transactions"}
            </div>
            <div className="w-full lg:w-1/2">
              <SearchDateFilter
                filterValue={filter}
                onFilterChange={setFilter}
                placeholder="Search transactions"
              />
            </div>
          </div>

          {txnLoading ? (
            <p className="text-center text-gray-400 py-12 text-sm">Loading transactions…</p>
          ) : tableData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center text-gray-500">
              <MdOutlineAccountBalanceWallet className="text-5xl sm:text-6xl text-gray-300 mb-4" />
              <h2 className="text-lg primary-font text-gray-700 mb-1">No Transactions</h2>
              <p className="text-sm text-gray-400">
                Add or transfer money to see transactions here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table columns={columns} data={tableData} />
            </div>
          )}
        </Card>
      </div>

      {/* Modals */}
      {showAddAccount && <AddAccountModal onClose={() => setShowAddAccount(false)} />}
      {showMoney && (
        <MoneyModal
          accounts={accounts}
          defaultAccountId={selectedAccountId || undefined}
          onClose={() => setShowMoney(false)}
        />
      )}
      {showTransfer && (
        <TransferModal accounts={accounts} onClose={() => setShowTransfer(false)} />
      )}
    </div>
  );
};

export default CashAndBankPage;
