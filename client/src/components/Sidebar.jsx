import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { label: "Dashboard", to: "/app" },
  { label: "Resume Analyzer", to: "/app/resume" },
  { label: "Job Matcher", to: "/app/matcher" },
  { label: "Job Sources", to: "/app/sources" },
  { label: "Cover Letters", to: "/app/cover-letter" },
  { label: "Applications", to: "/app/applications" },
  { label: "Analytics", to: "/app/analytics" },
  { label: "Settings", to: "/app/settings" },
];

const linkBase =
  "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition";

export default function Sidebar({ isOpen = false, onClose }) {
  const { logout } = useAuth();

  return (
    <aside
      className={`fixed left-4 top-6 z-30 h-[calc(100%-3rem)] w-72 shrink-0 transition-transform duration-300 lg:static lg:h-auto lg:w-64 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-[120%]"
      }`}
    >
      <div className="glass-panel flex h-full flex-col rounded-3xl p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              HirePilot
            </p>
            <h2 className="font-heading text-2xl font-semibold text-slate-100">
              AI Console
            </h2>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-400/20 text-sm text-emerald-200">
            HP
          </div>
        </div>
        <button
          type="button"
          onClick={() => onClose?.()}
          className="mt-4 self-end rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 lg:hidden"
        >
          Close
        </button>

        <nav className="mt-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/app"}
              className={({ isActive }) =>
                `${linkBase} ${
                  isActive
                    ? "bg-emerald-400/20 text-emerald-100 shadow-glow"
                    : "text-slate-300 hover:bg-slate-800/60"
                }`
              }
            >
              <span>{item.label}</span>
              <span className="text-xs text-slate-500">→</span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={logout}
          className="mt-auto w-full rounded-2xl border border-slate-700 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
