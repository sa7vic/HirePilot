import { getWireClient } from "./wireService.js";
import { deriveCategoryFromRole, deriveTagFromRole } from "./roleUtils.js";

const DEFAULT_LIMIT = 25;
const POLL_TRIES = 10;
const POLL_DELAY_MS = 1500;

const SOURCE_LABELS = {
  jb_jobs: "Jobicy",
  ro_jobs: "RemoteOK",
  ww_jobs: "WeWorkRemotely",
  ww_category: "WeWorkRemotely",
};

const CATEGORY_SEARCH_MAP = {
  frontend: "react frontend javascript typescript",
  backend: "node.js backend api express",
  fullstack: "full stack react node.js",
  devops: "devops aws docker kubernetes",
  "ai-ml": "ai machine learning llm python",
  "data-science": "data science python analytics",
  cybersecurity: "cybersecurity security engineer cloud security",
  mobile: "react native ios android flutter",
};

const ENTITY_MAP = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const decodeEntities = (value = "") =>
  value.replace(
    /&(amp|lt|gt|quot|#39|nbsp);/g,
    (match) => ENTITY_MAP[match] || match
  );

const normalizeText = (value) => {
  if (value === null || value === undefined) return "";

  const raw =
    typeof value === "string"
      ? value
      : String(value);

  const stripped = raw.replace(/<[^>]*>/g, " ");

  const decoded = decodeEntities(stripped);

  return decoded.replace(/\s+/g, " ").trim();
};

const splitTags = (value) => {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    return value.split(/,|\||;|\n/);
  }

  return [];
};

const extractItems = (response) => {
  if (!response || response.status !== "completed") {
    return [];
  }

  const payload =
    response.data ||
    response.result ||
    response.jobs ||
    response;

  const nested =
    payload?.data ||
    payload?.result ||
    payload?.jobs ||
    payload;

  if (Array.isArray(nested)) return nested;
  if (Array.isArray(nested?.data)) return nested.data;
  if (Array.isArray(nested?.jobs)) return nested.jobs;
  if (Array.isArray(nested?.results)) return nested.results;
  if (Array.isArray(nested?.items)) return nested.items;

  return [];
};

export const parseWireJobs = (response, source) => {
  const items = extractItems(response);

  return items.map((job, index) => {
    const tagsRaw =
      job.tags ||
      job.skills ||
      job.categories ||
      job.category ||
      [];

    const tags = splitTags(tagsRaw)
      .map((tag) => normalizeText(tag))
      .filter(Boolean);

    const postedAtRaw =
      job.posted_at ||
      job.published_at ||
      job.created_at ||
      job.date ||
      job.pubDate ||
      "";

    let postedAt = "";

    try {
      postedAt = postedAtRaw
        ? new Date(postedAtRaw).toISOString()
        : "";
    } catch {
      postedAt = "";
    }

    return {
      id:
        job.id ||
        job.job_id ||
        job.slug ||
        job.url ||
        `${index}`,

      title: normalizeText(
        job.title ||
          job.position ||
          job.role ||
          job.job_title ||
          job.name ||
          ""
      ),

      company: normalizeText(
        job.company ||
          job.company_name ||
          job.employer ||
          job.organization ||
          ""
      ),

      location: normalizeText(
        job.location ||
          job.geo ||
          job.region ||
          job.country ||
          ""
      ),

      source,

      tags,

      salary: normalizeText(
        job.salary ||
          job.salary_range ||
          job.compensation ||
          ""
      ),

      description: normalizeText(
        job.description ||
          job.summary ||
          job.job_description ||
          job.text ||
          ""
      ),

      applyUrl:
        job.apply_url ||
        job.url ||
        job.link ||
        job.applyLink ||
        "",

      postedAt,

      industry: normalizeText(
        job.industry ||
          job.department ||
          ""
      ),

      employmentType: normalizeText(
        job.employment_type ||
          job.job_type ||
          job.type ||
          ""
      ),
    };
  });
};

const runTask = async (client, action, params) => {
  const { data } = await client.post("/holocron/task", {
    action_id: action,
    params,
  });

  return data.job_id;
};

const pollJob = async (
  client,
  jobId,
  tries = POLL_TRIES
) => {
  for (let attempt = 0; attempt < tries; attempt += 1) {
    const { data } = await client.get(
      `/wire/jobs/${jobId}`
    );

    if (
      data.status === "completed" ||
      data.status === "failed"
    ) {
      return data;
    }

    await delay(POLL_DELAY_MS);
  }

  return null;
};

export async function aggregateJobs(options = {}) {
  const {
    tag = "",
    category = "",
    limit = DEFAULT_LIMIT,
    geo = "",
    industry = "",
    targetRole = "",
  } = options;

  /*
    USER FRIENDLY CATEGORY
    frontend/backend/devops/etc
  */

  const normalizedCategory =
    category?.toLowerCase()?.trim() || "";

  /*
    INTERNAL CATEGORY CONFIG
    Maps:
    - frontend -> Wire category
    - frontend -> richer search query
  */

  const CATEGORY_CONFIG = {
    frontend: {
      wireCategory: "programming",
      searchQuery:
        "react frontend javascript typescript nextjs",
    },

    backend: {
      wireCategory: "programming",
      searchQuery:
        "node.js backend express api mongodb sql",
    },

    fullstack: {
      wireCategory: "programming",
      searchQuery:
        "full stack react node.js typescript",
    },

    devops: {
      wireCategory: "devops-sysadmin",
      searchQuery:
        "aws docker kubernetes terraform devops",
    },

    "ai-ml": {
      wireCategory: "programming",
      searchQuery:
        "ai machine learning python llm tensorflow",
    },

    "data-science": {
      wireCategory: "programming",
      searchQuery:
        "data science python pandas analytics sql",
    },

    mobile: {
      wireCategory: "programming",
      searchQuery:
        "react native flutter ios android",
    },

    cybersecurity: {
      wireCategory: "devops-sysadmin",
      searchQuery:
        "cybersecurity cloud security network security",
    },
  };

  /*
    FINAL CATEGORY + SEARCH QUERY
  */

  const derivedCategory =
    CATEGORY_CONFIG[normalizedCategory]
      ?.wireCategory ||
    deriveCategoryFromRole(targetRole) ||
    "programming";

  const derivedTag =
    tag ||
    CATEGORY_CONFIG[normalizedCategory]
      ?.searchQuery ||
    deriveTagFromRole(targetRole) ||
    "javascript";

  /*
    TASKS
  */

  const tasks = [
    {
      action: "jb_jobs",
      params: {
        count: limit,
        geo,
        industry,
        tag: derivedTag,
      },
    },

    {
      action: "ro_jobs",
      params: {
        tag: derivedTag,
        limit,
      },
    },

    {
      action: "ww_category",
      params: {
        category: derivedCategory,
        limit,
      },
    },
  ];

  const client = getWireClient();

  const jobIds = [];

  /*
    START TASKS
  */

  for (const task of tasks) {
    try {
      const jobId = await runTask(
        client,
        task.action,
        task.params
      );

      jobIds.push({
        action: task.action,
        jobId,
      });
    } catch (error) {
      console.error(
        `Failed task: ${task.action}`,
        error.message
      );
    }
  }

  /*
    POLL RESULTS
  */

  const responses = await Promise.all(
    jobIds.map((task) =>
      pollJob(client, task.jobId)
    )
  );

  /*
    PARSE JOBS
  */

  const jobs = responses.flatMap((response, index) => {
  if (!response) return [];                       
  const action = jobIds[index]?.action;
  const source = SOURCE_LABELS[action] || "Wire";
  return parseWireJobs(response, source);
});

  /*
    REMOVE DUPLICATES
  */

  const deduped = new Map();

  jobs.forEach((job) => {
    const key =
      job.applyUrl ||
      `${job.title}-${job.company}-${job.location}`;

    if (!deduped.has(key)) {
      deduped.set(key, job);
    }
  });

  /*
    FINAL RESPONSE
  */

  return {
    jobs: Array.from(deduped.values()),

    total: deduped.size,

    category: normalizedCategory,

    wireCategory: derivedCategory,

    query: derivedTag,

    sources: [...new Set(jobs.map((job) => job.source))],

    jobIds,
  };
}