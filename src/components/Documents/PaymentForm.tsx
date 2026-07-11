import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";
import { Card } from "../UI/Card";
import { Input } from "../UI/Input";
import { Select } from "../UI/Select";
import { Textarea } from "../UI/Textarea";
import { Button } from "../UI/Button";
import { useGetPartiesQuery } from "../../features/party/partyApiSlice";
import { useCreatePaymentMutation } from "../../features/payment/paymentApiSlice";

interface PaymentFormProps {
  type: string; // "PAYMENT_IN" | "PAYMENT_OUT"
  title: string; // "Payment In"
  backTo: string;
  numberPrefix: string; // "PIN" | "POUT"
  partyLabel?: string;
}

const MODES = [
  { value: "CASH", label: "Cash" },
  { value: "BANK", label: "Bank" },
  { value: "UPI", label: "UPI" },
  { value: "CHEQUE", label: "Cheque" },
];
const today = () => new Date().toISOString().slice(0, 10);

const PaymentForm: React.FC<PaymentFormProps> = ({
  type,
  title,
  backTo,
  numberPrefix,
  partyLabel = "Party",
}) => {
  const navigate = useNavigate();
  const { data: partiesRes } = useGetPartiesQuery(undefined);
  const [createPayment, { isLoading }] = useCreatePaymentMutation();

  const parties: any[] = partiesRes?.data || [];
  const partyOptions = parties.map((p) => ({
    value: p.id,
    label: p.partyName || p.name || "(unnamed)",
  }));

  const [partyId, setPartyId] = useState("");
  const [paymentNo, setPaymentNo] = useState(
    `${numberPrefix}-${today().replace(/-/g, "").slice(2)}`
  );
  const [paymentDate, setPaymentDate] = useState(today());
  const [amount, setAmount] = useState<number>(0);
  const [mode, setMode] = useState("CASH");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!partyId) e.partyId = `${partyLabel} is required`;
    if (!paymentNo.trim()) e.paymentNo = "Number is required";
    if (!amount || amount <= 0) e.amount = "Enter an amount greater than 0";
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    try {
      await createPayment({
        type,
        paymentNo: paymentNo.trim(),
        paymentDate,
        partyId,
        amount,
        mode,
        reference: reference.trim(),
        notes: notes.trim(),
      }).unwrap();
      toast.success(`${title} recorded successfully`);
      navigate(backTo);
    } catch (err: any) {
      toast.error(err?.data?.message || `Failed to record ${title.toLowerCase()}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        type="button"
        onClick={() => navigate(backTo)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer mb-4"
      >
        <FaArrowLeft />
        <span>Back</span>
      </button>

      <h1 className="text-2xl primary-font text-gray-800 mb-1">Record {title}</h1>
      <p className="text-sm light-font text-gray-500 mb-6">
        Fill in the payment details below
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <Card className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
            <Select
              label={partyLabel}
              value={partyId}
              onChange={(e) => {
                setPartyId(e.target.value);
                setErrors((p) => ({ ...p, partyId: "" }));
              }}
              options={partyOptions}
              placeholder={`Select ${partyLabel.toLowerCase()}`}
              error={errors.partyId}
              required
            />
            <Input
              label={`${title} Number`}
              value={paymentNo}
              onChange={(e) => setPaymentNo(e.target.value)}
              error={errors.paymentNo}
              required
            />
            <Input
              label="Amount"
              type="number"
              min={0}
              value={amount || ""}
              onChange={(e) => {
                setAmount(Number(e.target.value));
                setErrors((p) => ({ ...p, amount: "" }));
              }}
              error={errors.amount}
              placeholder="0.00"
              required
            />
            <Input
              label="Date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
            <Select
              label="Payment Mode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              options={MODES}
            />
            <Input
              label="Reference No."
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Txn / cheque no. (optional)"
            />
          </div>

          <Textarea
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Optional notes"
            maxLength={300}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(backTo)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : `Save ${title}`}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default PaymentForm;
