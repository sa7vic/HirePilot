import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import StatCard from "../components/StatCard.jsx";
import JobCard from "../components/JobCard.jsx";
import SkeletonCard from "../components/SkeletonCard.jsx";

export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApps = async () => {
      try {
        const { data } = await api.get("/applications");
        setApplications(data.applications || []);
      } catch (err) {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    loadApps();
  }, []);

  const stats = useMemo(() => {
    const total = applications.length;
    const saved = applications.filter((app) => app.status === "Saved").length;
    const interviews = applications.filter(
      (app) => app.status === "Interview"
    ).length;
    const offers = applications.filter((app) => app.status === "Offer").length;
    const scored = applications.filter((app) => Number(app.matchScore) > 0);
    const avgMatch = scored.length
      ? Math.round(
          scored.reduce((sum, app) => sum + Number(app.matchScore), 0) /
            scored.length
        )
      : 0;

    return { total, saved, interviews, offers, avgMatch };
  }, [applications]);

  const recent = [...applications]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))
        ) : (
          <>
            <StatCard
              label="Total applications"
              value={stats.total}
              helper="All"
            />
            <StatCard label="Saved" value={stats.saved} helper="Watching" />
            <StatCard
              label="Interviews"
              value={stats.interviews}
              helper="Active"
            />
            <StatCard
              label="Avg match"
              value={`${stats.avgMatch}%`}
              helper="Score"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="glass-panel rounded-3xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-semibold text-slate-100">
              Recent activity
            </h3>
            <Link
              to="/app/applications"
              className="text-sm font-semibold text-emerald-200"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="space-y-3">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : recent.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-sm text-slate-400">
                No applications yet. Add your first role to begin tracking.
              </div>
            ) : (
              recent.map((app) => (
                <JobCard
                  key={app._id}
                  title={`${app.role} at ${app.company}`}
                  subtitle={`Status: ${app.status}`}
                  badge={app.matchScore ? `${app.matchScore}%` : null}
                />
              ))
            )}
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-slate-300">
              Activity timeline
            </h4>
            <div className="mt-3 space-y-3">
              {recent.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Track applications to build your timeline.
                </p>
              ) : (
                recent.map((app) => (
                  <div
                    key={`${app._id}-timeline`}
                    className="flex items-center gap-3 text-xs text-slate-400"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>
                      {app.role} at {app.company}
                    </span>
                    <span className="ml-auto text-slate-500">
                      {app.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="glass-panel rounded-3xl p-5 shadow-card">
            <h3 className="font-heading text-lg font-semibold text-slate-100">
              Quick actions
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Keep your pipeline fresh with one-click tools.
            </p>
            <div className="mt-4 space-y-2">
              <Link
                to="/app/resume"
                className="block rounded-2xl bg-emerald-400/20 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/30"
              >
                Analyze resume
              </Link>
              <Link
                to="/app/matcher"
                className="block rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
              >
                Match a job
              </Link>
              <Link
                to="/app/cover-letter"
                className="block rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
              >
                Generate cover letter
              </Link>
            </div>
          </div>
          <div className="glass-panel rounded-3xl p-5 shadow-card">
            <h3 className="font-heading text-lg font-semibold text-slate-100">
              Pipeline health
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Keep applications moving every week.
            </p>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-950/70 px-4 py-3 text-white">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Offers
                </p>
                <p className="text-lg font-semibold">{stats.offers}</p>
              </div>
              <span className="text-xs text-slate-400">Updated live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
