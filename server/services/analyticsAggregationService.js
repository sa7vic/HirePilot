import { getWireClient } from "./wireService.js";
import { parseWireJobs } from "./jobAggregationService.js";

const ANALYTICS_LIMIT = 50;
const POLL_TRIES  = 12;
const POLL_DELAY  = 2000; // 2s between polls — was 1.5s, gives API more breathing room
const TASK_DELAY  = 600;  // 600ms between task submissions to avoid burst

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// One focused query per category — was 3 queries × 2 sources = 6 tasks,
// now 1 query × 2 sources + 1 WWR = 3 tasks total (same as jobAggregationService)
const CATEGORY_CONFIG = {
  frontend:       { query: "react typescript next.js javascript",  wwr: "programming" },
  backend:        { query: "node.js python backend postgresql api", wwr: "programming" },
  fullstack:      { query: "full stack react node.js typescript",   wwr: "programming" },
  devops:         { query: "aws docker kubernetes terraform devops", wwr: "devops-sysadmin" },
  "ai-ml":        { query: "machine learning python pytorch llm",   wwr: "programming" },
  "data-science": { query: "data science python pandas snowflake",  wwr: "programming" },
  cybersecurity:  { query: "cybersecurity cloud security devops",   wwr: "devops-sysadmin" },
  mobile:         { query: "react native flutter ios android",      wwr: "programming" },
};

const SOURCE_LABELS = {
  jb_jobs:     "Jobicy",
  ro_jobs:     "RemoteOK",
  ww_category: "WeWorkRemotely",
};

const runTask = async (client, action, params) => {
  const { data } = await client.post("/wire/task", { action_id: action, params });
  return data.job_id;
};

const pollJob = async (client, jobId) => {
  for (let i = 0; i < POLL_TRIES; i++) {
    try {
      const { data } = await client.get(`/wire/jobs/${jobId}`);
      if (data.status === "completed" || data.status === "failed") return data;
    } catch (err) {
      // On 429 during polling, wait longer before retrying
      if (err?.response?.status === 429) {
        console.warn(`[analytics-agg] 429 on poll ${jobId}, waiting 4s...`);
        await delay(4000);
        continue;
      }
      throw err;
    }
    await delay(POLL_DELAY);
  }
  return null;
};

export async function aggregateJobsForAnalytics(options = {}) {
  const { category = "frontend" } = options;

  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.frontend;
  const client = getWireClient();

  // 3 tasks only — same count as jobAggregationService
  const tasks = [
    { action: "jb_jobs",     params: { tag: config.query, count: ANALYTICS_LIMIT, geo: "" } },
    { action: "ro_jobs",     params: { tag: config.query, limit: ANALYTICS_LIMIT } },
    { action: "ww_category", params: { category: config.wwr, limit: ANALYTICS_LIMIT } },
  ];

  // Submit tasks sequentially with a small gap to avoid burst
  const pending = [];
  for (const task of tasks) {
    try {
      const jobId = await runTask(client, task.action, task.params);
      pending.push({ action: task.action, jobId });
      await delay(TASK_DELAY);
    } catch (err) {
      console.warn(`[analytics-agg] task failed to start: ${task.action}`, err.message);
    }
  }

  // Poll sequentially (not Promise.all) to avoid hammering the API
  const responses = [];
  for (const { action, jobId } of pending) {
    const result = await pollJob(client, jobId);
    responses.push({ action, result });
  }

  // Parse and label
  const allJobs = responses.flatMap(({ action, result }) => {
    if (!result) return [];
    const source = SOURCE_LABELS[action] || "Wire";
    return parseWireJobs(result, source);
  });

  // Deduplicate
  const seen = new Map();
  allJobs.forEach((job) => {
    const key = job.applyUrl || `${job.title}|${job.company}|${job.location}`;
    if (!seen.has(key)) seen.set(key, job);
  });

  const jobs = Array.from(seen.values());

  console.log(
    `[analytics-agg] category=${category} | raw=${allJobs.length} | deduped=${jobs.length}`
  );

  return { jobs, total: jobs.length, category };
}