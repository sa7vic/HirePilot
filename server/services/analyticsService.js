// ─────────────────────────────────────────────────────────────────────────────
// STOPWORDS — anything here is silently dropped before skill counting
// ─────────────────────────────────────────────────────────────────────────────
const STOPWORDS = new Set([
  "a","an","and","are","as","at","be","by","for","from","has","have","in",
  "is","it","of","on","or","that","the","to","we","with","you","your",
  // job metadata
  "manager","management","product","products","design","designer","developer",
  "development","engineer","engineering","staff","lead","senior","junior","mid",
  "full","stack","programming","remote","hiring","job","jobs","work","working",
  "team","business","company","role","position","experience","requirements",
  "requirement","skill","skills","technology","technologies","using","build",
  "building","develop","application","applications","systems","system","talent",
  "talentos","person","pessoa","banco","desenvolvedora","analyst","software",
  "service","services","platform","platforms","solution","solutions",
  "infrastructure","web","digital","online","new","help","support","based",
  "looking","seeking","join","our","about","will","also","can","this","they",
  "their","would","make","into","over","each","than","then","when","where",
  "all","any","been","being","both","between","but","did","does","doing",
  "during","few","get","got","had","him","his","how","its","just","know",
  "let","like","may","more","most","much","must","need","no","not","now",
  "only","other","out","own","so","some","such","take","through","time",
  "two","up","use","used","very","way","what","which","who","why","year",
  // seniority / employment type labels
  "back-end","front-end","full-stack","back","front","end","intern","internship",
  "head","principal","director","vp","chief","contract","freelance","part-time",
  "full-time","temporary","associate","entry","level","mid-level",
  // non-tech business domains
  "graphic","creative","marketing","sales","commerce","research","copywriting",
  "support","operations","finance","legal","hr","recruiting","accounting",
  "communications","administration","writing","editing","translation",
  // roman/level suffixes
  "i","ii","iii","iv","sr","jr",
]);

// ─────────────────────────────────────────────────────────────────────────────
// HARD BLOCKLIST — regex patterns that identify non-skill tags
// These run on the raw tag string before any normalisation
// ─────────────────────────────────────────────────────────────────────────────
const NON_SKILL_PATTERNS = [
  // gender / diversity codes
  /^[mfwdx]\s*\/\s*[mfwdx]/i,
  /\(m\/f/i,
  // salary ranges embedded in tags  e.g. "80-100", "80k-100k"
  /^\d{2,3}[-–]\d{2,3}k?$/i,
  // pure number or numeric range
  /^\d+(\.\d+)?$/,
  // seniority levels
  /\b(senior|junior|intern|internship|lead|principal|head|director|vp|chief)\b/i,
  /\b(sr\.?|jr\.?|associate|entry.?level|mid.?level)\b/i,
  // roman numerals alone
  /^(i{1,3}|iv|vi{0,3}|ix)$/i,
  // employment type
  /\b(full.?time|part.?time|contract|freelance|temporary|remote|on.?site|hybrid)\b/i,
  // job category strings (not tech)
  /\bprogramming\b/i,
  /\bback[\s-]?end\b/i,
  /\bfront[\s-]?end\b/i,
  /\bfull[\s-]?stack\b/i,
  /\bsoftware\b/i,
  /\bweb\s+dev/i,
  /\bmarketing\b/i,
  /\bsales\b/i,
  /\bgraphic\b/i,
  /\bcreative\b/i,
  /\bfinance\b/i,
  /\boperations\b/i,
  /\baccounting\b/i,
  /\bpayroll\b/i,
  /\bcopywriting\b/i,
  /\brecruiting\b/i,
  /\bcustomer[\s-]?support\b/i,
  /\bbusiness[\s-]?dev/i,
  // arbitrary short codes that aren't real skills
  /^[a-z]{1,2}\/[a-z]{1,2}$/i,
  // percentage or score
  /\d+\s*%/,
];

const isNonSkillTag = (raw) => {
  const s = String(raw).trim();
  return NON_SKILL_PATTERNS.some((re) => re.test(s));
};

// ─────────────────────────────────────────────────────────────────────────────
// SKILL_ALIASES — canonical key for every surface variation
// ─────────────────────────────────────────────────────────────────────────────
const SKILL_ALIASES = {
  js:"javascript", javascript:"javascript",
  ts:"typescript", typescript:"typescript",
  reactjs:"react","react.js":"react", react:"react",
  nextjs:"next.js","next.js":"next.js", next:"next.js",
  vuejs:"vue","vue.js":"vue", vue:"vue",
  angularjs:"angular", angular:"angular",
  node:"node.js", nodejs:"node.js","node.js":"node.js",
  expressjs:"express", express:"express",
  mongodb:"mongodb", mongo:"mongodb",
  postgres:"postgresql", postgresql:"postgresql",
  mysql:"mysql", sql:"sql", nosql:"nosql",
  aws:"aws", azure:"azure", gcp:"gcp",
  cloud:"cloud","cloud computing":"cloud",
  docker:"docker",
  kubernetes:"kubernetes", k8s:"kubernetes",
  terraform:"terraform", ansible:"ansible",
  python:"python",
  golang:"go", go:"go",
  rust:"rust", scala:"scala", java:"java",
  "c#":"c#","c++":"c++",
  dotnet:".net",".net":".net",
  ruby:"ruby","ruby on rails":"rails", rails:"rails",
  php:"php", laravel:"laravel",
  swift:"swift", kotlin:"kotlin", dart:"dart",
  tensorflow:"tensorflow", pytorch:"pytorch",
  pandas:"pandas", numpy:"numpy",
  spark:"apache spark","apache spark":"apache spark",
  ai:"ai","artificial intelligence":"ai",
  ml:"machine learning","machine-learning":"machine learning",
  "machine learning":"machine learning",
  "deep learning":"deep learning","deep-learning":"deep learning", dl:"deep learning",
  nlp:"nlp","natural language processing":"nlp",
  "computer vision":"computer vision", cv:"computer vision",
  llm:"llm","large language model":"llm","large language models":"llm",
  openai:"openai", langchain:"langchain",
  huggingface:"hugging face","hugging face":"hugging face",
  devops:"devops","ci/cd":"ci/cd", cicd:"ci/cd",
  jenkins:"jenkins", github:"github", gitlab:"gitlab",
  graphql:"graphql",
  api:"api", apis:"api","rest api":"api", restful:"api",
  microservices:"microservices", serverless:"serverless",
  tailwindcss:"tailwind", tailwind:"tailwind",
  reduxjs:"redux", redux:"redux",
  firebase:"firebase", supabase:"supabase", linux:"linux",
  redis:"redis", kafka:"kafka", rabbitmq:"rabbitmq",
  elasticsearch:"elasticsearch", nginx:"nginx",
  dbt:"dbt",
  airflow:"airflow","apache airflow":"airflow",
  snowflake:"snowflake", bigquery:"bigquery", databricks:"databricks",
  flutter:"flutter","react native":"react native",
  ios:"ios", android:"android",
  cybersecurity:"cybersecurity", security:"cybersecurity",
  blockchain:"blockchain", solidity:"solidity",
  "data science":"data science","data analysis":"data analysis",
  "data engineering":"data engineering",
};

// ─────────────────────────────────────────────────────────────────────────────
// SKILL_LABELS — display names
// ─────────────────────────────────────────────────────────────────────────────
const SKILL_LABELS = {
  javascript:"JavaScript", typescript:"TypeScript",
  react:"React","next.js":"Next.js", vue:"Vue", angular:"Angular",
  "node.js":"Node.js", express:"Express",
  mongodb:"MongoDB", postgresql:"PostgreSQL", mysql:"MySQL",
  sql:"SQL", nosql:"NoSQL",
  aws:"AWS", azure:"Azure", gcp:"GCP", cloud:"Cloud",
  docker:"Docker", kubernetes:"Kubernetes",
  terraform:"Terraform", ansible:"Ansible",
  python:"Python", go:"Go", rust:"Rust", scala:"Scala", java:"Java",
  "c#":"C#","c++":"C++",".net":".NET",
  ruby:"Ruby", rails:"Rails", php:"PHP", laravel:"Laravel",
  swift:"Swift", kotlin:"Kotlin", dart:"Dart",
  tensorflow:"TensorFlow", pytorch:"PyTorch",
  pandas:"Pandas", numpy:"NumPy","apache spark":"Apache Spark",
  ai:"AI","machine learning":"Machine Learning","deep learning":"Deep Learning",
  nlp:"NLP","computer vision":"Computer Vision",
  llm:"LLM", openai:"OpenAI", langchain:"LangChain","hugging face":"Hugging Face",
  devops:"DevOps","ci/cd":"CI/CD",
  jenkins:"Jenkins", github:"GitHub", gitlab:"GitLab",
  graphql:"GraphQL", api:"API",
  microservices:"Microservices", serverless:"Serverless",
  tailwind:"Tailwind", redux:"Redux",
  firebase:"Firebase", supabase:"Supabase", linux:"Linux",
  redis:"Redis", kafka:"Kafka", elasticsearch:"Elasticsearch",
  dbt:"dbt", airflow:"Airflow",
  snowflake:"Snowflake", bigquery:"BigQuery", databricks:"Databricks",
  flutter:"Flutter","react native":"React Native", ios:"iOS", android:"Android",
  cybersecurity:"Cybersecurity",
  blockchain:"Blockchain", solidity:"Solidity",
  "data science":"Data Science","data analysis":"Data Analysis",
  "data engineering":"Data Engineering",
};

// ─────────────────────────────────────────────────────────────────────────────
// DUMMY SALARY BENCHMARKS — shown when live salary data is sparse
// ─────────────────────────────────────────────────────────────────────────────
const DUMMY_SALARY = {
  frontend:      { averageMin: 85000,  averageMax: 145000, sampleSize: 312 },
  backend:       { averageMin: 95000,  averageMax: 165000, sampleSize: 428 },
  fullstack:     { averageMin: 90000,  averageMax: 155000, sampleSize: 376 },
  devops:        { averageMin: 105000, averageMax: 175000, sampleSize: 214 },
  "ai-ml":       { averageMin: 120000, averageMax: 210000, sampleSize: 189 },
  "data-science":{ averageMin: 110000, averageMax: 185000, sampleSize: 241 },
  cybersecurity: { averageMin: 100000, averageMax: 170000, sampleSize: 163 },
  mobile:        { averageMin: 88000,  averageMax: 150000, sampleSize: 198 },
  default:       { averageMin: 90000,  averageMax: 155000, sampleSize: 287 },
};

// ─────────────────────────────────────────────────────────────────────────────
// helpers
// ─────────────────────────────────────────────────────────────────────────────
export const normalizeSkill = (value) => {
  if (!value) return "";
  const raw = String(value).toLowerCase().trim().replace(/\s+/g, " ");
  return SKILL_ALIASES[raw] || raw;
};

const formatSkill = (value) => SKILL_LABELS[value] || value;

// ─────────────────────────────────────────────────────────────────────────────
// extractKeywords — exported for use outside analytics (e.g. resume parsing)
// Returns [{keyword, count}] sorted by frequency, limited to `limit` entries
// ─────────────────────────────────────────────────────────────────────────────
export const extractKeywords = (text, limit = 30) => {
  if (!text) return [];
  const counts = new Map();
  String(text)
    .toLowerCase()
    .split(/[^a-z0-9+.#/-]/g)
    .filter(Boolean)
    .filter((t) => /^[a-z0-9.+#/-]+$/.test(t))
    .filter((t) => t.length >= 2)
    .filter((t) => !STOPWORDS.has(t))
    .forEach((token) => {
      const key = normalizeSkill(token);
      if (key) counts.set(key, (counts.get(key) || 0) + 1);
    });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([keyword, count]) => ({ keyword, count }));
};

// tokenise a free-text string into candidate skill tokens (internal)
const extractSkillTokens = (value) => {
  if (!value) return [];
  return String(value)
    .toLowerCase()
    .split(/[^a-z0-9+.#/-]/g)
    .filter(Boolean)
    .filter((t) => /^[a-z0-9.+#/-]+$/.test(t))
    .filter((t) => t.length >= 2)
    .filter((t) => !STOPWORDS.has(t));
};

// check a single candidate token is a plausible skill
const isLikelySkillToken = (token) => {
  // must contain at least one letter
  if (!/[a-z]/i.test(token)) return false;
  // reject pure number-like tokens
  if (/^\d+$/.test(token)) return false;
  // reject very short non-abbreviations (single letters, "or", "to" etc already in STOPWORDS)
  if (token.length < 2) return false;
  return true;
};

// ─────────────────────────────────────────────────────────────────────────────
// extractSkillsFromJob — the core extraction with three-stage filtering
// ─────────────────────────────────────────────────────────────────────────────
const extractSkillsFromJob = (job) => {
  const skills = new Set();

  // ── Stage 1: tags (highest signal) ──────────────────────────────────────
  (job.tags || []).forEach((tag) => {
    if (!tag) return;
    const raw = String(tag).trim();

    // 1a. hard block-list
    if (isNonSkillTag(raw)) return;

    // 1b. normalise and alias
    const normalized = normalizeSkill(raw);

    // 1c. drop if it ended up in STOPWORDS after normalisation
    if (!normalized || STOPWORDS.has(normalized)) return;

    // 1d. only accept tokens that look like real tech identifiers
    if (!isLikelySkillToken(normalized)) return;

    // 1e. must be in SKILL_ALIASES OR contain known tech characters
    const isKnownAlias = Boolean(SKILL_ALIASES[raw.toLowerCase()]);
    const looksLikeTech = /[.#+]/.test(normalized) || SKILL_LABELS[normalized];
    if (!isKnownAlias && !looksLikeTech && normalized.split(" ").length > 2) return;

    skills.add(normalized);
  });

  // ── Stage 2: title tokens ────────────────────────────────────────────────
  extractSkillTokens(job.title)
    .slice(0, 10)
    .forEach((token) => {
      const normalized = normalizeSkill(token);
      if (normalized && !STOPWORDS.has(normalized) && isLikelySkillToken(normalized)) {
        skills.add(normalized);
      }
    });

  // ── Stage 3: description tokens ─────────────────────────────────────────
  extractSkillTokens(job.description)
    .slice(0, 30)
    .forEach((token) => {
      const normalized = normalizeSkill(token);
      if (normalized && !STOPWORDS.has(normalized) && isLikelySkillToken(normalized)) {
        skills.add(normalized);
      }
    });

  return Array.from(skills).filter(Boolean).slice(0, 12);
};

// ─────────────────────────────────────────────────────────────────────────────
// parseSalary
// ─────────────────────────────────────────────────────────────────────────────
const parseSalary = (job) => {
  const text = [
    job.salary, job.salaryText, job.compensation, job.salary_min, job.salary_max,
  ].filter(Boolean).join(" ").replace(/\$/g,"").replace(/,/g,"");

  const numbers = (text.match(/\d+/g) || []).map(Number).filter((n) => n >= 30000);
  if (!numbers.length) return null;
  return { min: Math.min(...numbers), max: Math.max(...numbers) };
};

// ─────────────────────────────────────────────────────────────────────────────
// mapCategory
// ─────────────────────────────────────────────────────────────────────────────
const mapCategory = (job) => {
  const h = `${job.title} ${job.description} ${(job.tags||[]).join(" ")}`.toLowerCase();

  if (/react|vue|angular|frontend|front.end|next\.js|svelte|tailwind/.test(h)) return "Frontend";
  if (/backend|back.end|node\.js|django|rails|spring|express|fastapi|laravel/.test(h)) return "Backend";
  if (/full.?stack/.test(h)) return "Full Stack";
  if (/\bai\b|machine.learning|llm|deep.learning|pytorch|tensorflow|hugging/.test(h)) return "AI/ML";
  if (/data.science|data.engineering|spark|dbt|airflow|snowflake|bigquery|databricks|pandas/.test(h)) return "Data";
  if (/devops|docker|kubernetes|terraform|ansible|ci.?cd|jenkins|github.actions/.test(h)) return "DevOps";
  if (/ios|android|flutter|react.native|mobile|swift|kotlin/.test(h)) return "Mobile";
  if (/security|cybersecurity|pentest|soc|siem/.test(h)) return "Security";
  return "Other";
};

// ─────────────────────────────────────────────────────────────────────────────
// mapRegion
// ─────────────────────────────────────────────────────────────────────────────
const mapRegion = (location = "") => {
  const t = location.toLowerCase();
  if (!t || t === "worldwide" || t === "global") return "Remote/Global";
  if (/remote/.test(t)) return "Remote/Global";
  if (/usa|united states|us\b/.test(t)) return "US";
  if (/india/.test(t)) return "India";
  if (/canada/.test(t)) return "Canada";
  if (/germany|france|europe|netherlands|spain|poland|portugal|sweden|norway/.test(t)) return "Europe";
  if (/uk|united kingdom|england/.test(t)) return "UK";
  if (/australia|new zealand|singapore|japan|korea/.test(t)) return "APAC";
  if (/brazil|latam|latin/.test(t)) return "LATAM";
  return "Other";
};

// ─────────────────────────────────────────────────────────────────────────────
// buildMarketAnalytics — main export
// category: the user-selected category string ("frontend", "ai-ml", etc.)
// ─────────────────────────────────────────────────────────────────────────────
export function buildMarketAnalytics(jobs = [], category = "") {
  const skillCounts    = new Map();
  const pairingCounts  = new Map();
  const categoryCounts = new Map();
  const regionCounts   = new Map();
  const sourceCounts   = new Map();
  const salaries       = [];

  jobs.forEach((job) => {
    const skills = extractSkillsFromJob(job);

    skills.forEach((s) => skillCounts.set(s, (skillCounts.get(s) || 0) + 1));

    for (let i = 0; i < skills.length; i++) {
      for (let j = i + 1; j < skills.length; j++) {
        const pair = [skills[i], skills[j]].sort().join(" + ");
        pairingCounts.set(pair, (pairingCounts.get(pair) || 0) + 1);
      }
    }

    const cat = mapCategory(job);
    categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);

    const region = mapRegion(job.location || "");
    regionCounts.set(region, (regionCounts.get(region) || 0) + 1);

    const source = job.source || "Wire";
    sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);

    const salary = parseSalary(job);
    if (salary) salaries.push(salary);
  });

  const totalMentions = Array.from(skillCounts.values()).reduce((a, b) => a + b, 0);
  const avgCount = skillCounts.size > 0 ? totalMentions / skillCounts.size : 0;

  const topSkills = Array.from(skillCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([skill, count]) => ({ skill: formatSkill(skill), normalized: skill, count }));

  const trendingSkills = Array.from(skillCounts.entries())
    .map(([skill, count]) => ({
      skill: formatSkill(skill),
      normalized: skill,
      count,
      trendPct: avgCount > 0 ? Math.round((count / avgCount) * 100) : 0,
    }))
    .sort((a, b) => b.trendPct - a.trendPct)
    .slice(0, 10);

  const emergingTech = trendingSkills
    .filter((item) => item.count <= 5)
    .map((item) => item.skill)
    .slice(0, 8);

  const skillPairings = Array.from(pairingCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([pair, count]) => ({
      pair: pair.split(" + ").map(formatSkill).join(" + "),
      count,
    }));

  const jobCategories = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({ category, count }));

  const geoDemand = Array.from(regionCounts.entries())
    .map(([region, count]) => ({ region, count }));

  // salary: real data preferred, fall back to benchmark
  const salaryInsights = salaries.length >= 3
    ? {
        averageMin: Math.round(salaries.reduce((a, s) => a + s.min, 0) / salaries.length),
        averageMax: Math.round(salaries.reduce((a, s) => a + s.max, 0) / salaries.length),
        sampleSize: salaries.length,
        isEstimated: false,
      }
    : {
        ...(DUMMY_SALARY[category] || DUMMY_SALARY.default),
        isEstimated: true,
      };

  return {
    totalJobs: jobs.length,
    topSkills,
    trendingSkills,
    emergingTechnologies: emergingTech,
    skillPairings,
    jobCategories,
    geoDemand,
    salaryInsights,
    sources: Array.from(sourceCounts.entries()).map(([source, count]) => ({ source, count })),
  };
}