import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const titleMap = {
  "/app": "Dashboard",
  "/app/resume": "Resume Analyzer",
  "/app/matcher": "Job Matcher",
  "/app/sources": "Job Sources",
  "/app/cover-letter": "Cover Letters",
  "/app/applications": "Applications",
  "/app/analytics": "Analytics",
  "/app/settings": "Settings",
};

export default function Navbar({ onMenu }) {
  const location = useLocation();
  const { user } = useAuth();
  const title = titleMap[location.pathname] || "Workspace";

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-slate-900/70 p-4 shadow-card backdrop-blur md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            HirePilot AI
          </p>
          <h1 className="font-heading text-2xl font-semibold text-slate-100">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onMenu?.()}
            className="rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-200 lg:hidden"
          >
            Menu
          </button>
          <div className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300">
            {user?.name ? `Welcome, ${user.name}` : "Welcome back"}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
        <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-200">
          AI Ready
        </span>
        <span className="rounded-full bg-slate-800/70 px-3 py-1">
          Resume-aware matching
        </span>
        <span className="rounded-full bg-slate-800/70 px-3 py-1">
          Wire-powered discovery
        </span>
      </div>
    </div>
  );
}
