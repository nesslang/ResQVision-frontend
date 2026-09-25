import { useEffect, useState } from "react";
import {
  AlertTriangle,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Activity,
  Droplets,
  Mountain,
  Waves,
  LocateFixed,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { apiRequest } from "../api/client";

type HazardItem = {
  id: number;
  village_id: number;
  village_name: string;
  district: string;

  population: number;
  elderly?: number;
  children?: number;
  disabled?: number;

  latitude: number;
  longitude: number;

  hazard_score: number;
  zone: "SAFE" | "WARNING" | "RED" | string;

  flood_risk: number;
  landslide_risk: number;
  earthquake_risk: number;
  drought_risk: number;
  cyclone_risk: number;

  rainfall: number;
  elevation: number;
  slope: number;
  distance_from_river: number;

  created_at?: string | null;
};

type HazardApiResponse = {
  success: boolean;
  data: {
    items: HazardItem[];
    total: number;
    limit: number;
    offset: number;
  };
};

function HazardAnalysis() {
  const [hazards, setHazards] = useState<HazardItem[]>([]);
  const [selectedHazard, setSelectedHazard] =
    useState<HazardItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [zoneFilter, setZoneFilter] = useState("ALL");
  const [districtFilter, setDistrictFilter] = useState("");

  useEffect(() => {
    fetchHazards();
  }, []);

  async function fetchHazards() {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest<HazardApiResponse>(
        "/hazards/",
        {
          method: "GET",
        }
      );

      if (
        !response ||
        !response.success ||
        !response.data ||
        !Array.isArray(response.data.items)
      ) {
        throw new Error(
          "Backend returned an invalid hazard response."
        );
      }

      setHazards(response.data.items);

      if (response.data.items.length > 0) {
        setSelectedHazard(response.data.items[0]);
      }
    } catch (err) {
      console.error("Hazard request failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load hazard data."
      );
    } finally {
      setLoading(false);
    }
  }

  const districts = Array.from(
    new Set(
      hazards
        .map((item) => item.district)
        .filter(Boolean)
    )
  ).sort();

  const filteredHazards = hazards.filter((item) => {
    const matchesZone =
      zoneFilter === "ALL" ||
      item.zone.toUpperCase() === zoneFilter;

    const matchesDistrict =
      districtFilter === "" ||
      item.district.toLowerCase() ===
        districtFilter.toLowerCase();

    return matchesZone && matchesDistrict;
  });

  const warningCount = hazards.filter(
    (item) => item.zone.toUpperCase() === "WARNING"
  ).length;

  const redCount = hazards.filter(
    (item) => item.zone.toUpperCase() === "RED"
  ).length;

  const averageRisk =
    hazards.length > 0
      ? Math.round(
          hazards.reduce(
            (sum, item) => sum + item.hazard_score,
            0
          ) / hazards.length
        )
      : 0;

  const populationAtRisk = hazards
    .filter((item) => item.zone.toUpperCase() !== "SAFE")
    .reduce(
      (sum, item) => sum + item.population,
      0
    );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
            <span className="h-2 w-2 rounded-full bg-orange-600 dark:bg-orange-400" />

            Maharashtra Hazard Intelligence
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hazard Analysis
          </h1>

          <p className="mt-1 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
            Analyze habitation-level hazard exposure,
            risk scores, environmental factors and
            geographic distribution across Maharashtra.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchHazards}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={
              loading
                ? "h-4 w-4 animate-spin"
                : "h-4 w-4"
            }
          />

          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* BACKEND DATA STATUS */}

      <div
        className={`rounded-lg border px-4 py-3 ${
          error
            ? "border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/40"
            : "border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-[#001f21]"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              error
                ? "bg-red-100 dark:bg-red-950"
                : "bg-emerald-100 dark:bg-emerald-950"
            }`}
          >
            {error ? (
              <AlertTriangle className="h-5 w-5 text-red-400" />
            ) : (
              <Activity className="h-5 w-5 text-emerald-400" />
            )}
          </div>

          <div className="min-w-0">
            <p
              className={`text-sm font-bold uppercase tracking-wide ${
                error
                  ? "text-red-800 dark:text-red-100"
                  : "text-emerald-900 dark:text-white"
              }`}
            >
              {error
                ? "BACKEND CONNECTION ERROR"
                : "LIVE BACKEND DATA"}
            </p>

            <p
              className={`mt-0.5 text-xs ${
                error
                  ? "text-red-700 dark:text-red-300"
                  : "text-emerald-700 dark:text-emerald-400"
              }`}
            >
              {error ||
                "Live hazard assessment data synchronized directly from the ResQVision backend database."}
            </p>
          </div>
        </div>
      </div>

      {/* ERROR */}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-red-100 dark:bg-red-950 p-2">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-red-800 dark:text-red-200">
                Backend request failed
              </h3>

              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error}
              </p>

              <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                Endpoint: /api/v1/hazards/
              </p>
            </div>

            <button
              type="button"
              onClick={fetchHazards}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-orange-500" />

          <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Loading hazard assessments...
          </p>

          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Connecting to the ResQVision FastAPI backend.
          </p>
        </div>
      )}

      {/* CONTENT */}

      {!loading && !error && (
        <>
          {/* KPI CARDS */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              title="Assessed Habitations"
              value={formatNumber(hazards.length)}
              icon={MapPin}
              iconClass="text-orange-600 dark:text-orange-400"
              bgClass="bg-orange-50 dark:bg-orange-950/50"
            />

            <StatCard
              title="Red Zone"
              value={formatNumber(redCount)}
              icon={ShieldAlert}
              iconClass="text-red-600 dark:text-red-400"
              bgClass="bg-red-50 dark:bg-red-950/50"
            />

            <StatCard
              title="Warning Zone"
              value={formatNumber(warningCount)}
              icon={AlertTriangle}
              iconClass="text-amber-600 dark:text-amber-400"
              bgClass="bg-amber-50 dark:bg-amber-950/50"
            />

            <StatCard
              title="Average Risk"
              value={`${averageRisk}/100`}
              icon={Activity}
              iconClass="text-blue-600 dark:text-blue-400"
              bgClass="bg-blue-50 dark:bg-blue-950/50"
            />

            <StatCard
              title="Population at Risk"
              value={formatNumber(populationAtRisk)}
              icon={LocateFixed}
              iconClass="text-red-600 dark:text-red-400"
              bgClass="bg-red-50 dark:bg-red-950/50"
            />
          </div>

          {/* FILTERS */}

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="flex-1">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Hazard Zone
                </label>

                <select
                  value={zoneFilter}
                  onChange={(event) =>
                    setZoneFilter(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-orange-400"
                >
                  <option value="ALL">
                    All Zones
                  </option>

                  <option value="RED">
                    Red Zone
                  </option>

                  <option value="WARNING">
                    Warning Zone
                  </option>

                  <option value="SAFE">
                    Safe Zone
                  </option>
                </select>
              </div>

              <div className="flex-1">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  District
                </label>

                <select
                  value={districtFilter}
                  onChange={(event) =>
                    setDistrictFilter(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-orange-400"
                >
                  <option value="">
                    All Districts
                  </option>

                  {districts.map((district) => (
                    <option
                      key={district}
                      value={district}
                    >
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-slate-800 px-5 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Showing
                </p>

                <p className="mt-1 text-lg font-bold text-slate-800 dark:text-slate-100">
                  {formatNumber(filteredHazards.length)}
                </p>
              </div>
            </div>
          </div>

          {/* MAP + DETAILS */}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* MAP */}

            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm xl:col-span-2">
              <div className="border-b border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-slate-600 dark:text-slate-300" />

                      <h2 className="font-bold text-slate-900 dark:text-white">
                        Maharashtra Hazard Map
                      </h2>
                    </div>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Select a habitation marker to inspect
                      its hazard assessment.
                    </p>
                  </div>

                  <div className="hidden items-center gap-3 text-[10px] font-semibold md:flex">
                    <LegendItem
                      label="Safe"
                      className="bg-emerald-500"
                    />

                    <LegendItem
                      label="Warning"
                      className="bg-amber-500"
                    />

                    <LegendItem
                      label="Red"
                      className="bg-red-500"
                    />
                  </div>
                </div>
              </div>

              <div className="hazard-map h-[520px]">
                <MapContainer
                  center={[19.7515, 75.7139]}
                  zoom={6}
                  scrollWheelZoom={true}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapViewUpdater
                    selected={selectedHazard}
                  />

                  <MapRecenterButton />

                  {filteredHazards.map((hazard) => (
                    <CircleMarker
                      key={hazard.id}
                      center={[
                        hazard.latitude,
                        hazard.longitude,
                      ]}
                      radius={
                        selectedHazard?.id === hazard.id
                          ? 10
                          : 7
                      }
                      pathOptions={{
                        color: getZoneColor(
                          hazard.zone
                        ),
                        fillColor: getZoneColor(
                          hazard.zone
                        ),
                        fillOpacity: 0.75,
                        weight:
                          selectedHazard?.id === hazard.id
                            ? 4
                            : 2,
                      }}
                      eventHandlers={{
                        click: () => {
                          setSelectedHazard(hazard);
                        },
                      }}
                    >
                      <Popup>
                        <div className="min-w-[190px]">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {hazard.village_name}
                          </p>

                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {hazard.district}
                          </p>

                          <div className="mt-3 space-y-1 text-xs">
                            <p>
                              Risk Score:{" "}
                              <strong>
                                {hazard.hazard_score}
                              </strong>
                            </p>

                            <p>
                              Zone:{" "}
                              <strong>
                                {hazard.zone}
                              </strong>
                            </p>

                            <p>
                              Population:{" "}
                              <strong>
                                {formatNumber(
                                  hazard.population
                                )}
                              </strong>
                            </p>
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            </div>

            {/* DETAILS */}

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
              <div className="border-b border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-slate-600 dark:text-slate-300" />

                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Habitation Details
                  </h2>
                </div>
              </div>

              {selectedHazard ? (
                <div className="p-5">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedHazard.village_name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {selectedHazard.district}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                          Hazard Score
                        </p>

                        <p
                          className={`mt-1 text-4xl font-bold ${getZoneTextClass(
                            selectedHazard.zone
                          )}`}
                        >
                          {selectedHazard.hazard_score}
                        </p>

                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          out of 100
                        </p>
                      </div>

                      <ZoneBadge
                        zone={selectedHazard.zone}
                      />
                    </div>
                  </div>

                  {/* POPULATION */}

                  <div className="mt-5">
                    <SectionTitle title="Population" />

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <DetailBox
                        label="Population"
                        value={formatNumber(
                          selectedHazard.population
                        )}
                      />

                      <DetailBox
                        label="Elderly"
                        value={formatNumber(
                          selectedHazard.elderly ?? 0
                        )}
                      />

                      <DetailBox
                        label="Children"
                        value={formatNumber(
                          selectedHazard.children ?? 0
                        )}
                      />

                      <DetailBox
                        label="Disabled"
                        value={formatNumber(
                          selectedHazard.disabled ?? 0
                        )}
                      />
                    </div>
                  </div>

                  {/* HAZARDS */}

                  <div className="mt-5">
                    <SectionTitle title="Hazard Exposure" />

                    <div className="mt-3 space-y-3">
                      <RiskBar
                        label="Flood"
                        value={selectedHazard.flood_risk}
                      />

                      <RiskBar
                        label="Landslide"
                        value={
                          selectedHazard.landslide_risk
                        }
                      />

                      <RiskBar
                        label="Earthquake"
                        value={
                          selectedHazard.earthquake_risk
                        }
                      />

                      <RiskBar
                        label="Drought"
                        value={
                          selectedHazard.drought_risk
                        }
                      />

                      <RiskBar
                        label="Cyclone"
                        value={
                          selectedHazard.cyclone_risk
                        }
                      />
                    </div>
                  </div>

                  {/* ENVIRONMENT */}

                  <div className="mt-5">
                    <SectionTitle title="Environmental Factors" />

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <DetailBox
                        label="Rainfall"
                        value={`${formatDecimal(
                          selectedHazard.rainfall
                        )} mm`}
                        icon={Droplets}
                      />

                      <DetailBox
                        label="Elevation"
                        value={`${formatDecimal(
                          selectedHazard.elevation
                        )} m`}
                        icon={Mountain}
                      />

                      <DetailBox
                        label="Slope"
                        value={`${formatDecimal(
                          selectedHazard.slope
                        )}°`}
                      />

                      <DetailBox
                        label="River Distance"
                        value={`${formatDecimal(
                          selectedHazard.distance_from_river
                        )} km`}
                        icon={Waves}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center">
                  <MapPin className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />

                  <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Select a habitation
                  </p>

                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Click a marker on the map to view
                    its details.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* HABITATION TABLE */}

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
            <div className="border-b border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Hazard Assessment List
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Habitations ordered by hazard score.
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                  {formatNumber(
                    filteredHazards.length
                  )}{" "}
                  Results
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    <th className="px-5 py-3">
                      Habitation
                    </th>

                    <th className="px-5 py-3">
                      District
                    </th>

                    <th className="px-5 py-3">
                      Population
                    </th>

                    <th className="px-5 py-3">
                      Risk Score
                    </th>

                    <th className="px-5 py-3">
                      Zone
                    </th>

                    <th className="px-5 py-3">
                      Rainfall
                    </th>

                    <th className="px-5 py-3">
                      Slope
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredHazards.map((hazard) => (
                    <tr
                      key={hazard.id}
                      onClick={() =>
                        setSelectedHazard(hazard)
                      }
                      className="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/70"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {hazard.village_name}
                        </p>

                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          ID #{hazard.village_id}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {hazard.district}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {formatNumber(
                          hazard.population
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`text-lg font-bold ${getZoneTextClass(
                            hazard.zone
                          )}`}
                        >
                          {hazard.hazard_score}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <ZoneBadge
                          zone={hazard.zone}
                        />
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {formatDecimal(
                          hazard.rainfall
                        )}{" "}
                        mm
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {formatDecimal(
                          hazard.slope
                        )}
                        °
                      </td>
                    </tr>
                  ))}

                  {filteredHazards.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center"
                      >
                        <MapPin className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />

                        <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                          No habitations found
                        </p>

                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          Try changing the selected
                          filters.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* FOOTER */}

          <div className="border-t border-slate-200 dark:border-slate-700 pt-5">
            <div className="flex flex-col gap-1 text-[10px] font-medium text-slate-400 dark:text-slate-500 md:flex-row md:items-center md:justify-between">
              <span>
                ResQVision • Disaster Response Decision
                Support
              </span>

              <span>
                LIVE BACKEND DATA • AI-ASSISTED • HUMAN
                DECISION REQUIRED
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   MAP CONTROLLER
   ============================================================ */

function MapRecenterButton() {
  const map = useMap();

  function recenterMap() {
    map.flyTo([19.7515, 75.7139], 6, {
      duration: 0.8,
    });
  }

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar !border-0 !bg-transparent">
        <button
          type="button"
          onClick={recenterMap}
          title="Recenter Maharashtra"
          aria-label="Recenter Maharashtra hazard map"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-md transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <LocateFixed className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function MapViewUpdater({
  selected,
}: {
  selected: HazardItem | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!selected) {
      return;
    }

    map.flyTo(
      [selected.latitude, selected.longitude],
      Math.max(map.getZoom(), 8),
      {
        duration: 0.8,
      }
    );
  }, [selected, map]);

  return null;
}

/* ============================================================
   STAT CARD
   ============================================================ */

function StatCard({
  title,
  value,
  icon: Icon,
  iconClass,
  bgClass,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  iconClass: string;
  bgClass: string;
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
        </div>

        <div className={`rounded-lg p-3 ${bgClass}`}>
          <Icon
            className={`h-5 w-5 ${iconClass}`}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   LEGEND
   ============================================================ */

function LegendItem({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`h-2.5 w-2.5 rounded-full ${className}`}
      />

      <span>{label}</span>
    </div>
  );
}

/* ============================================================
   ZONE BADGE
   ============================================================ */

function ZoneBadge({
  zone,
}: {
  zone: string;
}) {
  const normalized = zone.toUpperCase();

  let className =
    "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300";

  if (normalized === "RED") {
    className = "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300";
  }

  if (normalized === "WARNING") {
    className = "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300";
  }

  if (normalized === "SAFE") {
    className = "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300";
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${className}`}
    >
      {zone}
    </span>
  );
}

/* ============================================================
   SECTION TITLE
   ============================================================ */

function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
      {title}
    </p>
  );
}

/* ============================================================
   DETAIL BOX
   ============================================================ */

function DetailBox({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{
    className?: string;
  }>;
}) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
        )}

        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
          {label}
        </p>
      </div>

      <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   RISK BAR
   ============================================================ */

function RiskBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const safeValue = Math.max(
    0,
    Math.min(Number(value) || 0, 100)
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
          {label}
        </span>

        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
          {safeValue}
        </span>
      </div>

      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full ${getRiskBarClass(
            safeValue
          )}`}
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>
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

function formatDecimal(value: number): string {
  return Number.isFinite(value)
    ? value.toFixed(1)
    : "0.0";
}

function getZoneColor(zone: string): string {
  const normalized = zone.toUpperCase();

  if (normalized === "RED") {
    return "#dc2626";
  }

  if (normalized === "WARNING") {
    return "#d97706";
  }

  if (normalized === "SAFE") {
    return "#059669";
  }

  return "#64748b";
}

function getZoneTextClass(zone: string): string {
  const normalized = zone.toUpperCase();

  if (normalized === "RED") {
    return "text-red-700 dark:text-red-300";
  }

  if (normalized === "WARNING") {
    return "text-amber-700 dark:text-amber-300";
  }

  if (normalized === "SAFE") {
    return "text-emerald-700 dark:text-emerald-300";
  }

  return "text-slate-700 dark:text-slate-200";
}

function getRiskBarClass(value: number): string {
  if (value >= 70) {
    return "bg-red-500";
  }

  if (value >= 40) {
    return "bg-amber-500";
  }

  return "bg-emerald-500";
}

export default HazardAnalysis;