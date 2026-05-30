import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api.js";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const jobicyDefaults = {
  count: 20,
  geo: "",
  industry: "",
  tag: "",
};

const remoteOkDefaults = {
  tag: "",
  limit: 20,
};

const wwrJobsDefaults = {
  limit: 20,
};

const wwrCategoryDefaults = {
  category: "programming",
  limit: 20,
};

const wwrCategories = [
  "programming",
  "design",
  "copywriting",
  "customer-support",
  "devops-sysadmin",
  "business-management-finance",
  "product",
  "sales-marketing",
];

export default function JobSources() {
  const { user } = useAuth();
  const [jobicyParams, setJobicyParams] = useState(jobicyDefaults);
  const [remoteOkParams, setRemoteOkParams] = useState(remoteOkDefaults);
  const [wwrJobsParams, setWwrJobsParams] = useState(wwrJobsDefaults);
  const [wwrCategoryParams, setWwrCategoryParams] =
    useState(wwrCategoryDefaults);
  const [jobIds, setJobIds] = useState({});
  const [wireJobs, setWireJobs] = useState([]);
  const [rawPayloads, setRawPayloads] = useState(null);
  const [message, setMessage] = useState(null);
  const [loadingFind, setLoadingFind] = useState(false);
  const [jobScores, setJobScores] = useState({});
  const [scoringJobId, setScoringJobId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);

  useEffect(() => {
    if (!selectedJob || typeof document === "undefined") return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedJob]);

  useEffect(() => {
    const cachedJobs = localStorage.getItem("hp_wire_jobs");
    const cachedJobIds = localStorage.getItem("hp_job_ids");
    const cachedScores = localStorage.getItem("hp_job_scores");
    const cachedPayloads = localStorage.getItem("hp_wire_payloads");
    if (cachedJobs) {
      try {
        setWireJobs(JSON.parse(cachedJobs));
      } catch {
        setWireJobs([]);
      }
    }
    if (cachedJobIds) {
      try {
        setJobIds(JSON.parse(cachedJobIds));
      } catch {
        setJobIds({});
      }
    }
    if (cachedScores) {
      try {
        setJobScores(JSON.parse(cachedScores));
      } catch {
        setJobScores({});
      }
    }
    if (cachedPayloads) {
      try {
        setRawPayloads(JSON.parse(cachedPayloads));
      } catch {
        setRawPayloads(null);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("hp_wire_jobs", JSON.stringify(wireJobs));
  }, [wireJobs]);

  useEffect(() => {
    localStorage.setItem("hp_job_ids", JSON.stringify(jobIds));
  }, [jobIds]);

  useEffect(() => {
    localStorage.setItem("hp_job_scores", JSON.stringify(jobScores));
  }, [jobScores]);

  useEffect(() => {
    if (rawPayloads) {
      localStorage.setItem("hp_wire_payloads", JSON.stringify(rawPayloads));
    }
  }, [rawPayloads]);

  const isLikelyMojibake = (value) =>
    /[\u0080-\u009F]/.test(value) || /Ã.|Â.|â.|Ø.|Ù./.test(value);

  const decodeEntities = (value) => {
    if (typeof value !== "string") return "";
    if (typeof document === "undefined") return value;
    const textarea = document.createElement("textarea");
    textarea.innerHTML = value;
    return textarea.value;
  };

  const normalizeText = (value) => {
    if (value === null || value === undefined) return "";
    const raw = typeof value === "string" ? value : String(value);
    const stripped = raw.replace(/<[^>]*>/g, " ");
    const decoded = decodeEntities(stripped);
    const collapsed = decoded.replace(/\s+/g, " ").trim();
    if (!isLikelyMojibake(collapsed)) return collapsed;
    try {
      const bytes = Uint8Array.from(
        collapsed,
        (char) => char.charCodeAt(0) & 0xff
      );
      const fixed = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
      return fixed.replace(/\s+/g, " ").trim();
    } catch {
      return collapsed;
    }
  };

  const splitTags = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      return value.split(/,|\||;|\n/);
    }
    return [];
  };

  const parseWireJobs = (response) => {
    if (!response || response.status !== "completed") return [];
    const payload = response.data || response.result || response.jobs || response;
    const nestedData = payload?.data || payload?.result || payload?.jobs || payload;
    const items =
      Array.isArray(nestedData) ? nestedData :
      Array.isArray(nestedData?.data) ? nestedData.data :
      Array.isArray(nestedData?.jobs) ? nestedData.jobs :
      Array.isArray(nestedData?.results) ? nestedData.results :
      Array.isArray(nestedData?.items) ? nestedData.items :
      [];

    return items.map((job, index) => {
      const tagsRaw =
        job.tags || job.skills || job.categories || job.category || [];
      const tags = splitTags(tagsRaw)
        .map((tag) => normalizeText(tag))
        .filter(Boolean);

      return {
        id: job.id || job.job_id || job.slug || job.url || `${index}`,
        title: normalizeText(
          job.title || job.position || job.role || job.job_title || job.name ||
            "Untitled role"
        ),
        company: normalizeText(
          job.company || job.company_name || job.employer || job.organization ||
            "Unknown"
        ),
        location: normalizeText(
          job.location || job.geo || job.region || job.country || "Remote"
        ),
        level: normalizeText(job.level || job.seniority || ""),
        salary: normalizeText(job.salary || job.salary_range || job.compensation || ""),
        tags,
        applyUrl: job.apply_url || job.url || job.link || job.applyLink || "",
        description: normalizeText(
          job.description || job.summary || job.job_description || job.text || ""
        ),
      };
    });
  };

  const buildJobDescription = (job) => {
    const parts = [
      `Title: ${job.title}`,
      `Company: ${job.company}`,
      `Location: ${job.location}`,
      job.level ? `Level: ${job.level}` : "",
      job.salary ? `Salary: ${job.salary}` : "",
      job.tags?.length ? `Skills: ${job.tags.join(", ")}` : "",
      job.description ? `Description: ${job.description}` : "",
    ].filter(Boolean);

    return parts.join("\n");
  };

  const handleScoreJob = async (job, options = {}) => {
    const { silent = false } = options;
    if (!user?.resumeUrl) {
      if (!silent) {
        toast.error("Upload a resume first");
      }
      return;
    }
    setScoringJobId(job.id);
    try {
      const jobDescription = buildJobDescription(job);
      const { data } = await api.post("/ai/job-match", { jobDescription });
      setJobScores((prev) => ({ ...prev, [job.id]: data.result }));
      if (!silent) {
        toast.success("Match score ready");
      }
    } catch (err) {
      if (!silent) {
        toast.error(`Unable to score this job: ${err.message}`);
      }
    } finally {
      setScoringJobId(null);
    }
  };

  const handleSaveJob = async (job) => {
    try {
      const score = jobScores[job.id]?.match_score;
      await api.post("/applications", {
        company: job.company,
        role: job.title,
        status: "Saved",
        matchScore: typeof score === "number" ? score : undefined,
        applyUrl: job.applyUrl || undefined,
      });
      toast.success("Saved to Applications");
    } catch (err) {
      toast.error(`Unable to save application: ${err.message}`);
    }
  };

  const handleApplyJob = async (job) => {
    try {
      const score = jobScores[job.id]?.match_score;
      await api.post("/applications", {
        company: job.company,
        role: job.title,
        status: "Applied",
        matchScore: typeof score === "number" ? score : undefined,
        applyUrl: job.applyUrl || undefined,
      });
      toast.success("Added to Applications as Applied");
      if (job.applyUrl) {
        window.open(job.applyUrl, "_blank", "noreferrer");
      }
    } catch (err) {
      toast.error(`Unable to apply to this job: ${err.message}`);
    }
  };

  const mapCategory = (roles = []) => {
    const roleText = roles.join(" ").toLowerCase();
    if (roleText.includes("design")) return "design";
    if (roleText.includes("product")) return "product";
    if (roleText.includes("support")) return "customer-support";
    if (roleText.includes("devops") || roleText.includes("sysadmin")) {
      return "devops-sysadmin";
    }
    if (roleText.includes("sales") || roleText.includes("marketing")) {
      return "sales-marketing";
    }
    if (roleText.includes("finance") || roleText.includes("business")) {
      return "business-management-finance";
    }
    if (roleText.includes("copy")) return "copywriting";
    return "programming";
  };

  const handleAutofill = async () => {
    setResumeLoading(true);
    try {
      const { data } = await api.get("/ai/resume-profile");
      const skills = data.skills || [];
      const roles = data.preferredRoles || [];
      const tag = skills[0] || "";
      setJobicyParams((prev) => ({ ...prev, tag }));
      setRemoteOkParams((prev) => ({ ...prev, tag }));
      setWwrCategoryParams((prev) => ({
        ...prev,
        category: mapCategory(roles),
      }));
      toast.success("Search filters auto-filled");
    } catch (err) {
      toast.error(`Resume profile not available yet: ${err.message}`);
    } finally {
      setResumeLoading(false);
    }
  };

  const pollJob = async (id, tries = 10) => {
    for (let attempt = 0; attempt < tries; attempt += 1) {
      const { data } = await api.get(`/wire/jobs/${id}`);
      if (data.status === "completed" || data.status === "failed") {
        return data;
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    return null;
  };

  const handleFindJobs = async (forceRefresh = false) => {
    setMessage(null);
    setLoadingFind(true);
    setRawPayloads(null);
    setJobScores({});
    try {
      const tasks = [];
      const jobicyParamsPayload = {
        count: jobicyParams.count,
        geo: jobicyParams.geo,
        industry: jobicyParams.industry,
        tag: jobicyParams.tag,
      };
      const remoteOkPayload = {
        tag: remoteOkParams.tag,
        limit: remoteOkParams.limit,
      };
      const wwrPayload = wwrCategoryParams.category
        ? {
            action: "ww_category",
            params: {
              category: wwrCategoryParams.category,
              limit: wwrCategoryParams.limit,
            },
          }
        : {
            action: "ww_jobs",
            params: { limit: wwrJobsParams.limit },
          };

      tasks.push({ action: "jb_jobs", params: jobicyParamsPayload });
      tasks.push({ action: "ro_jobs", params: remoteOkPayload });
      tasks.push({ action: wwrPayload.action, params: wwrPayload.params });

      const taskResponses = [];
      const ids = {};
      for (const task of tasks) {
        const { data } = await api.post("/wire/task", {
          action_id: task.action,
          params: task.params,
        });
        ids[task.action] = data.job_id;
        taskResponses.push({ action: task.action, jobId: data.job_id });
      }
      setJobIds(ids);
      toast.success(forceRefresh ? "Refreshing job feeds" : "Jobs queued");

      const payloads = {};
      for (const task of taskResponses) {
        const response = await pollJob(task.jobId);
        if (response) {
          payloads[task.action] = response;
        }
      }

      setRawPayloads(payloads);
      const combined = Object.values(payloads).flatMap((payload) =>
        parseWireJobs(payload)
      );

      const deduped = new Map();
      combined.forEach((job) => {
        const key = job.applyUrl || `${job.title}-${job.company}`;
        if (!deduped.has(key)) {
          deduped.set(key, job);
        }
      });

      const jobsList = Array.from(deduped.values());
      setWireJobs(jobsList);

      if (jobsList.length && user?.resumeUrl) {
        const topJobs = jobsList.slice(0, 10);
        for (const job of topJobs) {
          await handleScoreJob(job, { silent: true });
        }
      }
    } catch (err) {
      setMessage("Unable to fetch jobs from all sources.");
      toast.error(`Job search failed: ${err.message}`);
    } finally {
      setLoadingFind(false);
    }
  };

  const rankedJobs = useMemo(() => {
    if (!wireJobs.length) return [];
    return [...wireJobs].sort((a, b) => {
      const scoreA = jobScores[a.id]?.match_score ?? -1;
      const scoreB = jobScores[b.id]?.match_score ?? -1;
      return scoreB - scoreA;
    });
  }, [wireJobs, jobScores]);

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-6 shadow-card">
        <h3 className="font-heading text-lg font-semibold text-slate-100">
          Remote job sources
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          These Wire actions require a connected identity to run.
        </p>
        <div className="mt-4 rounded-3xl border border-slate-800/70 bg-slate-950/40 p-5 text-sm text-slate-300">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs text-emerald-100">
              Step 1
            </span>
            <p>Upload your resume for accurate match scoring.</p>
            <Link
              to="/app/resume"
              className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200"
            >
              Upload resume
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-800/70 px-3 py-1 text-xs text-slate-300">
              Step 2
            </span>
            <p>Search jobs and score them against your profile.</p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-800/70 px-3 py-1 text-xs text-slate-300">
              Step 3
            </span>
            <p>Apply to jobs to save them into Applications automatically.</p>
            <Link
              to="/app/applications"
              className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200"
            >
              View applications
            </Link>
          </div>
        </div>
        {!user?.resumeUrl ? (
          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
            Upload a resume first for match scoring to work accurately.
          </div>
        ) : null}
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/60 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              jobicy.com
            </p>
            <h4 className="mt-2 font-heading text-lg font-semibold text-slate-100">
              Jobicy
            </h4>
            <p className="mt-2 text-sm text-slate-400">
              Global remote jobs filtered by location, industry, and skill tags
              with salary range and level.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/60 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              remoteok.com
            </p>
            <h4 className="mt-2 font-heading text-lg font-semibold text-slate-100">
              RemoteOK
            </h4>
            <p className="mt-2 text-sm text-slate-400">
              Remote job listings filtered by skill tag with salary, company,
              and application links.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/60 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              weworkremotely.com
            </p>
            <h4 className="mt-2 font-heading text-lg font-semibold text-slate-100">
              We Work Remotely
            </h4>
            <p className="mt-2 text-sm text-slate-400">
              Remote job listings by category with company and publish date.
            </p>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6 shadow-card">
        <h3 className="font-heading text-lg font-semibold text-slate-100">
          Search preferences
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          We auto-fill from your resume and search all three sources together.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Primary skill tag
            </label>
            <input
              value={remoteOkParams.tag}
              onChange={(event) => {
                setRemoteOkParams((prev) => ({
                  ...prev,
                  tag: event.target.value,
                }));
                setJobicyParams((prev) => ({
                  ...prev,
                  tag: event.target.value,
                }));
              }}
              placeholder="e.g. python, react, devops"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Location (Jobicy)
            </label>
            <input
              value={jobicyParams.geo}
              onChange={(event) =>
                setJobicyParams((prev) => ({
                  ...prev,
                  geo: event.target.value,
                }))
              }
              placeholder="usa, europe, uk"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Industry (Jobicy)
            </label>
            <input
              value={jobicyParams.industry}
              onChange={(event) =>
                setJobicyParams((prev) => ({
                  ...prev,
                  industry: event.target.value,
                }))
              }
              placeholder="tech, marketing"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
              WWR category
            </label>
            <select
              value={wwrCategoryParams.category}
              onChange={(event) =>
                setWwrCategoryParams((prev) => ({
                  ...prev,
                  category: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
            >
              {wwrCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Jobicy count
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={jobicyParams.count}
              onChange={(event) =>
                setJobicyParams((prev) => ({
                  ...prev,
                  count: Number(event.target.value),
                }))
              }
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
              RemoteOK/WWR limit
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={remoteOkParams.limit}
              onChange={(event) => {
                const limit = Number(event.target.value);
                setRemoteOkParams((prev) => ({ ...prev, limit }));
                setWwrCategoryParams((prev) => ({ ...prev, limit }));
              }}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
            />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleAutofill}
            disabled={resumeLoading}
            className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resumeLoading ? "Auto-filling..." : "Auto-fill from resume"}
          </button>
          <button
            type="button"
            onClick={() => handleFindJobs(false)}
            disabled={loadingFind}
            className="rounded-full bg-emerald-400/20 px-5 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingFind ? "Finding..." : "Find jobs"}
          </button>
          <button
            type="button"
            onClick={() => handleFindJobs(true)}
            disabled={loadingFind}
            className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Refresh results
          </button>
          {loadingFind ? <Loader label="Fetching all sources..." /> : null}
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-heading text-lg font-semibold text-slate-100">
              Job results
            </h3>
            <p className="text-sm text-slate-400">
              Score listings against your resume and save them to Applications.
            </p>
          </div>
          {rankedJobs.length ? (
            <span className="rounded-full bg-slate-800/70 px-3 py-1 text-xs text-slate-300">
              Results: {rankedJobs.length}
            </span>
          ) : null}
        </div>

        {loadingFind ? (
          <div className="mt-4">
            <Loader label="Fetching jobs..." />
          </div>
        ) : rankedJobs.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-sm text-slate-400">
            No jobs yet. Use "Find jobs" to pull results from all sources.
          </div>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {rankedJobs.map((job) => {
              const score = jobScores[job.id]?.match_score;
              return (
                <div
                  key={job.id}
                  className="rounded-3xl border border-slate-800/70 bg-slate-900/60 p-5 shadow-card"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-heading text-lg font-semibold text-slate-100">
                        {job.title}
                      </h4>
                      <p className="text-sm text-slate-400 line-clamp-1 break-words">
                        {job.company} • {job.location}
                      </p>
                      {job.salary ? (
                        <p className="mt-2 text-xs text-emerald-200">
                          {job.salary}
                        </p>
                      ) : null}
                    </div>
                    {typeof score === "number" ? (
                      <div className="rounded-2xl bg-emerald-400/20 px-3 py-2 text-sm font-semibold text-emerald-100">
                        {score}%
                      </div>
                    ) : null}
                  </div>
                  {job.tags?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.tags.slice(0, 6).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-800/70 px-3 py-1 text-xs text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {job.description ? (
                    <p className="mt-3 line-clamp-3 text-sm text-slate-400 leading-relaxed">
                      {job.description}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleScoreJob(job)}
                      disabled={scoringJobId === job.id}
                      className="rounded-full bg-emerald-400/20 px-4 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {scoringJobId === job.id ? "Scoring..." : "Score with resume"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveJob(job)}
                      className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200"
                    >
                      Save to Applications
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedJob(job)}
                      className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200"
                    >
                      View details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedJob && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
              onClick={() => setSelectedJob(null)}
            >
              <div
                className="glass-panel w-full max-w-2xl overflow-hidden rounded-3xl shadow-card"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex max-h-[85vh] flex-col">
                  <div className="overflow-y-auto px-6 py-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-heading text-2xl font-semibold text-slate-100">
                          {selectedJob.title}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {selectedJob.company} • {selectedJob.location}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedJob(null)}
                        className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
                      >
                        Close
                      </button>
                    </div>
                    {selectedJob.salary ? (
                      <p className="mt-3 text-sm text-emerald-200">
                        {selectedJob.salary}
                      </p>
                    ) : null}
                    {selectedJob.tags?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedJob.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-800/70 px-3 py-1 text-xs text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {selectedJob.description ? (
                      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-300">
                        {selectedJob.description}
                      </p>
                    ) : null}
                    <div className="mt-6 rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4">
                      <h4 className="text-sm font-semibold text-slate-200">
                        Match insights
                      </h4>
                      {jobScores[selectedJob.id] ? (
                        <div className="mt-2 space-y-2 text-sm text-slate-300 leading-relaxed">
                          <p>
                            Match score: {jobScores[selectedJob.id].match_score || 0}%
                          </p>
                          <p>{jobScores[selectedJob.id].final_recommendation}</p>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-slate-400">
                          Score this job to see recommendations.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 border-t border-slate-800/70 bg-slate-950/60 px-6 py-4">
                    <button
                      type="button"
                      onClick={() => handleScoreJob(selectedJob)}
                      disabled={scoringJobId === selectedJob.id}
                      className="rounded-full bg-emerald-400/20 px-4 py-2 text-xs font-semibold text-emerald-100"
                    >
                      {scoringJobId === selectedJob.id ? "Scoring..." : "Score with resume"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveJob(selectedJob)}
                      className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200"
                    >
                      Save to Applications
                    </button>
                    {selectedJob.applyUrl ? (
                      <button
                        type="button"
                        onClick={() => handleApplyJob(selectedJob)}
                        className="rounded-full bg-emerald-400/20 px-4 py-2 text-xs font-semibold text-emerald-100"
                      >
                        Apply now
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}

      {message ? (
        <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {message}
        </div>
      ) : null}
    </div>
  );
}