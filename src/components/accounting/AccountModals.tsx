import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { newIdempotencyKey } from "../../lib/idempotency";
import { Modal } from "../UI/Modal";
import { Input } from "../UI/Input";
import { Button } from "../UI/Button";
import {
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useAdjustMoneyMutation,
  useTransferMoneyMutation,
} from "../../features/account/accountApiSlice";

type Account = { id: string; name: string; type: string; balance: number };

/* ------------------------------------------------------------------ */
/* Add / Edit Account                                                 */
/* ------------------------------------------------------------------ */
export const AddAccountModal: React.FC<{
  onClose: () => void;
  /** When provided, the modal edits this account instead of creating one. */
  accountToEdit?: any;
}> = ({ onClose, accountToEdit }) => {
  const isEdit = !!accountToEdit;
  const [type, setType] = useState<"BANK" | "CASH">(
    accountToEdit?.type === "CASH" ? "CASH" : "BANK"
  );
  const [name, setName] = useState(accountToEdit?.name || "");
  const [openingBalance, setOpeningBalance] = useState(
    accountToEdit?.openingBalance != null ? String(accountToEdit.openingBalance) : ""
  );
  const [bankName, setBankName] = useState(accountToEdit?.bankName || "");
  const [accountNumber, setAccountNumber] = useState(
    accountToEdit?.accountNumber || ""
  );
  const [ifsc, setIfsc] = useState(accountToEdit?.ifsc || "");
  const [upiId, setUpiId] = useState(accountToEdit?.upiId || "");

  const [createAccount, { isLoading: creating }] = useCreateAccountMutation();
  const [updateAccount, { isLoading: updating }] = useUpdateAccountMutation();
  const isLoading = creating || updating;
  const idempotencyKey = useRef(newIdempotencyKey()).current;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Account name is required");
    if (Number.isNaN(Number(openingBalance || 0)))
      return toast.error("Opening balance must be a number");
    if (type === "BANK") {
      if (accountNumber && !/^\d{9,18}$/.test(accountNumber))
        return toast.error("Account number must be 9 to 18 digits");
      if (ifsc && !/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(ifsc))
        return toast.error("Enter a valid IFSC code, e.g. HDFC0001234");
    }
    const payload = {
      name: name.trim(),
      type,
      openingBalance: Number(openingBalance) || 0,
      bankName,
      accountNumber,
      ifsc,
      upiId,
    };
    try {
      if (isEdit) {
        await updateAccount({ id: accountToEdit.id, ...payload }).unwrap();
        toast.success("Account updated");
      } else {
        await createAccount({ ...payload, __idempotencyKey: idempotencyKey }).unwrap();
        toast.success("Account created");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || `Failed to ${isEdit ? "update" : "create"} account`);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? "Edit Account" : "Add New Account"}
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-account-form" disabled={isLoading}>
            {isLoading ? "Saving…" : isEdit ? "Update Account" : "Save Account"}
          </Button>
        </>
      }
    >
      <form id="add-account-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">Account Type</label>
          <div className="flex gap-2">
            {(["BANK", "CASH"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                  type === t
                    ? "border-primary bg-primary/5 text-primary font-medium"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t === "BANK" ? "Bank Account" : "Cash"}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Account Name"
          required
          placeholder={type === "BANK" ? "ex: HDFC Current A/c" : "ex: Petty Cash"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <Input
          label="Opening Balance"
          type="number"
          placeholder="0"
          value={openingBalance}
          onChange={(e) => setOpeningBalance(e.target.value)}
        />

        {type === "BANK" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Bank Name"
              placeholder="ex: HDFC Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
            <Input
              label="Account Number"
              placeholder="9–18 digits"
              inputMode="numeric"
              maxLength={18}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
            />
            <Input
              label="IFSC Code"
              placeholder="ex: HDFC0001234"
              maxLength={11}
              className="uppercase placeholder:normal-case"
              value={ifsc}
              onChange={(e) =>
                setIfsc(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
              }
            />
            <Input
              label="UPI ID"
              placeholder="name@bank"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          </div>
        )}
      </form>
    </Modal>
  );
};

/* ------------------------------------------------------------------ */
/* Add / Reduce Money                                                 */
/* ------------------------------------------------------------------ */
export const MoneyModal: React.FC<{
  accounts: Account[];
  defaultAccountId?: string;
  onClose: () => void;
}> = ({ accounts, defaultAccountId, onClose }) => {
  const [accountId, setAccountId] = useState(defaultAccountId || accounts[0]?.id || "");
  const [direction, setDirection] = useState<"IN" | "OUT">("IN");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const [adjustMoney, { isLoading }] = useAdjustMoneyMutation();

  useEffect(() => {
    if (defaultAccountId) setAccountId(defaultAccountId);
  }, [defaultAccountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return toast.error("Select an account");
    if (!(Number(amount) > 0)) return toast.error("Enter an amount greater than zero");
    const selectedAccount = accounts.find((a) => a.id === accountId);
    if (
      direction === "OUT" &&
      selectedAccount &&
      Number(amount) > Number(selectedAccount.balance)
    ) {
      return toast.error(
        `Amount exceeds available balance (₹${Number(
          selectedAccount.balance
        ).toLocaleString("en-IN")})`
      );
    }
    try {
      await adjustMoney({
        id: accountId,
        type: direction,
        amount: Number(amount),
        description,
        date: date || undefined,
      }).unwrap();
      toast.success(direction === "IN" ? "Money added" : "Money reduced");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update money");
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Add / Reduce Money"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="money-form" disabled={isLoading}>
            {isLoading ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <form id="money-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          {(["IN", "OUT"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDirection(d)}
              className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                direction === d
                  ? d === "IN"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-medium"
                    : "border-red-500 bg-red-50 text-red-700 font-medium"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {d === "IN" ? "Add Money" : "Reduce Money"}
            </button>
          ))}
        </div>

        <div>
          <label className="input-label">Account</label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="input-field bg-white"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} (₹{Number(a.balance).toLocaleString("en-IN")})
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Amount"
          type="number"
          required
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
        />
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          label="Description"
          placeholder="Optional note"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </form>
    </Modal>
  );
};

/* ------------------------------------------------------------------ */
/* Transfer Money                                                     */
/* ------------------------------------------------------------------ */
export const TransferModal: React.FC<{
  accounts: Account[];
  onClose: () => void;
}> = ({ accounts, onClose }) => {
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || "");
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || "");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const [transferMoney, { isLoading }] = useTransferMoneyMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccountId || !toAccountId) return toast.error("Select both accounts");
    if (fromAccountId === toAccountId)
      return toast.error("Choose two different accounts");
    if (!(Number(amount) > 0)) return toast.error("Enter an amount greater than zero");
    const fromAcc = accounts.find((a) => a.id === fromAccountId);
    if (fromAcc && Number(amount) > Number(fromAcc.balance)) {
      return toast.error(
        `Insufficient balance in ${fromAcc.name} (₹${Number(
          fromAcc.balance
        ).toLocaleString("en-IN")})`
      );
    }
    try {
      await transferMoney({
        fromAccountId,
        toAccountId,
        amount: Number(amount),
        description,
        date: date || undefined,
      }).unwrap();
      toast.success("Money transferred");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to transfer money");
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Transfer Money"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="transfer-form" disabled={isLoading}>
            {isLoading ? "Transferring…" : "Transfer"}
          </Button>
        </>
      }
    >
      <form id="transfer-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">From Account</label>
          <select
            value={fromAccountId}
            onChange={(e) => setFromAccountId(e.target.value)}
            className="input-field bg-white"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} (₹{Number(a.balance).toLocaleString("en-IN")})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="input-label">To Account</label>
          <select
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
            className="input-field bg-white"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} (₹{Number(a.balance).toLocaleString("en-IN")})
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Amount"
          type="number"
          required
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          label="Description"
          placeholder="Optional note"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </form>
    </Modal>
  );
};
