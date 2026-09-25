import { useEffect, useMemo, useState } from "react";
import {
Users,
AlertTriangle,
MapPin,
Clock,
ShieldAlert,
Search,
ArrowUp,
Baby,
Accessibility,
Home,
} from "lucide-react";
import { apiRequest } from "../api/client";

interface PriorityItem {
id: number;
village_id: number;
village_name: string;
district: string;
population: number;
elderly: number;
children: number;
disabled: number;
latitude: number;
longitude: number;
hazard_score: number;
hazard_zone: string;
vulnerability_score: number;
priority_score: number;
priority_category: string;
}

interface PriorityResponse {
success: boolean;
data: {
items: PriorityItem[];
total: number;
limit: number;
offset: number;
};
}

type NormalizedCategory =
| "IMMEDIATE"
| "SHORT_TERM"
| "MEDIUM_TERM"
| "OTHER";

function normalizeCategory(category: string): NormalizedCategory {
const value = String(category || "")
.trim()
.toUpperCase()
.replace(/[\s-]+/g, "_");

if (
value === "IMMEDIATE" ||
value === "URGENT" ||
value === "CRITICAL"
) {
return "IMMEDIATE";
}

if (
value === "SHORT_TERM" ||
value === "SHORTTERM" ||
value === "HIGH"
) {
return "SHORT_TERM";
}

if (
value === "MEDIUM_TERM" ||
value === "MEDIUMTERM" ||
value === "PLANNED" ||
value === "LONG_TERM" ||
value === "LONGTERM"
) {
return "MEDIUM_TERM";
}

return "OTHER";
}

function formatNumber(value: number): string {
return Number.isFinite(value)
? value.toLocaleString("en-IN")
: "0";
}

function RelocationPriority() {
const [habitations, setHabitations] = useState<PriorityItem[]>([]);
const [total, setTotal] = useState(0);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [search, setSearch] = useState("");

useEffect(() => {
loadPriorityData();
}, []);

async function loadPriorityData() {
setLoading(true);
setError("");

try {
  const response = await apiRequest<PriorityResponse>(
    "/priority/?limit=100",
    {
      method: "GET",
    }
  );

  if (!response || !response.success || !response.data) {
    throw new Error("Invalid response from backend.");
  }

  setHabitations(response.data.items || []);
  setTotal(response.data.total || 0);
} catch (err) {
  console.error("Priority API error:", err);

  setError(
    err instanceof Error
      ? err.message
      : "Unable to load relocation priority data."
  );
} finally {
  setLoading(false);
}


}

const filteredHabitations = useMemo(() => {
const query = search.trim().toLowerCase();


if (!query) {
  return habitations;
}

return habitations.filter((item) => {
  return (
    item.village_name.toLowerCase().includes(query) ||
    item.district.toLowerCase().includes(query) ||
    item.priority_category.toLowerCase().includes(query) ||
    item.hazard_zone.toLowerCase().includes(query)
  );
});

}, [habitations, search]);

const immediate = habitations.filter(
(item) => normalizeCategory(item.priority_category) === "IMMEDIATE"
);

const shortTerm = habitations.filter(
(item) => normalizeCategory(item.priority_category) === "SHORT_TERM"
);

const mediumTerm = habitations.filter(
(item) => normalizeCategory(item.priority_category) === "MEDIUM_TERM"
);

const totalPopulation = habitations.reduce(
(sum, item) => sum + (Number(item.population) || 0),
0
);

const totalElderlyChildren = habitations.reduce(
(sum, item) =>
sum +
(Number(item.elderly) || 0) +
(Number(item.children) || 0),
0
);

const totalDisabled = habitations.reduce(
(sum, item) => sum + (Number(item.disabled) || 0),
0
);

const highVulnerability = habitations.filter(
(item) => Number(item.vulnerability_score) >= 30
).length;

const highHazard = habitations.filter(
(item) => Number(item.hazard_score) >= 60
).length;

return ( <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">

  {/* HEADER */}

  <div>
    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
      <span className="h-2 w-2 rounded-full bg-orange-600 dark:bg-orange-400" />
      Emergency Relocation
    </div>

    <h1 className="text-3xl font-bold text-slate-900 dark:text-white dark:text-white">
      Relocation Priority
    </h1>

    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
      Identify vulnerable habitations and determine relocation
      priority using hazard and vulnerability indicators.
    </p>
  </div>

  {/* BACKEND STATUS */}

  <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/50 dark:bg-emerald-950/50 p-4">
    <div className="flex items-start gap-3">

      <div className="rounded-lg bg-emerald-100 dark:bg-emerald-950 dark:bg-emerald-950 p-2">
        <ShieldAlert className="h-5 w-5 text-emerald-700 dark:text-emerald-300 dark:text-emerald-300" />
      </div>

      <div>
        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200 dark:text-emerald-100">
          BACKEND PRIORITY DATA
        </p>

        <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300 dark:text-emerald-300">
          Priority information is loaded from the ResQVision backend.
        </p>
      </div>

    </div>
  </div>

  {/* ERROR */}

  {error && (
    <div className="rounded-xl border border-red-200 dark:border-red-900 dark:border-red-900 bg-red-50 dark:bg-red-950/50 dark:bg-red-950/50 p-4">

      <div className="flex items-start gap-3">

        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 dark:text-red-400" />

        <div className="flex-1">

          <p className="text-sm font-bold text-red-700 dark:text-red-300 dark:text-red-300">
            Backend Connection Error
          </p>

          <p className="mt-1 text-xs text-red-600 dark:text-red-400 dark:text-red-400">
            {error}
          </p>

          <p className="mt-2 text-[11px] text-red-500 dark:text-red-400">
            /api/v1/priority/
          </p>

        </div>

        <button
          type="button"
          onClick={loadPriorityData}
          className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
        >
          Retry
        </button>

      </div>
    </div>
  )}

  {/* CONTENT */}

  {loading ? (
    <LoadingState />
  ) : (
    <>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          title="Immediate"
          value={formatNumber(immediate.length)}
          description="Highest relocation priority"
          icon={ShieldAlert}
          iconClass="text-red-600 dark:text-red-400 dark:text-red-400"
          bgClass="bg-red-50 dark:bg-red-950/50 dark:bg-red-950/50"
        />

        <SummaryCard
          title="Short Term"
          value={formatNumber(shortTerm.length)}
          description="Requires early planning"
          icon={ArrowUp}
          iconClass="text-orange-600 dark:text-orange-400"
          bgClass="bg-orange-600 dark:bg-orange-400"
        />

        <SummaryCard
          title="Medium Term"
          value={formatNumber(mediumTerm.length)}
          description="Planned relocation"
          icon={Clock}
          iconClass="text-amber-600 dark:text-amber-400 dark:text-amber-400"
          bgClass="bg-amber-50 dark:bg-amber-950/50 dark:bg-amber-950/50"
        />

        <SummaryCard
          title="Population Assessed"
          value={formatNumber(totalPopulation)}
          description={`${total} habitations from backend`}
          icon={Users}
          iconClass="text-slate-600 dark:text-slate-300 dark:text-slate-600 dark:text-slate-300 dark:text-slate-600"
          bgClass="bg-slate-100 dark:bg-slate-800"
        />

      </div>

      {/* PRIORITY LIST */}

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-900 p-5 shadow-sm">

        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">

          <div>
            <h2 className="font-bold text-slate-900 dark:text-white dark:text-white">
              Habitation Priority List
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
              Showing {filteredHabitations.length} of {total} backend records.
            </p>
          </div>

          <button
            type="button"
            onClick={loadPriorityData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            Refresh
          </button>

        </div>

        <div className="relative mt-4 max-w-md">

          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500" />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search habitation or district..."
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-orange-400 dark:focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
          />

        </div>

      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-900 shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1000px]">

            <thead>

              <tr className="border-b border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:bg-slate-950 text-left">

                <TableHeader>
                  Habitation
                </TableHeader>

                <TableHeader>
                  Population
                </TableHeader>

                <TableHeader>
                  Risk
                </TableHeader>

                <TableHeader>
                  Vulnerability
                </TableHeader>

                <TableHeader>
                  Priority
                </TableHeader>

                <TableHeader>
                  Category
                </TableHeader>

              </tr>

            </thead>

            <tbody>

              {filteredHabitations.length === 0 ? (

                <tr>

                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center"
                  >

                    <Search className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />

                    <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300 dark:text-slate-600 dark:text-slate-300 dark:text-slate-600">
                      No habitations found
                    </p>

                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
                      Try another habitation, district or category.
                    </p>

                  </td>

                </tr>

              ) : (

                filteredHabitations.map((item) => (
                  <PriorityTableRow
                    key={item.id}
                    item={item}
                  />
                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* LOWER INFORMATION */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* VULNERABILITY */}

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-900 p-5 shadow-sm">

          <h2 className="font-bold text-slate-900 dark:text-white dark:text-white">
            Vulnerability Indicators
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
            Population characteristics relevant to relocation planning.
          </p>

          <div className="mt-6 space-y-4">

            <Indicator
              icon={Baby}
              title="Children & Elderly"
              value={formatNumber(totalElderlyChildren)}
              description="People requiring additional support"
            />

            <Indicator
              icon={Accessibility}
              title="Disability"
              value={formatNumber(totalDisabled)}
              description="People requiring accessible relocation"
            />

            <Indicator
              icon={Home}
              title="High Vulnerability"
              value={`${formatNumber(highVulnerability)} areas`}
              description="Areas with vulnerability scores of 30 or higher"
            />

            <Indicator
              icon={MapPin}
              title="High Hazard Exposure"
              value={`${formatNumber(highHazard)} areas`}
              description="Areas with hazard scores of 60 or higher"
            />

          </div>

        </div>

        {/* SCORE EXPLANATION */}

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-900 p-5 shadow-sm">

          <h2 className="font-bold text-slate-900 dark:text-white dark:text-white">
            Priority Score
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
            Scores and classifications are returned by the backend.
          </p>

          <div className="mt-6 space-y-4">

            <ScoreExplanation
              title="Hazard Score"
              description="Overall hazard exposure for the habitation."
            />

            <ScoreExplanation
              title="Vulnerability Score"
              description="Population vulnerability based on demographic indicators."
            />

            <ScoreExplanation
              title="Priority Score"
              description="Combined score used to determine relocation priority."
            />

            <ScoreExplanation
              title="Priority Category"
              description="Backend classification indicating the relocation planning timeframe."
            />

          </div>

        </div>

      </div>

      {/* CATEGORY LEGEND */}

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-900 p-5 shadow-sm">

        <h2 className="font-bold text-slate-900 dark:text-white dark:text-white">
          Relocation Categories
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">

          <LegendCard
            title="Immediate"
            description="Requires the highest priority attention."
            className="border-red-200 dark:border-red-900 dark:border-red-900 bg-red-50 dark:bg-red-950/50 dark:bg-red-950/50"
            textClass="text-red-700 dark:text-red-300 dark:text-red-300"
          />

          <LegendCard
            title="Short Term"
            description="Requires early relocation planning."
            className="border-orange-200 dark:border-orange-900 dark:border-orange-900 bg-orange-600 dark:bg-orange-400"
            textClass="text-orange-700 dark:text-orange-300 dark:text-orange-300"
          />

          <LegendCard
            title="Medium Term"
            description="Requires planned relocation preparation."
            className="border-amber-200 dark:border-amber-900 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/50 dark:bg-amber-950/50"
            textClass="text-amber-700 dark:text-amber-300 dark:text-amber-300"
          />

        </div>

      </div>

    </>
  )}

  {/* FOOTER */}

  <div className="border-t border-slate-200 dark:border-slate-700 dark:border-slate-700 pt-4 text-center text-[11px] text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
    ResQVision • Disaster Response Decision Support
  </div>

</div>

);
}

function TableHeader({
children,
}: {
children: React.ReactNode;
}) {
return ( <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
{children} </th>
);
}

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
return ( <div className="rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-900 p-5 shadow-sm">

  <div className="flex items-start justify-between">

    <div>

      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
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

function PriorityTableRow({
item,
}: {
item: PriorityItem;
}) {
return ( <tr className="border-b border-slate-100 dark:border-slate-800 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800">


  <td className="px-5 py-4">

    <div className="flex items-center gap-3">

      <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2">
        <MapPin className="h-4 w-4 text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500" />
      </div>

      <div>

        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100">
          {item.village_name}
        </p>

        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
          {item.district}
        </p>

      </div>

    </div>

  </td>

  <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300 dark:text-slate-600 dark:text-slate-300 dark:text-slate-600">
    {formatNumber(Number(item.population) || 0)}
  </td>

  <td className="px-5 py-4">
    <ScoreBar score={Number(item.hazard_score) || 0} />
  </td>

  <td className="px-5 py-4">
    <ScoreBar score={Number(item.vulnerability_score) || 0} />
  </td>

  <td className="px-5 py-4">

    <span className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">
      {Number(item.priority_score || 0).toFixed(2)}
    </span>

  </td>

  <td className="px-5 py-4">

    <CategoryBadge
      category={item.priority_category}
    />

  </td>

</tr>


);
}

function ScoreBar({
score,
}: {
score: number;
}) {
const safeScore = Math.max(
0,
Math.min(100, Number(score) || 0)
);

let barClass = "bg-amber-400";

if (safeScore >= 80) {
barClass = "bg-red-50 dark:bg-red-950/50 dark:bg-red-950/50";
} else if (safeScore >= 60) {
barClass = "bg-orange-600 dark:bg-orange-400";
}

return ( <div className="flex items-center gap-3">


  <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">

    <div
      className={`h-full rounded-full ${barClass}`}
      style={{
        width: `${safeScore}%`,
      }}
    />

  </div>

  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-200">
    {safeScore.toFixed(2)}
  </span>

</div>


);
}

function CategoryBadge({
category,
}: {
category: string;
}) {
const normalized = normalizeCategory(category);

let className = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 dark:text-slate-600 dark:text-slate-300 dark:text-slate-600";
let displayName = "OTHER";

if (normalized === "IMMEDIATE") {
className = "bg-red-100 dark:bg-red-950 dark:bg-red-950 text-red-700 dark:text-red-300 dark:text-red-300";
displayName = "IMMEDIATE";
}

if (normalized === "SHORT_TERM") {
className = "bg-orange-100 dark:bg-orange-950 dark:bg-orange-950 text-orange-700 dark:text-orange-300 dark:text-orange-300";
displayName = "SHORT TERM";
}

if (normalized === "MEDIUM_TERM") {
className = "bg-amber-100 dark:bg-amber-950 dark:bg-amber-950 text-amber-700 dark:text-amber-300 dark:text-amber-300";
displayName = "MEDIUM TERM";
}

return (
<span
className={`rounded-full px-3 py-1 text-[10px] font-bold ${className}`}
>
{displayName} </span>
);
}

function Indicator({
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
return ( <div className="flex items-center gap-4 rounded-lg bg-slate-50 dark:bg-slate-800 dark:bg-slate-950 p-4">

  <div className="rounded-lg bg-white dark:bg-slate-900 dark:bg-slate-900 p-2 shadow-sm">
    <Icon className="h-5 w-5 text-slate-600 dark:text-slate-300 dark:text-slate-600 dark:text-slate-300 dark:text-slate-600" />
  </div>

  <div className="flex-1">

    <div className="flex items-center justify-between gap-3">

      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-200">
        {title}
      </p>

      <span className="text-sm font-bold text-slate-900 dark:text-white dark:text-white">
        {value}
      </span>

    </div>

    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
      {description}
    </p>

  </div>

</div>

);
}

function ScoreExplanation({
title,
description,
}: {
title: string;
description: string;
}) {
return ( <div>


  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-200">
    {title}
  </p>

  <p className="mt-1 text-xs leading-5 text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
    {description}
  </p>

</div>

);
}

function LegendCard({
title,
description,
className,
textClass,
}: {
title: string;
description: string;
className: string;
textClass: string;
}) {
return (
<div className={`rounded-lg border p-4 ${className}`}>

  <p className={`text-sm font-bold ${textClass}`}>
    {title}
  </p>

  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
    {description}
  </p>

</div>

);
}

function LoadingState() {
return ( <div className="rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-900 p-12 shadow-sm">


  <div className="flex flex-col items-center justify-center">

    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 dark:border-slate-700 border-t-orange-500" />

    <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-200">
      Loading relocation priority data...
    </p>

    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
      Connecting to the ResQVision backend.
    </p>

  </div>

</div>
);
}
export default RelocationPriority;