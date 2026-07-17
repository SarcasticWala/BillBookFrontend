import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { Modal } from "../UI/Modal";
import { Input } from "../UI/Input";
import { Button } from "../UI/Button";
import { useCreateExpenseMutation } from "../../features/expense/expenseApiSlice";
import { newIdempotencyKey } from "../../lib/idempotency";

const MODES = ["CASH", "BANK", "UPI", "CARD"];

export const CreateExpenseModal: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const [expenseNumber, setExpenseNumber] = useState(
    `EXP-${Date.now().toString().slice(-6)}`
  );
  const [expenseDate, setExpenseDate] = useState("");
  const [category, setCategory] = useState("");
  const [partyName, setPartyName] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [notes, setNotes] = useState("");

  const [createExpense, { isLoading }] = useCreateExpenseMutation();
  const idempotencyKey = useRef(newIdempotencyKey());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseNumber.trim()) return toast.error("Expense number is required");
    if (!(Number(amount) > 0)) return toast.error("Enter an amount greater than zero");
    try {
      await createExpense({
        expenseNumber: expenseNumber.trim(),
        expenseDate: expenseDate || undefined,
        category,
        partyName,
        amount: Number(amount),
        paymentMode,
        notes,
        __idempotencyKey: idempotencyKey.current,
      }).unwrap();
      toast.success("Expense created");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create expense");
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Create Expense"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-expense-form" disabled={isLoading}>
            {isLoading ? "Saving…" : "Save Expense"}
          </Button>
        </>
      }
    >
      <form id="create-expense-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Expense Number"
            required
            value={expenseNumber}
            onChange={(e) => setExpenseNumber(e.target.value)}
          />
          <Input
            label="Date"
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
          />
          <Input
            label="Category"
            placeholder="ex: Rent, Utilities"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <Input
            label="Paid To (Party)"
            placeholder="Optional"
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
          />
          <Input
            label="Amount"
            type="number"
            required
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div>
            <label className="input-label">Payment Mode</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="input-field bg-white"
            >
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="input-label">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="input-field resize-none"
            placeholder="Optional note"
          />
        </div>
      </form>
    </Modal>
  );
};

export default CreateExpenseModal;
