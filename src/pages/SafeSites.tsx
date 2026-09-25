import { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Users,
  Search,
  ShieldCheck,
  AlertTriangle,
  Droplets,
  HeartPulse,
  Route,
  Building2,
  LandPlot,
  RefreshCw,
} from "lucide-react";

import { getSites, type RelocationSite } from "../api/sites";

function SafeSites() {
  const [sites, setSites] = useState<RelocationSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSite, setSelectedSite] =
    useState<RelocationSite | null>(null);

  async function loadSites() {
    try {
      setLoading(true);
      setError("");

      const response = await getSites({
        limit: 500,
        offset: 0,
      });

      setSites(response.data.items);

      if (response.data.items.length > 0) {
        setSelectedSite(response.data.items[0]);
      }
    } catch (err) {
      console.error("Failed to load relocation sites:", err);

      setError(
        "Unable to load relocation sites from the backend.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSites();
  }, []);

  const filteredSites = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return sites;
    }

    return sites.filter(
      (site) =>
        site.name.toLowerCase().includes(value) ||
        site.district.toLowerCase().includes(value),
    );
  }, [sites, search]);

  const totalCapacity = sites.reduce(
    (sum, site) => sum + site.capacity,
    0,
  );

  const totalCurrentPopulation = sites.reduce(
    (sum, site) => sum + site.current_population,
    0,
  );

  const totalAvailableCapacity = sites.reduce(
    (sum, site) => sum + site.available_capacity,
    0,
  );

  const averageSuitability =
    sites.length > 0
      ? sites.reduce(
          (sum, site) => sum + site.suitability_score,
          0,
        ) / sites.length
      : 0;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
          Relocation Infrastructure
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Safe Relocation Sites
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review candidate relocation sites, available capacity,
              infrastructure and suitability indicators.
            </p>
          </div>

          <button
            onClick={loadSites}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Refresh Sites
          </button>
        </div>
      </div>

      {/* API STATUS */}
      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-red-100 dark:bg-red-950 p-2">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>

            <div>
              <p className="text-sm font-bold text-red-800 dark:text-red-100">
                Backend Connection Error
              </p>

              <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Sites Available"
          value={String(sites.length)}
          description="Candidate relocation sites"
          icon={MapPin}
          iconClass="text-emerald-600 dark:text-emerald-400"
          bgClass="bg-emerald-50 dark:bg-emerald-950/50"
        />

        <SummaryCard
          title="Available Capacity"
          value={totalAvailableCapacity.toLocaleString()}
          description="Unoccupied relocation capacity"
          icon={Users}
          iconClass="text-blue-600 dark:text-blue-400"
          bgClass="bg-blue-50 dark:bg-blue-950/50"
        />

        <SummaryCard
          title="Current Population"
          value={totalCurrentPopulation.toLocaleString()}
          description="People currently assigned"
          icon={Building2}
          iconClass="text-orange-600 dark:text-orange-400"
          bgClass="bg-orange-50 dark:bg-orange-950/50"
        />

        <SummaryCard
          title="Average Suitability"
          value={`${averageSuitability.toFixed(1)}`}
          description="Across available sites"
          icon={ShieldCheck}
          iconClass="text-emerald-600 dark:text-emerald-400"
          bgClass="bg-emerald-50 dark:bg-emerald-950/50"
        />
      </div>

      {/* CAPACITY OVERVIEW */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">
              Relocation Capacity
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Total capacity and current occupancy across candidate
              sites.
            </p>
          </div>

          <div className="text-sm text-slate-600 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-white">
              {totalCurrentPopulation.toLocaleString()}
            </span>{" "}
            occupied /{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              {totalCapacity.toLocaleString()}
            </span>{" "}
            total
          </div>
        </div>

        <div className="mt-5">
          <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{
                width: `${
                  totalCapacity > 0
                    ? Math.min(
                        (totalCurrentPopulation /
                          totalCapacity) *
                          100,
                        100,
                      )
                    : 0
                }%`,
              }}
            />
          </div>

          <div className="mt-2 flex justify-between text-xs text-slate-400 dark:text-slate-400">
            <span>
              {totalAvailableCapacity.toLocaleString()} available
            </span>

            <span>
              {totalCapacity > 0
                ? (
                    (totalCurrentPopulation / totalCapacity) *
                    100
                  ).toFixed(1)
                : "0.0"}
              % occupied
            </span>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">
              Candidate Relocation Sites
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Data loaded directly from the ResQVision backend.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search site or district..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-10 text-center shadow-sm">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-emerald-600 dark:text-emerald-400" />

          <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Loading relocation sites...
          </p>

          <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">
            Connecting to the ResQVision backend.
          </p>
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && filteredSites.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-10 text-center shadow-sm">
          <MapPin className="mx-auto h-8 w-8 text-slate-300" />

          <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            No relocation sites found
          </p>

          <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">
            Try a different site name or district.
          </p>
        </div>
      )}

      {/* TABLE */}
      {!loading && filteredSites.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-left">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Site
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Capacity
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Available
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Suitability
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Safety
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Infrastructure
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredSites.map((site) => (
                  <tr
                    key={site.id}
                    className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800"
                  >
                    {/* SITE */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/50 p-2">
                          <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {site.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">
                            {site.district}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CAPACITY */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {site.capacity.toLocaleString()}
                        </p>

                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">
                          {site.current_population.toLocaleString()} occupied
                        </p>
                      </div>
                    </td>

                    {/* AVAILABLE */}
                    <td className="px-5 py-4">
                      <span
                        className={`text-sm font-bold ${
                          site.available_capacity > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {site.available_capacity.toLocaleString()}
                      </span>
                    </td>

                    {/* SUITABILITY */}
                    <td className="px-5 py-4">
                      <ScoreBar
                        score={site.suitability_score}
                      />
                    </td>

                    {/* SAFETY */}
                    <td className="px-5 py-4">
                      <ScoreBar score={site.safety_score} />
                    </td>

                    {/* INFRASTRUCTURE */}
                    <td className="px-5 py-4">
                      <ScoreBar
                        score={site.infrastructure_score}
                      />
                    </td>

                    {/* ACTION */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedSite(site)}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SELECTED SITE DETAILS */}
      {selectedSite && !loading && (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />

                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedSite.name}
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {selectedSite.district} • Site ID{" "}
                {selectedSite.site_id}
              </p>

              <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">
                Coordinates:{" "}
                {selectedSite.latitude.toFixed(5)},{" "}
                {selectedSite.longitude.toFixed(5)}
              </p>
            </div>

            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/50 px-4 py-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                Suitability
              </p>

              <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {selectedSite.suitability_score}
              </p>

              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                / 100
              </p>
            </div>
          </div>

          {/* SITE METRICS */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              icon={Users}
              title="Available Capacity"
              value={selectedSite.available_capacity.toLocaleString()}
            />

            <Metric
              icon={ShieldCheck}
              title="Safety"
              value={`${selectedSite.safety_score}`}
            />

            <Metric
              icon={Building2}
              title="Infrastructure"
              value={`${selectedSite.infrastructure_score}`}
            />

            <Metric
              icon={LandPlot}
              title="Land"
              value={`${selectedSite.land_score}`}
            />
          </div>

          {/* ADDITIONAL INDICATORS */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              icon={Route}
              title="Accessibility"
              value={`${selectedSite.accessibility_score}`}
            />

            <Metric
              icon={Droplets}
              title="Water"
              value={`${selectedSite.water_score}`}
            />

            <Metric
              icon={HeartPulse}
              title="Healthcare"
              value={`${selectedSite.healthcare_score}`}
            />

            <Metric
              icon={Users}
              title="Current Population"
              value={selectedSite.current_population.toLocaleString()}
            />
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4 text-center text-[11px] text-slate-400 dark:text-slate-400">
        ResQVision • Disaster Response Decision Support
        <span className="mx-2">•</span>
        Backend-connected site data
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
  iconClass,
  bgClass,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  iconClass: string;
  bgClass: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">
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


/* SCORE BAR */

function ScoreBar({
  score,
}: {
  score: number;
}) {
  const barClass =
    score >= 80
      ? "bg-emerald-500"
      : score >= 60
        ? "bg-blue-500"
        : "bg-amber-400";

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full ${barClass}`}
          style={{
            width: `${Math.min(Math.max(score, 0), 100)}%`,
          }}
        />
      </div>

      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
        {score}
      </span>
    </div>
  );
}


/* METRIC */

function Metric({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-white dark:bg-slate-900 p-2 shadow-sm">
          <Icon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </div>

        <div>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}


export default SafeSites;