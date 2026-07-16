import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Modal } from "../UI/Modal";
import { Input } from "../UI/Input";
import { Button } from "../UI/Button";
import {
  useCreateAccountMutation,
  useAdjustMoneyMutation,
  useTransferMoneyMutation,
} from "../../features/account/accountApiSlice";

type Account = { id: string; name: string; type: string; balance: number };

/* ------------------------------------------------------------------ */
/* Add New Account                                                    */
/* ------------------------------------------------------------------ */
export const AddAccountModal: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const [type, setType] = useState<"BANK" | "CASH">("BANK");
  const [name, setName] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upiId, setUpiId] = useState("");

  const [createAccount, { isLoading }] = useCreateAccountMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Account name is required");
    try {
      await createAccount({
        name: name.trim(),
        type,
        openingBalance: Number(openingBalance) || 0,
        bankName,
        accountNumber,
        ifsc,
        upiId,
      }).unwrap();
      toast.success("Account created");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create account");
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Add New Account"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-account-form" disabled={isLoading}>
            {isLoading ? "Saving…" : "Save Account"}
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
              placeholder="Account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
            <Input
              label="IFSC Code"
              placeholder="ex: HDFC0001234"
              className="uppercase placeholder:normal-case"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
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
