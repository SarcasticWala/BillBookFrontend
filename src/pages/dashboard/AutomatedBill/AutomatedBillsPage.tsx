import { useState } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { FiPlus } from "react-icons/fi";
import { MdPauseCircleOutline, MdPlayCircleOutline, MdCancel } from "react-icons/md";
import { Button } from "../../../components/UI/Button";
import { Card } from "../../../components/UI/Card";
import { Badge } from "../../../components/UI/Badge";
import { Table, type Column } from "../../../components/Table/Table";
import {
  useGetTemplatesQuery,
  usePauseTemplateMutation,
  useResumeTemplateMutation,
  useCancelTemplateMutation,
  useGetRunsQuery,
  usePostRunMutation,
  useCancelRunMutation,
  useRetryRunMutation,
} from "../../../features/automatedBills/automatedBillApiSlice";
import { CreateAutomatedBillForm } from "./CreateAutomatedBillForm";

const fmtDate = (v: any) => {
  if (!v) return "-";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "-" : format(d, "dd MMM yyyy");
};

const statusVariant: Record<string, any> = {
  ACTIVE: "success",
  PAUSED: "warning",
  CANCELLED: "neutral",
  COMPLETED: "info",
  PENDING_REVIEW: "warning",
  POSTED: "success",
  FAILED: "danger",
};

const AutomatedBillsPage = () => {
  const [creating, setCreating] = useState(false);
  const { data: templatesData, isLoading: loadingTemplates } = useGetTemplatesQuery();
  const { data: runsData, isLoading: loadingRuns } = useGetRunsQuery();
  const templates: any[] = templatesData?.data || [];
  const runs: any[] = runsData?.data || [];

  const [pauseTemplate] = usePauseTemplateMutation();
  const [resumeTemplate] = useResumeTemplateMutation();
  const [cancelTemplate] = useCancelTemplateMutation();
  const [postRun, { isLoading: posting }] = usePostRunMutation();
  const [cancelRun] = useCancelRunMutation();
  const [retryRun, { isLoading: retrying }] = useRetryRunMutation();

  const templateName = (id: string) => templates.find((t) => t.id === id)?.partyName || "-";

  const act = async (fn: () => Promise<any>, okMsg: string) => {
    try {
      await fn();
      toast.success(okMsg);
    } catch (err: any) {
      toast.error(err?.data?.message || "Action failed");
    }
  };

  const templateColumns: Column<any>[] = [
    { header: "Party", accessor: "partyName" },
    {
      header: "Frequency",
      render: (_v, row) => row.frequency.charAt(0) + row.frequency.slice(1).toLowerCase(),
    },
    { header: "Next Run", render: (_v, row) => fmtDate(row.nextRunDate) },
    {
      header: "Mode",
      render: (_v, row) => (
        <Badge variant={row.autoPost ? "success" : "info"}>
          {row.autoPost ? "Auto-post" : "Draft for review"}
        </Badge>
      ),
    },
    {
      header: "Status",
      render: (_v, row) => <Badge variant={statusVariant[row.status]}>{row.status}</Badge>,
    },
    {
      header: "",
      render: (_v, row) => (
        <div className="flex items-center gap-2 justify-end">
          {row.status === "ACTIVE" && (
            <button
              title="Pause"
              onClick={() => act(() => pauseTemplate(row.id).unwrap(), "Template paused")}
              className="text-amber-600 hover:text-amber-700 p-2.5 xl:p-1"
            >
              <MdPauseCircleOutline size={20} />
            </button>
          )}
          {row.status === "PAUSED" && (
            <button
              title="Resume"
              onClick={() => act(() => resumeTemplate(row.id).unwrap(), "Template resumed")}
              className="text-emerald-600 hover:text-emerald-700 p-2.5 xl:p-1"
            >
              <MdPlayCircleOutline size={20} />
            </button>
          )}
          {(row.status === "ACTIVE" || row.status === "PAUSED") && (
            <button
              title="Cancel"
              onClick={() => {
                if (window.confirm("Cancel this recurring template? This can't be undone."))
                  act(() => cancelTemplate(row.id).unwrap(), "Template cancelled");
              }}
              className="text-red-500 hover:text-red-700 p-2.5 xl:p-1"
            >
              <MdCancel size={20} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const runColumns: Column<any>[] = [
    { header: "Template", render: (_v, row) => templateName(row.template) },
    { header: "Period", accessor: "period" },
    {
      header: "Status",
      render: (_v, row) => <Badge variant={statusVariant[row.status]}>{row.status.replace("_", " ")}</Badge>,
    },
    { header: "Generated", render: (_v, row) => fmtDate(row.createdAt) },
    {
      header: "",
      render: (_v, row) => (
        <div className="flex items-center gap-2 justify-end">
          {row.status === "PENDING_REVIEW" && (
            <>
              <Button
                size="sm"
                loading={posting}
                onClick={() => act(() => postRun(row.id).unwrap(), "Bill posted")}
              >
                Post
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => act(() => cancelRun(row.id).unwrap(), "Draft cancelled")}
              >
                Discard
              </Button>
            </>
          )}
          {row.status === "FAILED" && (
            <div className="text-right">
              <Button
                size="sm"
                variant="outline"
                loading={retrying}
                onClick={() => act(() => retryRun(row.id).unwrap(), "Retried")}
              >
                Retry
              </Button>
              {row.error && <p className="text-xs text-red-500 mt-1 max-w-xs">{row.error}</p>}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="secondary-font">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl primary-font text-gray-900">Automated Bills</h1>
        {!creating && (
          <Button onClick={() => setCreating(true)}>
            <FiPlus /> New Template
          </Button>
        )}
      </div>

      {creating && (
        <div className="mb-6">
          <CreateAutomatedBillForm onDone={() => setCreating(false)} />
        </div>
      )}

      <Card className="p-4 sm:p-6 mb-5">
        <h2 className="text-lg primary-font text-gray-800 mb-4">Recurring Templates</h2>
        {!loadingTemplates && !templates.length ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No recurring bills yet — create one to automate repeat invoicing.
          </p>
        ) : (
          <Table columns={templateColumns} data={templates} emptyMessage="" />
        )}
      </Card>

      <Card className="p-4 sm:p-6">
        <h2 className="text-lg primary-font text-gray-800 mb-4">Recent Runs</h2>
        {!loadingRuns && !runs.length ? (
          <p className="text-sm text-gray-500 text-center py-8">
            Generated bills will show up here once a template's schedule runs.
          </p>
        ) : (
          <Table columns={runColumns} data={runs} emptyMessage="" />
        )}
      </Card>
    </div>
  );
};

export default AutomatedBillsPage;
