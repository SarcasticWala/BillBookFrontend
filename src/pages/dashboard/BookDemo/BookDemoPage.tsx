import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { newIdempotencyKey } from "../../../lib/idempotency";
import { MdCheckCircle, MdSupportAgent, MdSchedule } from "react-icons/md";
import { Button } from "../../../components/UI/Button";
import { Card } from "../../../components/UI/Card";
import { PageHeader } from "../../../components/UI/PageHeader";
import { FormSection } from "../../../components/UI/FormSection";
import { Input } from "../../../components/UI/Input";
import { Textarea } from "../../../components/UI/Textarea";
import { Select } from "../../../components/UI/Select";
import { Badge } from "../../../components/UI/Badge";
import { Table, type Column } from "../../../components/Table/Table";
import { useBookDemoMutation, useGetDemosQuery } from "../../../features/demo/demoApiSlice";
import { useGetMeQuery } from "../../../features/auth/authApiSlice";

const interestOptions = [
  { value: "BILLING", label: "Billing & Invoicing" },
  { value: "INVENTORY", label: "Inventory Management" },
  { value: "GST", label: "GST & E-Invoicing" },
  { value: "REPORTS", label: "Reports & Analytics" },
  { value: "OTHER", label: "Other" },
];

const timeSlots = [
  "09:00 - 10:00 AM",
  "10:00 - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 - 01:00 PM",
  "02:00 - 03:00 PM",
  "03:00 - 04:00 PM",
  "04:00 - 05:00 PM",
].map((s) => ({ value: s, label: s }));

const interestLabel = (v: string) =>
  interestOptions.find((o) => o.value === v)?.label || v || "—";

type DemoStatus = "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
const statusVariant: Record<DemoStatus, "warning" | "info" | "success" | "danger"> = {
  PENDING: "warning",
  SCHEDULED: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
};

interface DemoRow {
  id: string;
  interest: string;
  preferredDate: string;
  preferredTime: string;
  attendees: number;
  status: DemoStatus;
  createdAt: string;
}

const demoColumns: Column<DemoRow>[] = [
  {
    header: "Requested On",
    accessor: "createdAt",
    render: (v) => (v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"),
  },
  { header: "Interest", accessor: "interest", render: (v) => interestLabel(v) },
  { header: "Preferred Date", accessor: "preferredDate", render: (v) => v || "—" },
  { header: "Time Slot", accessor: "preferredTime", render: (v) => v || "—" },
  { header: "Attendees", accessor: "attendees", render: (v) => v ?? 1 },
  {
    header: "Status",
    accessor: "status",
    render: (v: DemoStatus) => <Badge variant={statusVariant[v] ?? "neutral"}>{v}</Badge>,
  },
];

const highlights = [
  { icon: <MdSupportAgent />, title: "1-on-1 walkthrough", desc: "A product expert guides you through the features you care about." },
  { icon: <MdSchedule />, title: "At your convenience", desc: "Pick a date and time slot that works best for your team." },
  { icon: <MdCheckCircle />, title: "No commitment", desc: "See how BillBook fits your workflow before you decide." },
];

const BookDemoPage: React.FC = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const { data: meData } = useGetMeQuery();
  const { data: demosData, isLoading: isLoadingDemos } = useGetDemosQuery();
  const demos: DemoRow[] = demosData?.data ?? [];
  const [bookDemo, { isLoading }] = useBookDemoMutation();
  const idempotencyKey = useRef(newIdempotencyKey());

  const [form, setForm] = useState({
    name: "",
    mobileNo: "",
    email: "",
    businessName: "",
    interest: "BILLING",
    preferredDate: "",
    preferredTime: timeSlots[0].value,
    attendees: "1",
    message: "",
  });

  // Prefill from the logged-in user's profile once it loads.
  useEffect(() => {
    const u = meData?.data;
    if (!u) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || u.name || "",
      mobileNo: prev.mobileNo || u.phone || "",
      email: prev.email || u.email || "",
      businessName: prev.businessName || u.businessName || "",
    }));
  }, [meData]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => (prev[key] ? { ...prev, [key]: "" } : prev));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = "Please enter your name";
    if (form.mobileNo.trim().length !== 10) {
      nextErrors.mobileNo = "Enter a valid 10-digit mobile number";
    }
    if (form.email.trim() && !/\S+@\S+\.\S+/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }

    const attendeesNum = Number(form.attendees);
    if (form.attendees !== "" && (!Number.isInteger(attendeesNum) || attendeesNum < 1)) {
      nextErrors.attendees = "Attendees must be a whole number of at least 1";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await bookDemo({
        ...form,
        attendees: attendeesNum || 1,
        __idempotencyKey: idempotencyKey.current,
      }).unwrap();
      toast.success("Demo booked! Our team will reach out to confirm.");
      setErrors({});
      // Fresh key for any subsequent booking attempt.
      idempotencyKey.current = newIdempotencyKey();
      // Stay on the page and clear the free-text field so the new request
      // shows up in the "My Demo Requests" table below (auto-refetched).
      setForm((prev) => ({ ...prev, message: "" }));
    } catch (err: any) {
      const details = err?.data?.details;
      if (Array.isArray(details) && details.length) {
        // Field-level errors go inline (consistent with client-side
        // validation above); anything without a known field falls back to
        // a toast so it isn't silently dropped.
        const fieldErrors: Record<string, string> = {};
        details.forEach((d: any) => {
          if (d.path && d.path in form) {
            fieldErrors[d.path] = d.message || "Invalid value";
          } else {
            toast.error(d.message || `${d.path}: invalid value`);
          }
        });
        if (Object.keys(fieldErrors).length) setErrors((prev) => ({ ...prev, ...fieldErrors }));
      } else {
        toast.error(err?.data?.message || "Failed to book demo");
      }
    }
  };

  return (
    <div className="secondary-font">
      <PageHeader
        title="Book a Demo"
        subtitle="Schedule a personalized walkthrough of BillBook with our team."
        onBack={() => navigate("/dashboard")}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" form="book-demo-form" disabled={isLoading}>
              {isLoading ? "Booking..." : "Book Demo"}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start max-w-6xl">
        {/* What you'll get */}
        <Card className="p-4 sm:p-6 space-y-5 lg:col-span-1 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <h2 className="text-sm primary-font text-gray-900 uppercase tracking-wide">
            What you'll get
          </h2>
          <ul className="space-y-4">
            {highlights.map((h) => (
              <li key={h.title} className="flex gap-3">
                <span className="text-primary text-xl mt-0.5">{h.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{h.title}</p>
                  <p className="text-xs light-font text-gray-600">{h.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Form */}
        {/* noValidate: without it, the browser's own HTML5 constraint validation
            (type="email", attendees' min=1) silently cancels the submit event
            before it ever reaches handleSubmit — so an invalid email showed no
            feedback at all, and an invalid attendees count showed the browser's
            generic wording instead of our own message below. All validation is
            handled explicitly in handleSubmit instead, consistent with the rest
            of this form. */}
        <form
          id="book-demo-form"
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-2 space-y-5"
        >
          <FormSection title="Your Details">
            <Input
              label="Full Name"
              name="name"
              required
              placeholder="Enter your name"
              value={form.name}
              onChange={update("name")}
              error={errors.name}
            />
            <Input
              label="Mobile Number"
              name="mobileNo"
              required
              placeholder="10-digit mobile number"
              maxLength={10}
              value={form.mobileNo}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, mobileNo: e.target.value.replace(/\D/g, "") }));
                setErrors((prev) => (prev.mobileNo ? { ...prev, mobileNo: "" } : prev));
              }}
              error={errors.mobileNo}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={update("email")}
              error={errors.email}
            />
            <Input
              label="Business Name"
              name="businessName"
              placeholder="Your business name"
              value={form.businessName}
              onChange={update("businessName")}
            />
          </FormSection>

          <FormSection title="Demo Preferences">
            <Select
              label="Area of Interest"
              name="interest"
              options={interestOptions}
              value={form.interest}
              onChange={update("interest")}
            />
            <Input
              label="Attendees"
              name="attendees"
              type="number"
              min={1}
              value={form.attendees}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, attendees: e.target.value.replace(/[^\d]/g, "") }));
                setErrors((prev) => (prev.attendees ? { ...prev, attendees: "" } : prev));
              }}
              error={errors.attendees}
            />
            <Input
              label="Preferred Date"
              name="preferredDate"
              type="date"
              min={today}
              value={form.preferredDate}
              onChange={update("preferredDate")}
            />
            <Select
              label="Preferred Time Slot"
              name="preferredTime"
              options={timeSlots}
              value={form.preferredTime}
              onChange={update("preferredTime")}
            />
            <Textarea
              label="Anything specific you'd like to see?"
              name="message"
              containerClassName="md:col-span-2"
              rows={3}
              placeholder="Tell us about your requirements (optional)"
              value={form.message}
              onChange={update("message")}
            />
          </FormSection>
        </form>
      </div>

      {/* My Demo Requests — everything this user has booked */}
      <div className="mt-6 sm:mt-8 max-w-6xl">
        <h2 className="text-sm primary-font text-gray-900 uppercase tracking-wide">
          My Demo Requests
        </h2>
        <p className="text-xs light-font text-gray-500 mt-0.5">
          Demos you've booked appear here. Our team updates the status as they schedule them.
        </p>
        <Table
          columns={demoColumns}
          data={demos}
          emptyMessage={
            isLoadingDemos ? "Loading your demo requests..." : "You haven't booked any demos yet."
          }
        />
      </div>
    </div>
  );
};

export default BookDemoPage;
