import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import SkeletonCard from "../components/SkeletonCard.jsx";

const statuses = ["Saved", "Applied", "Interview", "Rejected", "Offer"];

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pendingId, setPendingId] = useState(null);
  const [form, setForm] = useState({
    company: "",
    role: "",
    status: "Saved",
    matchScore: "",
  });
  const [message, setMessage] = useState(null);
  const [resumeProfile, setResumeProfile] = useState(null);
  const [resumeMessage, setResumeMessage] = useState(null);
  const [prepForm, setPrepForm] = useState({
    company: "",
    role: "",
    jobDescription: "",
  });
  const [prepResult, setPrepResult] = useState(null);
  const [prepLoading, setPrepLoading] = useState(false);
  const [prepMessage, setPrepMessage] = useState(null);
  const [confirmState, setConfirmState] = useState({
    open: false,
    id: null,
    label: "",
  });

  const loadApps = async () => {
    try {
      const { data } = await api.get("/applications");
      setApplications(data.applications || []);
    } catch (err) {
      setMessage("Unable to load applications.");
    } finally {
      setLoading(false);
    }
  };

  const loadResumeProfile = async () => {
    try {
      const { data } = await api.get("/ai/resume-profile");
      setResumeProfile(data);
    } catch (err) {
      setResumeMessage(
        err.response?.data?.message || "Resume analysis not available."
      );
    }
  };

  useEffect(() => {
    loadApps();
    loadResumeProfile();
  }, []);

  const grouped = useMemo(() => {
    return statuses.reduce((acc, status) => {
      acc[status] = applications.filter((app) => app.status === status);
      return acc;
    }, {});
  }, [applications]);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        matchScore: form.matchScore ? Number(form.matchScore) : undefined,
      };
      const { data } = await api.post("/applications", payload);
      setApplications((prev) => [data.application, ...prev]);
      setForm({ company: "", role: "", status: "Saved", matchScore: "" });
      toast.success("Application added");
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to add application.");
      toast.error("Unable to add application");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrepChange = (event) => {
    setPrepForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handlePrepSelect = (event) => {
    const selectedId = event.target.value;
    if (!selectedId) return;
    const selected = applications.find((app) => app._id === selectedId);
    if (!selected) return;
    setPrepForm((prev) => ({
      ...prev,
      company: selected.company,
      role: selected.role,
    }));
  };

  const handleInterviewPrep = async (event) => {
    event.preventDefault();
    setPrepMessage(null);
    setPrepLoading(true);
    setPrepResult(null);
    try {
      const payload = {
        company: prepForm.company.trim(),
        role: prepForm.role.trim(),
        jobDescription: prepForm.jobDescription.trim() || undefined,
      };
      const { data } = await api.post("/ai/interview-prep", payload);
      setPrepResult(data.result);
      toast.success("Interview prep ready");
    } catch (err) {
      setPrepMessage(
        err.response?.data?.message || "Unable to generate interview prep."
      );
      toast.error("Interview prep failed");
    } finally {
      setPrepLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setPendingId(id);
    try {
      const { data } = await api.patch(`/applications/${id}`, { status });
      setApplications((prev) =>
        prev.map((app) => (app._id === id ? data.application : app))
      );
      toast.success("Status updated");
    } catch (err) {
      setMessage("Unable to update application.");
      toast.error("Unable to update application");
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async () => {
    const id = confirmState.id;
    if (!id) return;
    setPendingId(id);
    try {
      await api.delete(`/applications/${id}`);
      setApplications((prev) => prev.filter((app) => app._id !== id));
      toast.success("Application removed");
    } catch (err) {
      setMessage("Unable to delete application.");
      toast.error("Unable to delete application");
    } finally {
      setPendingId(null);
      setConfirmState({ open: false, id: null, label: "" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-6 shadow-card">
        <h3 className="font-heading text-lg font-semibold text-slate-100">
          Add application
        </h3>
        <form className="mt-4 grid gap-4 md:grid-cols-4" onSubmit={handleCreate}>
          <input
            name="company"
            value={form.company}
            onChange={handleChange}
            placeholder="Company"
            className="rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
            required
          />
          <input
            name="role"
            value={form.role}
            onChange={handleChange}
            placeholder="Role"
            className="rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
            required
          />
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input
            name="matchScore"
            value={form.matchScore}
            onChange={handleChange}
            placeholder="Match %"
            type="number"
            min="0"
            max="100"
            className="rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
          />
          <button
            type="submit"
            disabled={submitting}
            className="md:col-span-4 rounded-full bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Adding..." : "Add application"}
          </button>
        </form>
        {message ? (
          <div className="mt-3 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {message}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="glass-panel rounded-3xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-semibold text-slate-100">
              Resume gaps
            </h3>
            <Link
              to="/app/resume"
              className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200"
            >
              Update resume
            </Link>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Focus on the missing skills flagged in your latest resume analysis.
          </p>
          {resumeProfile?.missingSkills?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {resumeProfile.missingSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-rose-400/20 px-3 py-1 text-xs font-semibold text-rose-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-4 text-xs text-slate-400">
              {resumeMessage || "Analyze your resume to see skill gaps."}
            </div>
          )}
        </div>

        <div className="glass-panel rounded-3xl p-6 shadow-card">
          <h3 className="font-heading text-lg font-semibold text-slate-100">
            Interview prep
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Generate targeted questions and prep tips using your resume.
          </p>
          <form className="mt-4 space-y-3" onSubmit={handleInterviewPrep}>
            <select
              onChange={handlePrepSelect}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
            >
              <option value="">Use a saved application</option>
              {applications.map((app) => (
                <option key={app._id} value={app._id}>
                  {app.role} at {app.company}
                </option>
              ))}
            </select>
            <input
              name="company"
              value={prepForm.company}
              onChange={handlePrepChange}
              placeholder="Company"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
              required
            />
            <input
              name="role"
              value={prepForm.role}
              onChange={handlePrepChange}
              placeholder="Role"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
              required
            />
            <textarea
              name="jobDescription"
              value={prepForm.jobDescription}
              onChange={handlePrepChange}
              rows="4"
              placeholder="Optional job description"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
            />
            <button
              type="submit"
              disabled={prepLoading}
              className="rounded-full bg-emerald-400/20 px-5 py-2 text-xs font-semibold text-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {prepLoading ? "Preparing..." : "Generate prep"}
            </button>
            {prepMessage ? (
              <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {prepMessage}
              </div>
            ) : null}
          </form>
          {prepResult ? (
            <div className="mt-5 space-y-4 text-sm text-slate-300">
              {prepResult.focus_areas?.length ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Focus areas
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {prepResult.focus_areas.map((area) => (
                      <span
                        key={area}
                        className="rounded-full bg-slate-800/70 px-3 py-1 text-xs text-slate-300"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {prepResult.questions?.length ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Questions to practice
                  </p>
                  <div className="mt-3 space-y-3">
                    {prepResult.questions.map((item, index) => (
                      <div key={`${item.question}-${index}`}>
                        <p className="font-semibold text-slate-200">
                          {item.question}
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.why_it_matters}
                        </p>
                        <p className="text-xs text-slate-300">
                          {item.what_to_cover}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {prepResult.red_flags?.length ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Red flags
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-400">
                    {prepResult.red_flags.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {prepResult.closing_pitch ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Closing pitch
                  </p>
                  <p className="mt-2 text-xs text-slate-300">
                    {prepResult.closing_pitch}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="glass-panel rounded-3xl p-8 text-center text-sm text-slate-400">
          Your Kanban board is empty. Add a role to start tracking applications.
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible">
          {statuses.map((status) => (
            <div
              key={status}
              className="min-w-[240px] space-y-3 lg:min-w-0"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-heading text-sm font-semibold text-slate-200">
                  {status}
                </h4>
                <span className="text-xs text-slate-500">
                  {grouped[status]?.length || 0}
                </span>
              </div>
              <div className="space-y-3">
                {grouped[status]?.length ? (
                  grouped[status].map((app) => (
                    <div
                      key={app._id}
                      className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 shadow-card"
                    >
                      <h5 className="text-sm font-semibold text-slate-100">
                        {app.role}
                      </h5>
                      <p className="text-xs text-slate-400">{app.company}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                        <span>
                          {app.matchScore ? `${app.matchScore}%` : "-"}
                        </span>
                        <div className="flex items-center gap-2">
                          {app.applyUrl ? (
                            <a
                              href={app.applyUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-200"
                            >
                              Open
                            </a>
                          ) : null}
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmState({
                                open: true,
                                id: app._id,
                                label: `${app.role} at ${app.company}`,
                              })
                            }
                            disabled={pendingId === app._id}
                            className="text-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <select
                        value={app.status}
                        disabled={pendingId === app._id}
                        onChange={(event) =>
                          handleStatusChange(app._id, event.target.value)
                        }
                        className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-2 py-1 text-xs text-slate-200"
                      >
                        {statuses.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-4 text-xs text-slate-500">
                    No applications yet
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmState.open}
        title="Remove application?"
        description={`This will permanently delete ${confirmState.label}.`}
        confirmLabel={pendingId ? "Removing..." : "Remove"}
        onConfirm={handleDelete}
        onCancel={() => setConfirmState({ open: false, id: null, label: "" })}
      />
    </div>
  );
}
