import { getWireClient } from "./wireService.js";
import { parseWireJobs } from "./jobAggregationService.js";

// For analytics we fetch a much larger batch — 3× the normal job listing limit.
// We also run three tag variants per category to maximise skill coverage.
const ANALYTICS_LIMIT = 75;

const POLL_TRIES  = 14;
const POLL_DELAY  = 1500;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Category → multiple search queries so we pull diverse jobs
const CATEGORY_QUERIES = {
  frontend: [
    "react typescript javascript",
    "next.js vue angular frontend",
    "tailwind css ui components",
  ],
  backend: [
    "node.js python backend api",
    "java spring golang backend",
    "postgresql mongodb microservices",
  ],
  fullstack: [
    "full stack react node.js",
    "full stack typescript postgresql",
    "full stack python javascript",
  ],
  devops: [
    "aws docker kubernetes devops",
    "terraform ansible ci/cd",
    "github actions jenkins cloud",
  ],
  "ai-ml": [
    "machine learning python pytorch",
    "llm openai langchain ai",
    "tensorflow deep learning nlp",
  ],
  "data-science": [
    "data science python pandas",
    "dbt airflow snowflake bigquery",
    "spark databricks data engineering",
  ],
  cybersecurity: [
    "cybersecurity cloud security",
    "penetration testing siem soc",
    "network security devsecops",
  ],
  mobile: [
    "react native flutter mobile",
    "ios swift android kotlin",
    "mobile app development dart",
  ],
};

const CATEGORY_TO_WWR = {
  frontend:      "programming",
  backend:       "programming",
  fullstack:     "programming",
  devops:        "devops-sysadmin",
  "ai-ml":       "programming",
  "data-science":"programming",
  cybersecurity: "devops-sysadmin",
  mobile:        "programming",
};

const SOURCE_LABELS = {
  jb_jobs:     "Jobicy",
  ro_jobs:     "RemoteOK",
  ww_category: "WeWorkRemotely",
};

// ─────────────────────────────────────────────────────────────────────────────
// Wire helpers
// ─────────────────────────────────────────────────────────────────────────────
const runTask = async (client, action, params) => {
  const { data } = await client.post("/wire/task", { action_id: action, params });
  return data.job_id;
};

const pollJob = async (client, jobId) => {
  for (let i = 0; i < POLL_TRIES; i++) {
    const { data } = await client.get(`/wire/jobs/${jobId}`);
    if (data.status === "completed" || data.status === "failed") return data;
    await delay(POLL_DELAY);
  }
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// aggregateJobsForAnalytics
// Fetches a large, diverse set of jobs for analytics — separate from the
// job listings fetch so the two features don't interfere with each other.
// ─────────────────────────────────────────────────────────────────────────────
export async function aggregateJobsForAnalytics(options = {}) {
  const { category = "frontend" } = options;

  const queries   = CATEGORY_QUERIES[category] || CATEGORY_QUERIES.frontend;
  const wwrCat    = CATEGORY_TO_WWR[category]  || "programming";
  const client    = getWireClient();

  // Build task list:
  //   - one Jobicy fetch per query variant
  //   - one RemoteOK fetch per query variant
  //   - two WWR category fetches (different offsets via limit)
  const tasks = [];

  queries.forEach((q) => {
    tasks.push({ action: "jb_jobs",     params: { tag: q, count: ANALYTICS_LIMIT, geo: "" } });
    tasks.push({ action: "ro_jobs",     params: { tag: q, limit: ANALYTICS_LIMIT } });
  });

  tasks.push({ action: "ww_category",  params: { category: wwrCat, limit: ANALYTICS_LIMIT } });

  // ── Fire all tasks ────────────────────────────────────────────────────────
  const pending = [];
  for (const task of tasks) {
    try {
      const jobId = await runTask(client, task.action, task.params);
      pending.push({ action: task.action, jobId });
    } catch (err) {
      console.warn(`[analytics-agg] task failed to start: ${task.action}`, err.message);
    }
  }

  // ── Poll in parallel ──────────────────────────────────────────────────────
  const responses = await Promise.all(
    pending.map(({ jobId }) => pollJob(client, jobId))
  );

  // ── Parse + label source ──────────────────────────────────────────────────
  const allJobs = responses.flatMap((response, i) => {
    if (!response) return [];
    const source = SOURCE_LABELS[pending[i]?.action] || "Wire";
    return parseWireJobs(response, source);
  });

  // ── Deduplicate ───────────────────────────────────────────────────────────
  const seen = new Map();
  allJobs.forEach((job) => {
    const key = job.applyUrl || `${job.title}|${job.company}|${job.location}`;
    if (!seen.has(key)) seen.set(key, job);
  });

  const jobs = Array.from(seen.values());

  console.log(
    `[analytics-agg] category=${category} | tasks=${tasks.length} | raw=${allJobs.length} | deduped=${jobs.length}`
  );

  return { jobs, total: jobs.length, category };
}