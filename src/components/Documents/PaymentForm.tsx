import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Input } from "../UI/Input";
import { Select } from "../UI/Select";
import { Textarea } from "../UI/Textarea";
import { Button } from "../UI/Button";
import { PageHeader } from "../UI/PageHeader";
import { FormSection } from "../UI/FormSection";
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
    <div className="secondary-font">
      <PageHeader
        title={`Record ${title}`}
        subtitle="Fill in the payment details below"
        onBack={() => navigate(backTo)}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(backTo)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" form="payment-form" disabled={isLoading}>
              {isLoading ? "Saving..." : `Save ${title}`}
            </Button>
          </>
        }
      />

      <form
        id="payment-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5 max-w-3xl"
      >
        <FormSection title="Payment Details">
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
        </FormSection>

        <FormSection title="Notes" layout="plain">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Optional notes"
            maxLength={300}
          />
        </FormSection>
      </form>
    </div>
  );
};

export default PaymentForm;
