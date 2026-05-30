import { useAuth } from "../context/AuthContext.jsx";

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-6 shadow-card">
        <h3 className="font-heading text-lg font-semibold text-slate-100">
          Account settings
        </h3>
        <div className="mt-4 grid gap-3 text-sm text-slate-400">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Name
            </span>
            <p className="text-slate-100">{user?.name || ""}</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Email
            </span>
            <p className="text-slate-100">{user?.email || ""}</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Resume
            </span>
            <p className="text-slate-100">
              {user?.resumeUrl ? "Uploaded" : "Not uploaded yet"}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6 shadow-card">
        <h3 className="font-heading text-lg font-semibold text-slate-100">
          Data sources
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          Job discovery is powered by Wire actions for Jobicy, RemoteOK, and We
          Work Remotely.
        </p>
        <div className="mt-4 grid gap-3 text-sm text-slate-400">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3">
            Jobicy (jobicy.com)
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3">
            RemoteOK (remoteok.com)
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3">
            We Work Remotely (weworkremotely.com)
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Use the Job Sources page to run Wire actions and pull live postings.
        </p>
      </div>
    </div>
  );
}
