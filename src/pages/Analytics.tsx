import { useEffect, useState } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Users,
  MapPin,
  Activity,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { apiRequest } from "../api/client";

type OverviewData = {
  hazard_distribution: {
    SAFE: number;
    WARNING: number;
    RED: number;
  };
  priority_distribution: {
    IMMEDIATE: number;
    SHORT_TERM: number;
    MEDIUM_TERM: number;
  };
  pressure_distribution: {
    LOW: number;
    MODERATE: number;
    HIGH: number;
    CRITICAL: number;
  };
  avg_suitability_score: number;
  avg_hazard_score: number;
  total_capacity_available: number;
  total_relocation_demand: number;
  coverage_gap: number;
};

type TrendItem = {
  date: string;
  value: number;
};

type District = {
  name: string;
  risk: number;
  habitations: number;
  population: number;
};

function Analytics() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError("");

        const [overviewResponse, trendsResponse, districtResponse] =
          await Promise.all([
            apiRequest<{
              success: boolean;
              data: OverviewData;
            }>("/analytics/overview"),

            apiRequest<{
              success: boolean;
              data: {
                metric: string;
                period: string;
                series: TrendItem[];
              };
            }>("/analytics/trends?metric=hazard_score&period=30d"),

            apiRequest<{
              success: boolean;
              data: {
                districts: District[];
                metric: string;
              };
            }>("/analytics/district-comparison?metric=hazard_score"),
          ]);

        setOverview(overviewResponse.data);
        setTrends(trendsResponse.data.series || []);
        setDistricts(districtResponse.data.districts || []);
      } catch (err) {
        console.error("Analytics API error:", err);
        setError(
          "Unable to load analytics data from the backend."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const totalPopulation = districts.reduce(
    (sum, district) => sum + district.population,
    0
  );

  const highRiskAreas =
    overview?.hazard_distribution.RED ?? 0;

  const averageRisk =
    overview?.avg_hazard_score ?? 0;

  const trendChange =
    trends.length >= 2
      ? trends[trends.length - 1].value - trends[0].value
      : 0;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">

      {/* HEADER */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
          <span className="h-2 w-2 rounded-full bg-orange-600 dark:bg-orange-400" />
          Intelligence & Trends
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Analytics
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
          Analyse hazard trends, population exposure, and
          district-level risk patterns.
        </p>
      </div>

      {/* BACKEND STATUS */}
      <div
        className={`rounded-xl border p-4 ${
          error
            ? "border-red-200 dark:border-red-900 bg-red-500"
            : "border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/50"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`rounded-lg p-2 ${
              error ? "bg-red-100 dark:bg-red-950" : "bg-emerald-100 dark:bg-emerald-950"
            }`}
          >
            {error ? (
              <AlertTriangle className="h-5 w-5 text-red-700 dark:text-red-300" />
            ) : (
              <Activity className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
            )}
          </div>

          <div>
            <p
              className={`text-sm font-bold ${
                error
                  ? "text-red-800 dark:text-red-100"
                  : "text-emerald-800 dark:text-emerald-100"
              }`}
            >
              {error
                ? "BACKEND CONNECTION ERROR"
                : "LIVE BACKEND ANALYTICS"}
            </p>

            <p
              className={`text-xs ${
                error
                  ? "text-red-700 dark:text-red-300"
                  : "text-emerald-700 dark:text-emerald-300"
              }`}
            >
              {error ||
                "Analytics data is being loaded directly from the ResQVision backend."}
            </p>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          title="Average Risk"
          value={
            loading
              ? "..."
              : `${averageRisk.toFixed(1)} / 100`
          }
          description="Across monitored habitations"
          icon={Activity}
        />

        <SummaryCard
          title="High-Risk Areas"
          value={loading ? "..." : String(highRiskAreas)}
          description="Currently in red zone"
          icon={AlertTriangle}
        />

        <SummaryCard
          title="Population Exposed"
          value={
            loading
              ? "..."
              : totalPopulation.toLocaleString("en-IN")
          }
          description="People in assessed districts"
          icon={Users}
        />

        <SummaryCard
          title="Risk Trend"
          value={
            loading
              ? "..."
              : `${trendChange >= 0 ? "+" : ""}${trendChange.toFixed(1)}`
          }
          description="Change across available trend data"
          icon={TrendingUp}
        />

      </div>

      {/* ADDITIONAL BACKEND DATA */}
      {overview && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <SummaryCard
            title="Available Capacity"
            value={overview.total_capacity_available.toLocaleString(
              "en-IN"
            )}
            description="Current relocation capacity"
            icon={Users}
          />

          <SummaryCard
            title="Relocation Demand"
            value={overview.total_relocation_demand.toLocaleString(
              "en-IN"
            )}
            description="People requiring relocation"
            icon={MapPin}
          />

          <SummaryCard
            title="Coverage Gap"
            value={overview.coverage_gap.toLocaleString(
              "en-IN"
            )}
            description="Additional capacity required"
            icon={AlertTriangle}
          />

        </div>
      )}

      {/* CHARTS */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* RISK TREND */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">
                Risk Trend
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                Average hazard risk from backend assessment data.
              </p>
            </div>

            <div className="rounded-lg bg-orange-500 p-2">
              <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>

          </div>

          <div className="mt-8 flex h-64 items-end gap-3">

            {trends.length > 0 ? (
              trends.map((item, index) => {
                const maxValue = Math.max(
                  ...trends.map((t) => t.value),
                  100
                );

                return (
                  <div
                    key={`${item.date}-${index}`}
                    className="flex flex-1 flex-col items-center gap-2"
                  >

                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500">
                      {item.value.toFixed(1)}
                    </span>

                    <div className="flex h-44 w-full items-end">

                      <div
                        className="w-full rounded-t-lg bg-orange-500 transitionhover:bg-orange-600"
                        style={{
                          height: `${Math.max(
                            (item.value / maxValue) * 100,
                            3
                          )}%`,
                        }}
                      />

                    </div>

                    <span className="max-w-[60px] truncate text-[9px] font-semibold text-slate-400 dark:text-slate-500">
                      {item.date}
                    </span>

                  </div>
                );
              })
            ) : (
              <div className="flex w-full items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                No trend data available
              </div>
            )}

          </div>

          <div className="mt-4 text-center text-[10px] text-slate-400 dark:text-slate-500">
            Live backend hazard assessment data
          </div>

        </div>

        {/* HAZARD DISTRIBUTION */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">
                Hazard Distribution
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                Current habitation distribution by risk zone.
              </p>
            </div>

            <div className="rounded-lg bg-red-500 p-2">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>

          </div>

          <div className="mt-8 space-y-6">

            <DistributionRow
              label="Red Zone"
              value={overview?.hazard_distribution.RED ?? 0}
              total={overview?.hazard_distribution.RED ?? 0}
              color="bg-red-500"
            />

            <DistributionRow
              label="Warning Zone"
              value={
                overview?.hazard_distribution.WARNING ?? 0
              }
              total={
                overview
                  ? Object.values(
                      overview.hazard_distribution
                    ).reduce((a, b) => a + b, 0)
                  : 1
              }
              color="bg-orange-500"
            />

            <DistributionRow
              label="Safe Zone"
              value={overview?.hazard_distribution.SAFE ?? 0}
              total={
                overview
                  ? Object.values(
                      overview.hazard_distribution
                    ).reduce((a, b) => a + b, 0)
                  : 1
              }
              color="bg-emerald-500"
            />

          </div>

        </div>

      </div>

      {/* DISTRICT ANALYSIS */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">

        <div className="border-b border-slate-100 dark:border-slate-800 p-5">

          <h2 className="font-bold text-slate-900 dark:text-white">
            District Risk Analysis
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
            Live district-level risk calculated from village data.
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[800px]">

            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-left">

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">
                  District
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">
                  Risk
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">
                  Habitations
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">
                  Population
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">
                  Status
                </th>

              </tr>
            </thead>

            <tbody>

              {districts.length > 0 ? (
                districts.map((district, index) => (
                  <tr
                    key={`${district.name}-${index}`}
                    className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-800"
                  >

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2">
                          <MapPin className="h-4 w-4 text-slate-500 dark:text-slate-400 dark:text-slate-500" />
                        </div>

                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {district.name}
                        </span>

                      </div>

                    </td>

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">

                          <div
                            className={`h-full rounded-full ${
                              district.risk >= 80
                                ? "bg-red-500"
                                : district.risk >= 60
                                  ? "bg-orange-500"
                                  : "bg-emerald-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                district.risk,
                                100
                              )}%`,
                            }}
                          />

                        </div>

                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {district.risk.toFixed(1)}
                        </span>

                      </div>

                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {district.habitations}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {district.population.toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4">
                      <RiskStatus risk={district.risk} />
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-xs text-slate-400 dark:text-slate-500"
                  >
                    {loading
                      ? "Loading district data..."
                      : "No district data available"}
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* INSIGHTS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <Insight
          icon={AlertTriangle}
          title="Highest Risk District"
          value={
            districts.length > 0
              ? districts[0].name
              : "â€”"
          }
          description={
            districts.length > 0
              ? `Backend average risk score: ${districts[0].risk.toFixed(
                  1
                )}.`
              : "No district data available."
          }
        />

        <Insight
          icon={Users}
          title="Largest Exposure"
          value={
            districts.length > 0
              ? [...districts].sort(
                  (a, b) => b.population - a.population
                )[0].name
              : "â€”"
          }
          description={
            districts.length > 0
              ? `${Math.max(
                  ...districts.map((d) => d.population)
                ).toLocaleString("en-IN")} people assessed.`
              : "No population data available."
          }
        />

        <Insight
          icon={TrendingUp}
          title="Risk Direction"
          value={
            trends.length >= 2
              ? trendChange > 0
                ? "Increasing"
                : trendChange < 0
                  ? "Decreasing"
                  : "Stable"
              : "â€”"
          }
          description="Calculated from the backend hazard trend series."
        />

      </div>

      {/* FOOTNOTE */}
      <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-950 p-4 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">

        <ArrowUp className="h-4 w-4 text-orange-500 dark:text-orange-400" />

        Analytics is connected directly to the ResQVision backend.

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
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
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


/* DISTRIBUTION */

function DistributionRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage =
    total > 0 ? (value / total) * 100 : 0;

  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          {label}
        </span>

        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
          {value}
        </span>

      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">

        <div
          className={`h-full rounded-full ${color}`}
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />

      </div>

    </div>
  );
}


/* RISK STATUS */

function RiskStatus({
  risk,
}: {
  risk: number;
}) {
  if (risk >= 80) {
    return (
      <span className="flex w-fit items-center gap-1 rounded-full bg-red-100 dark:bg-red-950 px-3 py-1 text-[10px] font-bold text-red-700 dark:text-red-300">
        <ArrowUp className="h-3 w-3" />
        High
      </span>
    );
  }

  if (risk >= 60) {
    return (
      <span className="flex w-fit items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950 px-3 py-1 text-[10px] font-bold text-amber-700 dark:text-amber-300">
        <Activity className="h-3 w-3" />
        Moderate
      </span>
    );
  }

  return (
    <span className="flex w-fit items-center gap-1 rounded-full bg-green-100 dark:bg-green-950 px-3 py-1 text-[10px] font-bold text-green-700 dark:text-green-300">
      <ArrowDown className="h-3 w-3" />
      Lower
    </span>
  );
}


/* INSIGHT */

function Insight({
  icon: Icon,
  title,
  value,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">

      <div className="flex items-center gap-3">

        <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3">
          <Icon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        </div>

        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500">
          {title}
        </p>

      </div>

      <p className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-400 dark:text-slate-500">
        {description}
      </p>

    </div>
  );
}


export default Analytics;