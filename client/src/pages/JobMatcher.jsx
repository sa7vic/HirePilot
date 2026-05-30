import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api.js";
import Loader from "../components/Loader.jsx";

export default function JobMatcher() {
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!jobDescription.trim()) {
      setMessage("Paste a job description first.");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const { data } = await api.post("/ai/job-match", { jobDescription });
      setResult(data.result);
      toast.success("Match report ready");
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to match this job.");
      toast.error("Job match failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-6 shadow-card">
        <h3 className="font-heading text-lg font-semibold text-slate-100">
          Paste the job description
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          We compare it against your latest resume analysis.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <textarea
            rows="8"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
            placeholder="Paste the role details here..."
          />
          {loading ? <Loader label="Scoring match..." /> : null}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-emerald-400/20 px-6 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Matching..." : "Get match score"}
          </button>
          {message ? (
            <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {message}
            </div>
          ) : null}
        </form>
      </div>

      {result ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="glass-panel rounded-3xl p-6 shadow-card">
            <h4 className="font-heading text-lg font-semibold text-slate-100">
              Match score
            </h4>
            <p className="mt-3 text-4xl font-semibold text-emerald-200">
              {(result.match_score ?? result.matchScore ?? 0)}%
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {result.final_recommendation || result.summary}
            </p>
          </div>
          <div className="glass-panel rounded-3xl p-6 shadow-card">
            <h4 className="font-heading text-lg font-semibold text-slate-100">
              Matched skills
            </h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {(result.matched_skills || []).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-3xl p-6 shadow-card">
            <h4 className="font-heading text-lg font-semibold text-slate-100">
              Missing skills
            </h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {(result.missing_skills || result.missingSkills || []).map(
                (skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-rose-400/20 px-3 py-1 text-xs font-semibold text-rose-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-3xl p-6 shadow-card">
            <h4 className="font-heading text-lg font-semibold text-slate-100">
              Strengths for role
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {(result.strengths_for_role || []).map((tip) => (
                <li key={tip}>• {tip}</li>
              ))}
            </ul>
          </div>
          <div className="glass-panel rounded-3xl p-6 shadow-card lg:col-span-2">
            <h4 className="font-heading text-lg font-semibold text-slate-100">
              Improvement suggestions
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {(result.improvement_suggestions ||
                result.improvementTips ||
                []).map((tip) => (
                <li key={tip}>• {tip}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
