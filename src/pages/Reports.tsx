import { useEffect, useState } from "react";

import {
  FileText,
  Download,
  CalendarDays,
  ShieldAlert,
  Users,
  Building2,
  BarChart3,
  Clock,
  CheckCircle2,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { apiRequest } from "../api/client";

type BackendReport = {
  id: number;
  title: string;
  type: string;
  date: string;
  status: string;
  description: string;
  report_type?: string;
  format?: string;
  download_url?: string | null;
};

type ReportsResponse = {
  success: boolean;
  data: {
    items: BackendReport[];
    total: number;
    limit: number;
    offset: number;
  };
};

type GenerateResponse = {
  success: boolean;
  data: {
    report_id: number | null;
    status: string;
    report_type: string;
    format: string;
    estimated_ready_seconds: number;
  };
};

const reportTypeMap: Record<string, string> = {
  "Hazard Assessment": "hazard",
  "Relocation Priority": "priority",
  "Safe Site Capacity": "capacity",
  "Emergency Situation": "full",
};

const displayTypeMap: Record<string, string> = {
  hazard: "Hazard Report",
  priority: "Relocation Report",
  capacity: "Capacity Report",
  relocation: "Relocation Report",
  full: "Situation Report",
};

function Reports() {
  const [reports, setReports] = useState<BackendReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [reportType, setReportType] =
    useState("Hazard Assessment");

  const [district, setDistrict] =
    useState("All Maharashtra");

  const [period, setPeriod] =
    useState("Last 30 Days");

  const [filter, setFilter] = useState("All");

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest<ReportsResponse>(
        "/reports/?limit=100&offset=0"
      );

      if (response.success) {
        setReports(response.data.items || []);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load reports from backend."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function generateReport() {
    try {
      setGenerating(true);
      setError("");
      setMessage("");

      const backendReportType =
        reportTypeMap[reportType] || "full";

      const response =
        await apiRequest<GenerateResponse>(
          "/reports/generate",
          {
            method: "POST",
            body: JSON.stringify({
              report_type: backendReportType,
              format: "pdf",
              filters: {
                district:
                  district === "All Maharashtra"
                    ? null
                    : district,
                period,
              },
            }),
          }
        );

      if (response.success) {
        const reportId = response.data.report_id;

        if (reportId !== null) {
          setMessage(
            `Report #${reportId} queued successfully.`
          );
        } else {
          setMessage(
            "Report request sent to backend successfully. Backend has queued the report."
          );
        }

        await loadReports();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate report."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function deleteReport(id: number) {
    try {
      setError("");
      setMessage("");

      await apiRequest(
        `/reports/${id}`,
        {
          method: "DELETE",
        }
      );

      setMessage(`Report #${id} deleted successfully.`);

      await loadReports();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete report."
      );
    }
  }

  async function exportReport(report: BackendReport) {
    if (report.download_url) {
      window.open(
        report.download_url,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    setMessage(
      "The backend has not provided a download URL for this report yet."
    );
  }

  const filteredReports =
    filter === "All"
      ? reports
      : reports.filter(
          (report) =>
            report.type === filter ||
            displayTypeMap[report.report_type || ""] ===
              filter
        );

  const hazardReports = reports.filter(
    (report) =>
      report.type === "Hazard Report" ||
      report.report_type === "hazard"
  ).length;

  const relocationReports = reports.filter(
    (report) =>
      report.type === "Relocation Report" ||
      report.report_type === "priority" ||
      report.report_type === "relocation"
  ).length;

  const capacityReports = reports.filter(
    (report) =>
      report.type === "Capacity Report" ||
      report.report_type === "capacity"
  ).length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">

      {/* HEADER */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
          <span className="h-2 w-2 rounded-full bg-orange-600 dark:bg-orange-400" />
          Documentation & Reporting
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Reports
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-400">
          Generate and review disaster intelligence reports
          using the backend reporting service.
        </p>
      </div>

      {/* LIVE BACKEND NOTICE */}
      <div className="rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/50 p-4">
        <div className="flex items-center gap-3">

          <div className="rounded-lg bg-green-100 dark:bg-green-950 p-2">
            <CheckCircle2 className="h-5 w-5 text-green-700 dark:text-green-300" />
          </div>

          <div>
            <p className="text-sm font-bold text-green-800 dark:text-green-100">
              LIVE BACKEND
            </p>

            <p className="text-xs text-green-700 dark:text-green-300">
              Reports are now loaded and generated through the
              FastAPI backend.
            </p>
          </div>

          <button
            onClick={loadReports}
            disabled={loading}
            className="ml-auto flex items-center gap-2 rounded-lg bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-green-700 dark:text-green-300 shadow-sm hover:bg-green-100 dark:bg-green-950 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>

        </div>
      </div>

      {/* SUCCESS */}
      {message && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/50 p-4 text-sm font-semibold text-green-700 dark:text-green-300">
          <CheckCircle2 className="h-5 w-5" />
          {message}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 p-4 text-sm font-semibold text-red-700 dark:text-red-300">
          <ShieldAlert className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          title="Total Reports"
          value={String(reports.length)}
          description="Reports from backend"
          icon={FileText}
        />

        <SummaryCard
          title="Hazard Reports"
          value={String(hazardReports)}
          description="Risk and hazard analysis"
          icon={ShieldAlert}
        />

        <SummaryCard
          title="Relocation Reports"
          value={String(relocationReports)}
          description="Population movement"
          icon={Users}
        />

        <SummaryCard
          title="Capacity Reports"
          value={String(capacityReports)}
          description="Safe-site assessments"
          icon={Building2}
        />

      </div>

      {/* GENERATE REPORT */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">
              Generate New Report
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400">
              Select the report parameters and send a generation
              request to the backend.
            </p>
          </div>

          <button
            onClick={generateReport}
            disabled={generating}
            className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 dark:bg-orange-400 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}

            {generating
              ? "Generating..."
              : "Generate Report"}
          </button>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          <SelectBox
            label="Report Type"
            value={reportType}
            onChange={setReportType}
            options={[
              "Hazard Assessment",
              "Relocation Priority",
              "Safe Site Capacity",
              "Emergency Situation",
            ]}
          />

          <SelectBox
            label="District"
            value={district}
            onChange={setDistrict}
            options={[
              "All Maharashtra",
              "Raigad",
              "Ratnagiri",
              "Thane",
              "Nashik",
              "Pune",
            ]}
          />

          <SelectBox
            label="Reporting Period"
            value={period}
            onChange={setPeriod}
            options={[
              "Last 7 Days",
              "Last 30 Days",
              "Last 90 Days",
              "Current Year",
            ]}
          />

        </div>

      </div>

      {/* REPORT LIST */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">

        <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 p-5 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">
              Recent Reports
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400">
              Reports returned by the backend.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400">
            <CalendarDays className="h-4 w-4" />
            Backend data
          </div>

        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800 p-4">

          <FilterButton
            label="All"
            active={filter === "All"}
            onClick={() => setFilter("All")}
          />

          <FilterButton
            label="Hazard Report"
            active={filter === "Hazard Report"}
            onClick={() => setFilter("Hazard Report")}
          />

          <FilterButton
            label="Relocation Report"
            active={filter === "Relocation Report"}
            onClick={() => setFilter("Relocation Report")}
          />

          <FilterButton
            label="Capacity Report"
            active={filter === "Capacity Report"}
            onClick={() => setFilter("Capacity Report")}
          />

          <FilterButton
            label="Situation Report"
            active={filter === "Situation Report"}
            onClick={() => setFilter("Situation Report")}
          />

        </div>

        <div className="divide-y divide-slate-100">

          {loading ? (
            <div className="flex items-center justify-center gap-3 p-12 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-400">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Loading reports from backend...
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-10 text-center">

              <FileText className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                No reports returned by backend
              </p>

              <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">
                Use Generate Report to send a report request.
              </p>

            </div>
          ) : (
            filteredReports.map((report) => (
              <ReportRow
                key={report.id}
                report={report}
                onExport={exportReport}
                onDelete={deleteReport}
              />
            ))
          )}

        </div>

      </div>

      {/* REPORT CATEGORIES */}
      <div>

        <div className="mb-4">

          <h2 className="font-bold text-slate-900 dark:text-white">
            Report Categories
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400">
            Filter reports by backend report type.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

          <CategoryCard
            icon={ShieldAlert}
            title="Hazard Reports"
            description="Risk scores, hazard zones, rainfall, terrain and exposure."
            onClick={() => setFilter("Hazard Report")}
          />

          <CategoryCard
            icon={Users}
            title="Relocation Reports"
            description="Priority populations, relocation requirements and routes."
            onClick={() => setFilter("Relocation Report")}
          />

          <CategoryCard
            icon={Building2}
            title="Capacity Reports"
            description="Shelter availability, occupancy and destination capacity."
            onClick={() => setFilter("Capacity Report")}
          />

          <CategoryCard
            icon={BarChart3}
            title="Situation Reports"
            description="Emergency conditions, trends and critical area summaries."
            onClick={() => setFilter("Situation Report")}
          />

        </div>

      </div>

      {/* BACKEND NOTE */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-5">

        <div className="flex items-start gap-3">

          <div className="rounded-lg bg-white dark:bg-slate-900 p-3 shadow-sm">
            <Download className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </div>

          <div>

            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Backend Export Status
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400 dark:text-slate-400">
              Report generation requests are connected to the
              backend. The current backend response returns
              queued status but does not yet provide a report
              download URL.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}


/* SUMMARY CARD */

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">
            {description}
          </p>

        </div>

        <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3">
          <Icon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        </div>

      </div>

    </div>
  );
}


/* SELECT BOX */

function SelectBox({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>

      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none transition focus:border-orange-400 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
      >

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}

      </select>

    </div>
  );
}


/* FILTER BUTTON */

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-2 text-[10px] font-bold transition ${
        active
          ? "bg-orange-600 dark:bg-orange-400 text-white"
          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-400 hover:bg-slate-200 dark:bg-slate-700"
      }`}
    >
      {label}
    </button>
  );
}


/* REPORT ROW */

function ReportRow({
  report,
  onExport,
  onDelete,
}: {
  report: BackendReport;
  onExport: (report: BackendReport) => void;
  onDelete: (id: number) => void;
}) {
  const ready =
    report.status?.toLowerCase() === "ready" ||
    report.status?.toLowerCase() === "completed";

  const reportType =
    report.type ||
    displayTypeMap[report.report_type || ""] ||
    "Report";

  return (
    <div className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-800 lg:flex-row lg:items-center lg:justify-between">

      <div className="flex min-w-0 items-start gap-4">

        <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3">
          <FileText className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        </div>

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {report.title ||
                `${reportType} #${report.id}`}
            </h3>

            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[9px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-400">
              {reportType}
            </span>

          </div>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400 dark:text-slate-400">
            {report.description ||
              "Report generated by the backend reporting service."}
          </p>

          <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-400">
            <Clock className="h-3 w-3" />
            {report.date || "Backend generated"}
          </div>

        </div>

      </div>

      <div className="flex flex-wrap items-center gap-3">

        <span
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-bold ${
            ready
              ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
              : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
          }`}
        >
          {ready ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <Clock className="h-3 w-3" />
          )}

          {report.status || "Queued"}
        </span>

        <button
          onClick={() => onExport(report)}
          disabled={!ready}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            ready
              ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-95"
              : "cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400"
          }`}
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>

        <button
          onClick={() => onDelete(report.id)}
          className="flex items-center gap-2 rounded-lg border border-red-100 dark:border-red-900 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:bg-red-950/50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>

      </div>

    </div>
  );
}


/* CATEGORY CARD */

function CategoryCard({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
    >

      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 transition group-hover:bg-orange-600 dark:bg-orange-400">
        <Icon className="h-5 w-5 text-slate-600 dark:text-slate-300 transition group-hover:text-orange-600 dark:text-orange-400" />
      </div>

      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-400 dark:text-slate-400">
        {description}
      </p>

      <p className="mt-4 text-[10px] font-bold text-orange-500 dark:text-orange-400">
        View reports →
      </p>

    </button>
  );
}


export default Reports;