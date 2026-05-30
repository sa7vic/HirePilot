import { groqChat, extractJson } from "./groqService.js";

const SYSTEM_PROMPT = `You are a technical recruiting data analyst.
You will receive raw analytics extracted from job postings for a specific tech category.
Clean and restructure the data by following these rules strictly:

SKILLS (topSkills, trendingSkills, emergingTechnologies):
- Keep ONLY real software technologies: programming languages, frameworks, databases, cloud platforms, dev tools, methodologies.
- Remove everything that is NOT a recognizable tech skill: seniority levels (senior, junior, pleno, lead), job titles, business terms, foreign words (de, bdr, sp, pr-vendas), gender codes (m/f/d, f/m/x), salary ranges (80-100, 100k), single letters, roman numerals (i, ii, iii), abbreviations that aren't tech.
- Normalize display names: "js" → "JavaScript", "ts" → "TypeScript", "node" → "Node.js", "py" → "Python", "k8s" → "Kubernetes", etc.

SKILL PAIRINGS:
- Only keep pairings where BOTH items are valid tech skills after the above filtering.
- Drop any pairing containing a non-tech word.

EMERGING TECHNOLOGIES:
- Only keep real tech tools or frameworks that are genuinely new or rising.

JOB CATEGORIES, GEO DEMAND, SALARY INSIGHTS, SOURCES:
- Return these completely unchanged.

Return ONLY a raw JSON object — no markdown fences, no explanation, no preamble.
The JSON must match this exact shape:
{
  "totalJobs": number,
  "topSkills": [{ "skill": string, "normalized": string, "count": number }],
  "trendingSkills": [{ "skill": string, "normalized": string, "count": number, "trendPct": number }],
  "emergingTechnologies": [string],
  "skillPairings": [{ "pair": string, "count": number }],
  "jobCategories": [{ "category": string, "count": number }],
  "geoDemand": [{ "region": string, "count": number }],
  "salaryInsights": { "averageMin": number, "averageMax": number, "sampleSize": number, "isEstimated": boolean },
  "sources": [{ "source": string, "count": number }]
}`;

export async function cleanAnalyticsWithAI(rawAnalytics, category = "") {
  try {
    const userMessage = `Category selected by user: "${category}"

Raw analytics to clean:
${JSON.stringify(rawAnalytics, null, 2)}`;

    const content = await groqChat({
      temperature: 0.1,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: userMessage },
      ],
    });

    const parsed = extractJson(content);

    if (!parsed) {
      console.warn("[analyticsClean] extractJson returned null — falling back to raw");
      return rawAnalytics;
    }

    // Sanity check required keys
    const required = [
      "totalJobs", "topSkills", "trendingSkills", "emergingTechnologies",
      "skillPairings", "jobCategories", "geoDemand", "salaryInsights",
    ];
    const missing = required.filter((k) => !(k in parsed));
    if (missing.length) {
      console.warn("[analyticsClean] missing keys:", missing, "— falling back to raw");
      return rawAnalytics;
    }

    console.log(
      `[analyticsClean] OK | topSkills=${parsed.topSkills.length} | pairings=${parsed.skillPairings.length}`
    );

    return parsed;
  } catch (err) {
    console.error("[analyticsClean] failed, using raw analytics:", err.message);
    return rawAnalytics;
  }
}