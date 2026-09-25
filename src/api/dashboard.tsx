import { useEffect, useState } from "react";
import {
  Users,
  AlertTriangle,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Building2,
  RefreshCw,
  Activity,
  Truck,
  Clock,
} from "lucide-react";
import { apiRequest } from "../api/client";

type DashboardSummary = {
  total_villages: number;
  hazard_zones: {
    SAFE: number;
    WARNING: number;
    RED: number;
  };
  priority_breakdown: {
    IMMEDIATE: number;
    SHORT_TERM: number;
    MEDIUM_TERM: number;
  };
  total_sites: number;
  total_capacity: number;
  total_available_capacity?: number;
  current_site_population?: number;
  total_displaced: number;
  population_at_risk: number;
  total_population: number;
  relocation_coverage_pct: number;
};

type DashboardResponse = {
  success: boolean;
  data: DashboardSummary;
};

type AlertItem = {
  village_id: number;
  village_name: string;
  district: string;
  severity: "CRITICAL" | "WARNING";
  hazard_score: number;
  population: number;
  message: string;
};

type AlertsResponse = {
  success: boolean;
  data: {
    alerts: AlertItem[];
    total: number;
  };
};

type ActivityItem = {
  type: string;
  village_id: number;
  village_name: string;
  district: string;
  zone: string;
  hazard_score: number;
  message: string;
};

type ActivityResponse = {
  success: boolean;
  data: {
    activities: ActivityItem[];
    total: number;
  };
};

function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [summaryResponse, alertsResponse, activityResponse] =
        await Promise.all([
          apiRequest<DashboardResponse>("/dashboard/summary", {
            method: "GET",
          }),

          apiRequest<AlertsResponse>("/dashboard/alerts", {
            method: "GET",
          }),

          apiRequest<ActivityResponse>("/dashboard/recent-activity", {
            method: "GET",
          }),
        ]);

      if (!summaryResponse?.success || !summaryResponse?.data) {
        throw new Error("Invalid dashboard summary response.");
      }

      setSummary(summaryResponse.data);

      if (alertsResponse?.success && alertsResponse?.data) {
        setAlerts(alertsResponse.data.alerts || []);
      }

      if (activityResponse?.success && activityResponse?.data) {
        setActivities(activityResponse.data.activities || []);
      }
    } catch (err) {
      console.error("Dashboard loading failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the dashboard backend."
      );
    } finally {
      setLoading(false);
    }
  }

  const safe = summary?.hazard_zones.SAFE ?? 0;
  const warning = summary?.hazard_zones.WARNING ?? 0;
  const red = summary?.hazard_zones.RED ?? 0;

  const totalVillages = summary?.total_villages ?? 0;
  const totalPopulation = summary?.total_population ?? 0;
  const populationAtRisk = summary?.population_at_risk ?? 0;

  const totalSites = summary?.total_sites ?? 0;
  const totalCapacity = summary?.total_capacity ?? 0;
  const availableCapacity = summary?.total_available_capacity ?? 0;

  const currentSitePopulation = summary?.current_site_population ?? 0;
  const displaced = summary?.total_displaced ?? 0;
  const coverage = summary?.relocation_coverage_pct ?? 0;

  const immediate = summary?.priority_breakdown.IMMEDIATE ?? 0;
  const shortTerm = summary?.priority_breakdown.SHORT_TERM ?? 0;
  const mediumTerm = summary?.priority_breakdown.MEDIUM_TERM ?? 0;

  const usedCapacity = Math.max(
    0,
    totalCapacity - availableCapacity
  );

  const capacityPercentage =
    totalCapacity > 0
      ? Math.round((usedCapacity / totalCapacity) * 100)
      : 0;

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-orange-600">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            Maharashtra Disaster Situation
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Situation Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Current overview of vulnerable habitations, hazard zones,
            population at risk and relocation requirements.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"}
          />

          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>


      {/* DEMO NOTICE */}

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-amber-100 p-2">
            <AlertTriangle className="h-5 w-5 text-amber-700" />
          </div>

          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">
              LIVE BACKEND DATA
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-700">
              Current dashboard information is loaded from the ResQVision FastAPI
              backend and refreshed from the connected backend data source.
            </p>
          </div>

          <div className="hidden text-xs font-semibold text-amber-700 md:block">
            Maharashtra, India
          </div>
        </div>
      </div>


      {/* ERROR */}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-red-100 p-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-red-800">
                Backend request failed
              </h3>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>

              <p className="mt-2 text-xs text-red-500">
                Check that the FastAPI backend is running on port 8000.
              </p>
            </div>

            <button
              type="button"
              onClick={loadDashboard}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}


      {/* LOADING */}

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <RefreshCw className="mx-auto h-7 w-7 animate-spin text-orange-500" />

          <p className="mt-4 text-sm font-semibold text-slate-700">
            Loading dashboard data...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Connecting to the ResQVision FastAPI backend.
          </p>
        </div>
      )}


      {/* MAIN DASHBOARD */}

      {!loading && summary && (
        <>

          {/* PRIMARY KPIs */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

            <SummaryCard
              title="Vulnerable Habitations"
              value={formatNumber(totalVillages)}
              description="Habitations assessed"
              icon={MapPin}
              iconClass="text-orange-600"
              bgClass="bg-orange-50"
            />

            <SummaryCard
              title="Population at Risk"
              value={formatNumber(populationAtRisk)}
              description="People requiring attention"
              icon={Users}
              iconClass="text-red-600"
              bgClass="bg-red-50"
            />

            <SummaryCard
              title="Relocation Sites"
              value={formatNumber(totalSites)}
              description="Destination sites"
              icon={Building2}
              iconClass="text-emerald-600"
              bgClass="bg-emerald-50"
            />

            <SummaryCard
              title="Relocation Coverage"
              value={`${coverage.toFixed(2)}%`}
              description="Population currently covered"
              icon={ShieldCheck}
              iconClass="text-blue-600"
              bgClass="bg-blue-50"
            />

          </div>


          {/* HAZARD ZONES */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-slate-600" />

                  <h2 className="font-bold text-slate-900">
                    Hazard Zone Distribution
                  </h2>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Current classification of assessed habitations.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase text-slate-500">
                {formatNumber(totalVillages)} Total
              </span>

            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

              <ZoneCard
                title="Red Zone"
                value={red}
                description="Highest hazard exposure"
                percentage={getPercentage(red, totalVillages)}
                icon={ShieldAlert}
                cardClass="border-red-200 bg-red-50"
                iconClass="bg-red-100 text-red-600"
                valueClass="text-red-700"
              />

              <ZoneCard
                title="Warning Zone"
                value={warning}
                description="Requires monitoring"
                percentage={getPercentage(warning, totalVillages)}
                icon={AlertTriangle}
                cardClass="border-amber-200 bg-amber-50"
                iconClass="bg-amber-100 text-amber-600"
                valueClass="text-amber-700"
              />

              <ZoneCard
                title="Safe Zone"
                value={safe}
                description="Lower assessed risk"
                percentage={getPercentage(safe, totalVillages)}
                icon={ShieldCheck}
                cardClass="border-emerald-200 bg-emerald-50"
                iconClass="bg-emerald-100 text-emerald-600"
                valueClass="text-emerald-700"
              />

            </div>
          </div>


          {/* PRIORITY + CAPACITY */}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* PRIORITY */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-red-50 p-3">
                  <ShieldAlert className="h-5 w-5 text-red-600" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Relocation Priority
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Habitations grouped by response priority.
                  </p>
                </div>

              </div>

              <div className="mt-6 space-y-4">

                <PriorityRow
                  title="Immediate"
                  value={immediate}
                  description="Highest priority"
                  className="border-red-200 bg-red-50"
                  valueClass="text-red-700"
                />

                <PriorityRow
                  title="Short Term"
                  value={shortTerm}
                  description="Priority relocation"
                  className="border-amber-200 bg-amber-50"
                  valueClass="text-amber-700"
                />

                <PriorityRow
                  title="Medium Term"
                  value={mediumTerm}
                  description="Planned relocation"
                  className="border-blue-200 bg-blue-50"
                  valueClass="text-blue-700"
                />

              </div>
            </div>


            {/* CAPACITY */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-emerald-50 p-3">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Relocation Capacity
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Current destination capacity from the connected backend.
                  </p>
                </div>

              </div>

              <div className="mt-6">

                <div className="flex items-end justify-between">

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Capacity Used
                    </p>

                    <p className="mt-1 text-3xl font-bold text-slate-900">
                      {formatNumber(usedCapacity)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400">
                      Total Capacity
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {formatNumber(totalCapacity)}
                    </p>
                  </div>

                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className={
                      capacityPercentage >= 90
                        ? "h-full rounded-full bg-red-500"
                        : capacityPercentage >= 70
                        ? "h-full rounded-full bg-amber-500"
                        : "h-full rounded-full bg-emerald-500"
                    }
                    style={{
                      width: `${Math.min(capacityPercentage, 100)}%`,
                    }}
                  />

                </div>

                <div className="mt-3 flex items-center justify-between text-xs">

                  <span className="font-semibold text-slate-600">
                    {capacityPercentage}% utilized
                  </span>

                  <span className="font-semibold text-emerald-600">
                    {formatNumber(availableCapacity)} available
                  </span>

                </div>

              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">

                <MiniStat
                  label="Sites"
                  value={formatNumber(totalSites)}
                />

                <MiniStat
                  label="Displaced"
                  value={formatNumber(displaced)}
                />

              </div>

            </div>

          </div>


          {/* POPULATION */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-blue-50 p-3">
                <Users className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Population Overview
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Population metrics returned by the backend.
                </p>
              </div>

            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

              <MetricBlock
                label="Total Population"
                value={formatNumber(totalPopulation)}
              />

              <MetricBlock
                label="Population at Risk"
                value={formatNumber(populationAtRisk)}
              />

              <MetricBlock
                label="Current Site Population"
                value={formatNumber(currentSitePopulation)}
              />

            </div>

          </div>


          {/* ALERTS */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-red-50 p-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Active Alerts
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Alerts generated from current hazard conditions.
                  </p>
                </div>

              </div>

              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                {alerts.length} Active
              </span>

            </div>


            <div className="mt-6 space-y-3">

              {alerts.length === 0 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-center">
                  <ShieldCheck className="mx-auto h-6 w-6 text-emerald-500" />

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    No active alerts
                  </p>
                </div>
              )}


              {alerts.map((alert) => (
                <div
                  key={`${alert.village_id}-${alert.severity}`}
                  className={
                    alert.severity === "CRITICAL"
                      ? "rounded-lg border border-red-200 bg-red-50 p-4"
                      : "rounded-lg border border-amber-200 bg-amber-50 p-4"
                  }
                >

                  <div className="flex items-start gap-3">

                    <div
                      className={
                        alert.severity === "CRITICAL"
                          ? "rounded-lg bg-red-100 p-2"
                          : "rounded-lg bg-amber-100 p-2"
                      }
                    >
                      <AlertTriangle
                        className={
                          alert.severity === "CRITICAL"
                            ? "h-5 w-5 text-red-600"
                            : "h-5 w-5 text-amber-600"
                        }
                      />
                    </div>

                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <p className="font-bold text-slate-900">
                          {alert.village_name}
                        </p>

                        <span
                          className={
                            alert.severity === "CRITICAL"
                              ? "rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                              : "rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                          }
                        >
                          {alert.severity}
                        </span>

                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {alert.district}
                      </p>

                      <p className="mt-2 text-sm text-slate-700">
                        {alert.message}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-slate-500">

                        <span>
                          Hazard Score:{" "}
                          <span className="text-slate-900">
                            {alert.hazard_score.toFixed(2)}
                          </span>
                        </span>

                        <span>
                          Population:{" "}
                          <span className="text-slate-900">
                            {formatNumber(alert.population)}
                          </span>
                        </span>

                      </div>

                    </div>

                  </div>

                </div>
              ))}

            </div>

          </div>


          {/* RECENT ACTIVITY */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-blue-50 p-3">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Recent Activity
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Latest hazard assessment activity from the backend.
                </p>
              </div>

            </div>


            <div className="mt-6 space-y-3">

              {activities.length === 0 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-center">
                  <Activity className="mx-auto h-6 w-6 text-slate-400" />

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    No recent activity
                  </p>
                </div>
              )}


              {activities.map((activity, index) => (
                <div
                  key={`${activity.village_id}-${index}`}
                  className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4"
                >

                  <div className="rounded-lg bg-white p-2 shadow-sm">
                    <Activity className="h-4 w-4 text-slate-600" />
                  </div>

                  <div className="flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <p className="text-sm font-bold text-slate-800">
                        {activity.village_name}
                      </p>

                      <span
                        className={
                          activity.zone === "RED"
                            ? "rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700"
                            : activity.zone === "WARNING"
                            ? "rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700"
                            : "rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700"
                        }
                      >
                        {activity.zone}
                      </span>

                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {activity.district}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      {activity.message}
                    </p>

                    <p className="mt-2 text-xs font-semibold text-slate-400">
                      Hazard Score: {activity.hazard_score.toFixed(2)}
                    </p>

                  </div>

                </div>
              ))}

            </div>

          </div>


          {/* BACKEND STATUS */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-emerald-50 p-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Backend Connection
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Dashboard summary, alerts and recent activity
                    loaded through FastAPI.
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-2">

                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                <span className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                  Connected
                </span>

              </div>

            </div>

          </div>


          {/* QUICK ACTIONS */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            <QuickAction
              icon={ShieldAlert}
              title="Hazard Analysis"
              description="Review habitation hazard levels and risk indicators."
            />

            <QuickAction
              icon={Truck}
              title="Relocation Priority"
              description="Identify habitations requiring earlier relocation."
            />

            <QuickAction
              icon={Building2}
              title="Safe Sites"
              description="Review relocation destinations and remaining capacity."
            />

          </div>


          {/* FOOTER */}

          <div className="border-t border-slate-200 pt-5">

            <div className="flex flex-col gap-1 text-[10px] font-medium text-slate-400 md:flex-row md:items-center md:justify-between">

              <span>
                ResQVision • Disaster Response Decision Support
              </span>

              <span>
                LIVE BACKEND DATA • AI-ASSISTED • HUMAN DECISION REQUIRED
              </span>

            </div>

          </div>

        </>
      )}

    </div>
  );
}


/* ============================================================
   HELPERS
   ============================================================ */

function formatNumber(value: number): string {
  return Number.isFinite(value)
    ? value.toLocaleString("en-IN")
    : "0";
}


function getPercentage(
  value: number,
  total: number
): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}


/* ============================================================
   SUMMARY CARD
   ============================================================ */

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
  bgClass,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  bgClass: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>

        </div>

        <div className={`rounded-lg p-3 ${bgClass}`}>
          <Icon className={`h-5 w-5 ${iconClass}`} />
        </div>

      </div>

    </div>
  );
}


/* ============================================================
   ZONE CARD
   ============================================================ */

function ZoneCard({
  title,
  value,
  description,
  percentage,
  icon: Icon,
  cardClass,
  iconClass,
  valueClass,
}: {
  title: string;
  value: number;
  description: string;
  percentage: number;
  icon: React.ComponentType<{ className?: string }>;
  cardClass: string;
  iconClass: string;
  valueClass: string;
}) {
  return (
    <div className={`rounded-xl border p-4 ${cardClass}`}>

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-bold text-slate-800">
            {title}
          </p>

          <p className={`mt-2 text-3xl font-bold ${valueClass}`}>
            {formatNumber(value)}
          </p>

        </div>

        <div className={`rounded-lg p-2 ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>

      </div>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>

      <div className="mt-4">

        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
          <span>Share of assessed</span>
          <span>{percentage}%</span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/70">

          <div
            className={`h-full rounded-full ${valueClass.replace(
              "text-",
              "bg-"
            )}`}
            style={{
              width: `${percentage}%`,
            }}
          />

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   PRIORITY ROW
   ============================================================ */

function PriorityRow({
  title,
  value,
  description,
  className,
  valueClass,
}: {
  title: string;
  value: number;
  description: string;
  className: string;
  valueClass: string;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-4 ${className}`}
    >

      <div>

        <p className="text-sm font-bold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>

      </div>

      <p className={`text-2xl font-bold ${valueClass}`}>
        {formatNumber(value)}
      </p>

    </div>
  );
}


/* ============================================================
   MINI STAT
   ============================================================ */

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">

      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800">
        {value}
      </p>

    </div>
  );
}


/* ============================================================
   METRIC BLOCK
   ============================================================ */

function MetricBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}


/* ============================================================
   QUICK ACTION
   ============================================================ */

function QuickAction({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start gap-3">

        <div className="rounded-lg bg-slate-100 p-3">
          <Icon className="h-5 w-5 text-slate-600" />
        </div>

        <div>

          <p className="text-sm font-bold text-slate-800">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>

        </div>

      </div>

    </div>
  );
}


export default Dashboard;
