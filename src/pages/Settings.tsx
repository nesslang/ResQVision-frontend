import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  Map,
  Database,
  Shield,
  Save,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

import { apiRequest } from "../api/client";

type SettingsResponse = {
  success: boolean;
  data: {
    app_name: string;
    debug: boolean;
    model_dir: string;
    model_cache_ttl: number;
    max_upload_size_mb: number;
    allowed_extensions: string[];
    optimization: {
      max_iterations: number;
      time_limit_seconds: number;
    };
  };
};

function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState("30");
  const [mapMode, setMapMode] = useState("Risk Zones");
  const [saved, setSaved] = useState(false);

  const [backendStatus, setBackendStatus] =
    useState<"Checking..." | "Connected" | "Offline">("Checking...");

  const [appName, setAppName] = useState("RESQVision");
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    async function loadBackendSettings() {
      try {
        const result = await apiRequest<SettingsResponse>("/settings/app", {
          method: "GET",
        });

        if (result.success) {
          setAppName(result.data.app_name);
          setDebug(result.data.debug);
          setBackendStatus("Connected");
        } else {
          setBackendStatus("Offline");
        }
      } catch (error) {
        console.error("Failed to connect to backend:", error);
        setBackendStatus("Offline");
      }
    }

    loadBackendSettings();
  }, []);

  function saveSettings() {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  }

  function resetSettings() {
    setNotifications(true);
    setCriticalAlerts(true);
    setAutoRefresh(true);
    setRefreshInterval("30");
    setMapMode("Risk Zones");
    setSaved(false);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
          <span className="h-2 w-2 rounded-full bg-orange-600 dark:bg-orange-400" />
          System Configuration
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Configure dashboard behaviour, alerts, map preferences, and system
          settings.
        </p>
      </div>

      {/* SAVED MESSAGE */}
      {saved && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-300">
          <CheckCircle2 className="h-5 w-5" />
          Settings saved successfully.
        </div>
      )}

      {/* SYSTEM STATUS */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-green-100 p-3 dark:bg-green-950/50">
            <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>

          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">
              System Status
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Live configuration received from the FastAPI backend.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <StatusItem label="Frontend" value="Online" status="online" />

          <StatusItem
            label="Data Source"
            value={
              backendStatus === "Connected" ? "Live Backend" : backendStatus
            }
            status={
              backendStatus === "Connected"
                ? "online"
                : backendStatus === "Offline"
                  ? "offline"
                  : "checking"
            }
          />

          <StatusItem
            label="Backend"
            value={backendStatus}
            status={
              backendStatus === "Connected"
                ? "online"
                : backendStatus === "Offline"
                  ? "offline"
                  : "checking"
            }
          />
        </div>
      </div>

      {/* BACKEND APPLICATION INFO */}
      {backendStatus === "Connected" && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900/60 dark:bg-blue-950/30">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-950/60">
              <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>

            <div>
              <h2 className="font-bold text-blue-900 dark:text-blue-200">
                Backend Configuration
              </h2>

              <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                Configuration loaded directly from FastAPI.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoCard title="Application" value={appName} />

            <InfoCard
              title="Environment"
              value={debug ? "Development" : "Production"}
            />
          </div>
        </div>
      )}

      {/* ALERT SETTINGS */}
      <SettingsSection
        icon={Bell}
        title="Alert Preferences"
        description="Control which emergency notifications are displayed."
      >
        <ToggleRow
          title="Enable Notifications"
          description="Show disaster and system notifications."
          enabled={notifications}
          onChange={setNotifications}
        />

        <ToggleRow
          title="Critical Hazard Alerts"
          description="Highlight red-zone and critical hazard conditions."
          enabled={criticalAlerts}
          onChange={setCriticalAlerts}
        />
      </SettingsSection>

      {/* MAP SETTINGS */}
      <SettingsSection
        icon={Map}
        title="Map Preferences"
        description="Configure the default information displayed on hazard maps."
      >
        <div className="flex flex-col gap-3 border-b border-slate-100 py-5 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Default Map Layer
            </h3>

            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Select the layer shown when opening the map.
            </p>
          </div>

          <select
            value={mapMode}
            onChange={(event) => setMapMode(event.target.value)}
            className="scheme-light dark:scheme-dark rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option>Risk Zones</option>
            <option>Habitations</option>
            <option>Population</option>
            <option>Relocation Sites</option>
          </select>
        </div>
      </SettingsSection>

      {/* DASHBOARD SETTINGS */}
      <SettingsSection
        icon={SettingsIcon}
        title="Dashboard Behaviour"
        description="Configure dashboard refresh and monitoring behaviour."
      >
        <ToggleRow
          title="Automatic Refresh"
          description="Automatically refresh dashboard data."
          enabled={autoRefresh}
          onChange={setAutoRefresh}
        />

        <div className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Refresh Interval
            </h3>

            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Time between automatic dashboard updates.
            </p>
          </div>

          <select
            value={refreshInterval}
            onChange={(event) => setRefreshInterval(event.target.value)}
            disabled={!autoRefresh}
            className="scheme-light dark:scheme-dark rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="15">15 seconds</option>
            <option value="30">30 seconds</option>
            <option value="60">1 minute</option>
            <option value="300">5 minutes</option>
          </select>
        </div>
      </SettingsSection>

      {/* SECURITY */}
      <SettingsSection
        icon={Shield}
        title="Security & Access"
        description="System access and operational security information."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InfoCard title="Access Level" value="Administrator" />
          <InfoCard title="Session Status" value="Active" />
          <InfoCard title="Authentication" value="Frontend Demo" />
          <InfoCard
            title="Environment"
            value={debug ? "Development" : "Production"}
          />
        </div>
      </SettingsSection>

      {/* ACTIONS */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:justify-end">
        <button
          onClick={resetSettings}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>

        <button
          onClick={saveSettings}
          className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 active:scale-95"
        >
          <Save className="h-4 w-4" />
          Save Settings
        </button>
      </div>

      {/* STATUS NOTICE */}
      <div
        className={`rounded-xl border p-4 ${
          backendStatus === "Connected"
            ? "border-green-200 bg-green-50 dark:border-green-900/60 dark:bg-green-950/30"
            : "border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30"
        }`}
      >
        <p
          className={`text-xs font-bold ${
            backendStatus === "Connected"
              ? "text-green-800 dark:text-green-300"
              : "text-amber-800 dark:text-amber-300"
          }`}
        >
          {backendStatus === "Connected"
            ? "LIVE BACKEND"
            : "BACKEND CONNECTION"}
        </p>

        <p
          className={`mt-1 text-xs leading-5 ${
            backendStatus === "Connected"
              ? "text-green-700 dark:text-green-400"
              : "text-amber-700 dark:text-amber-400"
          }`}
        >
          {backendStatus === "Connected"
            ? "Settings application information is being loaded from the FastAPI backend."
            : "The frontend could not currently connect to the FastAPI backend."}
        </p>
      </div>
      </div>
    </div>
  );
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
          <Icon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        </div>

        <div>
          <h2 className="font-bold text-slate-900 dark:text-white">
            {title}
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-5 last:border-0 dark:border-slate-800">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {title}
        </h3>

        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!enabled)}
        aria-label={title}
        aria-pressed={enabled}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled
            ? "bg-orange-500"
            : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function StatusItem({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "online" | "offline" | "checking";
}) {
  const dotClass =
    status === "online"
      ? "bg-green-500"
      : status === "offline"
        ? "bg-red-500"
        : "bg-amber-500";

  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/70">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dotClass}`} />

        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
          {value}
        </span>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
      <p className="text-xs text-slate-400 dark:text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

export default Settings;
