import { lazy, Suspense, useEffect, useState } from "react";
import type { ComponentType } from "react";
import {
  Activity,
  BarChart3,
  Building2,
  FileText,
  LayoutDashboard,
  Map,
  Moon,
  Route,
  Settings as SettingsIcon,
  ShieldAlert,
  Sun,
  Users,
} from "lucide-react";
import { NavLink, Route as RouterRoute, Routes } from "react-router-dom";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const HazardAnalysis = lazy(() => import("./pages/HazardAnalysis"));
const RelocationPriority = lazy(
  () => import("./pages/RelocationPriority")
);
const SafeSites = lazy(() => import("./pages/SafeSites"));
const RelocationSimulation = lazy(
  () => import("./pages/RelocationSimulation")
);
const Analytics = lazy(() => import("./pages/Analytics"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));

const THEME_KEY = "resqvision-theme";

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  end?: boolean;
};

const primaryNavItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/hazard-analysis", label: "Hazard Analysis", icon: Map },
  {
    to: "/relocation-priority",
    label: "Relocation Priority",
    icon: Users,
  },
  { to: "/safe-sites", label: "Safe Sites & Capacity", icon: Building2 },
  {
    to: "/relocation-simulation",
    label: "Relocation Simulation",
    icon: Route,
  },
];

const systemNavItems: NavItem[] = [
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

function getInitialDarkMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const saved = window.localStorage.getItem(THEME_KEY);

  if (saved === "dark") {
    return true;
  }

  if (saved === "light") {
    return false;
  }

  return (
    window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
  );
}

function applyTheme(isDark: boolean) {
  const root = document.documentElement;

  root.classList.remove("dark");

  if (isDark) {
    root.classList.add("dark");
  }

  root.style.colorScheme = isDark ? "dark" : "light";
  document.body.style.colorScheme = isDark ? "dark" : "light";
  window.localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
}

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        <Activity className="h-4 w-4 animate-pulse text-orange-500" />
        Loading ResQVision...
      </div>
    </div>
  );
}

function ThemeToggle({
  isDarkMode,
  onToggle,
  compact = false,
}: {
  isDarkMode: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        aria-pressed={isDarkMode}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        {isDarkMode ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDarkMode}
      className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
    >
      <span className="flex items-center gap-2">
        {isDarkMode ? (
          <Moon className="h-4 w-4 text-orange-400" />
        ) : (
          <Sun className="h-4 w-4 text-orange-500" />
        )}
        {isDarkMode ? "Dark mode" : "Light mode"}
      </span>

      <span
        className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${
          isDarkMode
            ? "bg-orange-500"
            : "bg-slate-300 dark:bg-slate-600"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            isDarkMode ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    applyTheme(isDarkMode);
  }, [isDarkMode]);

  function toggleTheme() {
    setIsDarkMode((current) => {
      const next = !current;

      // Apply immediately so the UI never waits for the next render/effect.
      applyTheme(next);

      return next;
    });
  }

  function renderNavItem({ to, label, icon: Icon, end }: NavItem) {
    return (
      <NavLink
        key={to}
        to={to}
        end={end}
        className={({ isActive }) =>
          `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            isActive
              ? "bg-orange-500 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
          }`
        }
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span>{label}</span>
      </NavLink>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950 lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 px-5 py-5 transition-colors dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
                <ShieldAlert className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                  ResQVision
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Disaster Intelligence
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {primaryNavItems.map(renderNavItem)}

            <div className="my-4 border-t border-slate-200 dark:border-slate-800" />

            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
              System
            </p>

            {systemNavItems.map(renderNavItem)}
          </nav>

          <div className="border-t border-slate-200 p-3 transition-colors dark:border-slate-800">
            <ThemeToggle
              isDarkMode={isDarkMode}
              onToggle={toggleTheme}
            />
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950/95">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="lg:hidden">
              <p className="text-base font-bold text-slate-950 dark:text-white">
                ResQVision
              </p>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 sm:flex">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                Live Data
              </div>

              <div className="hidden items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 md:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Backend Connected
              </div>

              <ThemeToggle
                isDarkMode={isDarkMode}
                onToggle={toggleTheme}
                compact
              />
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)]">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <RouterRoute path="/" element={<Dashboard />} />
              <RouterRoute path="/hazard-analysis" element={<HazardAnalysis />} />
              <RouterRoute path="/relocation-priority" element={<RelocationPriority />} />
              <RouterRoute path="/safe-sites" element={<SafeSites />} />
              <RouterRoute
                path="/relocation-simulation"
                element={<RelocationSimulation />}
              />
              <RouterRoute path="/analytics" element={<Analytics />} />
              <RouterRoute path="/reports" element={<Reports />} />
              <RouterRoute path="/settings" element={<Settings />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default App;
