import { useState } from "react";
import { apiRequest } from "../api/client";
import {
  Route,
  Users,
  Building2,
  MapPin,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Truck,
  Clock,
} from "lucide-react";

const relocationPlans = [
  {
    habitation: "Mahad Riverside",
    population: 420,
    site: "Raigad Emergency Shelter",
    capacity: 800,
    distance: "18 km",
    time: "42 min",
    status: "Ready",
  },
  {
    habitation: "Chiplun Valley",
    population: 365,
    site: "Ratnagiri Coastal Shelter",
    capacity: 450,
    distance: "24 km",
    time: "51 min",
    status: "Limited",
  },
  {
    habitation: "Karjat Hills",
    population: 280,
    site: "Thane Community Relief Centre",
    capacity: 600,
    distance: "31 km",
    time: "58 min",
    status: "Ready",
  },
  {
    habitation: "Igatpuri East",
    population: 310,
    site: "Nashik District Relief Centre",
    capacity: 500,
    distance: "16 km",
    time: "35 min",
    status: "Ready",
  },
];

function RelocationSimulation() {
  const [running, setRunning] = useState(false);
  const [backendMessage, setBackendMessage] = useState("");
  const [backendError, setBackendError] = useState("");

  async function runSimulation() {
    setRunning(true);
    setBackendMessage("");
    setBackendError("");

    try {
      const response = await apiRequest<{
        success: boolean;
        data?: {
          scenario_name?: string;
          feasible?: boolean;
          villages_simulated?: number;
          estimated_cost_inr?: number;
          estimated_duration_days?: number;
          warnings?: string[];
        };
      }>("/simulation/run", {
        method: "POST",
        body: JSON.stringify({
          scenario_name: "Heavy Rainfall",
          village_ids: [],
          site_assignments: {},
        }),
      });

      if (!response?.success) {
        throw new Error("Simulation backend returned an unsuccessful response.");
      }

      const result = response.data;
      setBackendMessage(
        `Backend simulation completed: ${result?.feasible ? "feasible" : "not feasible"}.`
      );
    } catch (err) {
      console.error("Simulation request failed:", err);
      setBackendError(
        err instanceof Error
          ? err.message
          : "Unable to run simulation through the backend."
      );
    } finally {
      setRunning(false);
    }
  }

  const totalPeople = relocationPlans.reduce(
    (sum, plan) => sum + plan.population,
    0
  );

  const readyPlans = relocationPlans.filter(
    (plan) => plan.status === "Ready"
  ).length;

  const limitedPlans = relocationPlans.filter(
    (plan) => plan.status === "Limited"
  ).length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">

      {/* HEADER */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
          <span className="h-2 w-2 rounded-full bg-orange-600 dark:bg-orange-400" />
          Emergency Planning
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Relocation Simulation
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Simulate relocation routes, destination capacity, travel
          time, and evacuation requirements.
        </p>
      </div>

      {/* BACKEND DATA STATUS */}
      <div
        className={`rounded-lg border px-4 py-3 ${
          backendError
            ? "border-red-900/60 bg-red-950/40"
            : "border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-[#001f21]"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              backendError ? "bg-red-100 dark:bg-red-950" : "bg-emerald-100 dark:bg-emerald-950"
            }`}
          >
            {backendError ? (
              <AlertTriangle className="h-5 w-5 text-red-400" />
            ) : (
              <Route className="h-5 w-5 text-emerald-400" />
            )}
          </div>

          <div className="min-w-0">
            <p
              className={`text-sm font-bold uppercase tracking-wide ${
                backendError ? "text-red-800 dark:text-red-100" : "text-emerald-900 dark:text-white"
              }`}
            >
              {backendError
                ? "BACKEND CONNECTION ERROR"
                : "SIMULATION ENGINE READY"}
            </p>

            <p
              className={`mt-0.5 text-xs ${
                backendError ? "text-red-700 dark:text-red-300" : "text-emerald-700 dark:text-emerald-400"
              }`}
            >
              {backendError ||
                "Simulation requests are connected directly to the ResQVision backend."}
            </p>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          title="People in Simulation"
          value={totalPeople.toLocaleString()}
          description="Population requiring movement"
          icon={Users}
        />

        <SummaryCard
          title="Relocation Plans"
          value={String(relocationPlans.length)}
          description="Active simulated routes"
          icon={Route}
        />

        <SummaryCard
          title="Ready Destinations"
          value={String(readyPlans)}
          description="Sites with available capacity"
          icon={ShieldCheck}
        />

        <SummaryCard
          title="Limited Destinations"
          value={String(limitedPlans)}
          description="Sites requiring monitoring"
          icon={Building2}
        />

      </div>

      {/* SIMULATION CONTROL */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">
              Simulation Parameters
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Configure the demonstration scenario.
            </p>
          </div>

          <button onClick={runSimulation} disabled={running} className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60">
            <Route className="h-4 w-4" />
            {running ? "Running..." : "Run Simulation"}
          </button>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          <Parameter
            label="Scenario"
            value="Heavy Rainfall"
          />

          <Parameter
            label="Evacuation Window"
            value="6 Hours"
          />

          <Parameter
            label="Transport Availability"
            value="12 Vehicles"
          />

        </div>

      </div>

      {(backendMessage || backendError) && (
        <div className={`rounded-xl border p-4 ${
          backendError
            ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40"
            : "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40"
        }`}>
          <p className={`text-sm font-semibold ${
            backendError ? "text-red-700 dark:text-red-300" : "text-emerald-700 dark:text-emerald-300"
          }`}>
            {backendError || backendMessage}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Endpoint: /api/v1/simulation/run
          </p>
        </div>
      )}

      {/* ROUTE FLOW */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">

        <div className="mb-6">
          <h2 className="font-bold text-slate-900 dark:text-white">
            Simulated Relocation Routes
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Habitation-to-safe-site assignments generated for the
            current scenario.
          </p>
        </div>

        <div className="space-y-4">

          {relocationPlans.map((plan) => {

            const occupancy =
              Math.round(
                (plan.population / plan.capacity) * 100
              );

            const limited = plan.status === "Limited";

            return (
              <div
                key={plan.habitation}
                className="rounded-xl border border-slate-200 dark:border-slate-700 p-4"
              >

                <div className="flex flex-col gap-5 xl:flex-row xl:items-center">

                  {/* SOURCE */}
                  <div className="flex flex-1 items-center gap-3">

                    <div className="rounded-lg bg-red-50 dark:bg-red-950/50 p-3">
                      <MapPin className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-400">
                        Origin
                      </p>

                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {plan.habitation}
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {plan.population.toLocaleString()} people
                      </p>
                    </div>

                  </div>

                  {/* ARROW */}
                  <div className="hidden items-center justify-center xl:flex">
                    <ArrowRight className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                  </div>

                  {/* DESTINATION */}
                  <div className="flex flex-1 items-center gap-3">

                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/50 p-3">
                      <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <div className="flex-1">
                      <p className="text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-400">
                        Destination
                      </p>

                      <div className="flex flex-wrap items-center gap-2">

                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {plan.site}
                        </p>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                            limited
                              ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                              : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                          }`}
                        >
                          {plan.status}
                        </span>

                      </div>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Capacity: {plan.capacity.toLocaleString()}
                      </p>
                    </div>

                  </div>

                  {/* DETAILS */}
                  <div className="flex flex-wrap gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">

                    <Detail
                      icon={MapPin}
                      label="Distance"
                      value={plan.distance}
                    />

                    <Detail
                      icon={Clock}
                      label="Travel"
                      value={plan.time}
                    />

                    <Detail
                      icon={Users}
                      label="Load"
                      value={`${occupancy}%`}
                    />

                  </div>

                </div>

              </div>
            );
          })}

        </div>
      </div>

      {/* TRANSPORT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3">
              <Truck className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </div>

            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">
                Transport Requirements
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Estimated resources for the current simulation.
              </p>
            </div>

          </div>

          <div className="mt-6 space-y-4">

            <ResourceRow
              label="Buses Required"
              value="9"
              available="12 available"
            />

            <ResourceRow
              label="Emergency Vehicles"
              value="6"
              available="8 available"
            />

            <ResourceRow
              label="Medical Vehicles"
              value="3"
              available="4 available"
            />

          </div>

        </div>

        {/* TIMELINE */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">

          <h2 className="font-bold text-slate-900 dark:text-white">
            Relocation Timeline
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Example sequence for an emergency relocation.
          </p>

          <div className="mt-6 space-y-5">

            <TimelineItem
              time="00:00"
              title="Alert Issued"
              description="High-risk habitations identified."
            />

            <TimelineItem
              time="00:30"
              title="Evacuation Begins"
              description="Transport resources dispatched."
            />

            <TimelineItem
              time="02:00"
              title="Primary Movement"
              description="Residents moved toward designated sites."
            />

            <TimelineItem
              time="05:30"
              title="Shelter Check"
              description="Arrival and accommodation verified."
            />

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

        <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3">
          <Icon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        </div>

      </div>

    </div>
  );
}


/* PARAMETER */

function Parameter({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
        {label}
      </label>

      <div className="mt-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
        {value}
      </div>
    </div>
  );
}


/* DETAIL */

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-[75px]">

      <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-400">
        <Icon className="h-3 w-3" />
        {label}
      </div>

      <p className="mt-1 text-xs font-bold text-slate-700 dark:text-slate-200">
        {value}
      </p>

    </div>
  );
}


/* RESOURCE */

function ResourceRow({
  label,
  value,
  available,
}: {
  label: string;
  value: string;
  available: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-950 p-4">

      <div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </p>

        <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">
          {available}
        </p>
      </div>

      <span className="text-xl font-bold text-slate-900 dark:text-white">
        {value}
      </span>

    </div>
  );
}


/* TIMELINE */

function TimelineItem({
  time,
  title,
  description,
}: {
  time: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">

      <div className="flex flex-col items-center">

        <div className="h-3 w-3 rounded-full bg-orange-500" />

        <div className="mt-1 h-full w-px bg-slate-200 dark:bg-slate-700" />

      </div>

      <div className="pb-4">

        <div className="flex items-center gap-3">

          <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
            {time}
          </span>

          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {title}
          </h3>

        </div>

        <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">
          {description}
        </p>

      </div>

    </div>
  );
}


export default RelocationSimulation;