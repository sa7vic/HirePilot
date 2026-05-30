import { aggregateJobs } from "./jobAggregationService.js";
import { buildMarketAnalytics, extractKeywords, normalizeSkill } from "./analyticsService.js";
import { extractJson, groqChat } from "./groqService.js";

const estimateAlignmentScore = (matches, total) => {
  if (!total) return 0;
  return Math.round((matches / total) * 100);
};

export async function analyzeMarketResume({ user, targetRole, tag, category }) {
  const { jobs } = await aggregateJobs({
    targetRole,
    tag,
    category,
    limit: 35,
  });

  const topSkills = analytics.topSkills.slice(0, 12);

  const resumeText = (user.resumeText || "").toLowerCase();
  const userSkills = (user.skills?.length
    ? user.skills
    : user.resumeAnalysis?.top_skills || [])
    .map((skill) => normalizeSkill(skill))
    .filter(Boolean);
  const userSkillSet = new Set(userSkills);

  const missingSkills = topSkills
    .filter((skill) => !userSkillSet.has(skill.normalized))
    .map((skill) => skill.skill)
    .filter((skill) => !resumeText.includes(skill.toLowerCase()))
    .slice(0, 8);

  const combinedText = jobs
    .slice(0, 50)
    .map((job) => `${job.title} ${job.description}`)
    .join(" ");

  const keywords = extractKeywords(combinedText, 25);
  const keywordList = keywords.map((item) => item.keyword);

  const missingKeywords = keywordList
    .filter((keyword) => !resumeText.includes(keyword))
    .slice(0, 10);

  const matchedSkills = topSkills.length - missingSkills.length;
  const matchedKeywords = keywordList.length - missingKeywords.length;
  const atsAlignmentScore = estimateAlignmentScore(
    matchedSkills + matchedKeywords,
    topSkills.length + keywordList.length
  );

  const fallback = {
    atsAlignmentScore,
    missingKeywords,
    missingSkills,
    improvementSuggestions: [
      "Add measurable outcomes for key projects tied to the target role.",
      "Mirror high-frequency market keywords in your experience bullets.",
      "Highlight recent tooling or frameworks that match job demand.",
    ],
    recruiterConcerns: [
      "Market keywords are missing from the top experience section.",
      "Tooling depth is not obvious in current resume bullets.",
    ],
    marketInsights: analytics.trendingSkills.slice(0, 3).map((item) =>
      `${item.skill} appears in ${item.count} postings from the current sample.`
    ),
  };

  const prompt = `Return STRICT JSON only. Use the provided values for atsAlignmentScore, missingKeywords, missingSkills. Provide concise recruiter-style improvements.

Required JSON structure:
{
  "atsAlignmentScore": number,
  "missingKeywords": [],
  "missingSkills": [],
  "improvementSuggestions": [],
  "recruiterConcerns": [],
  "marketInsights": []
}

Provided values:
- atsAlignmentScore: ${atsAlignmentScore}
- missingKeywords: ${JSON.stringify(missingKeywords)}
- missingSkills: ${JSON.stringify(missingSkills)}
- marketSignals: ${JSON.stringify(analytics.trendingSkills.slice(0, 6))}

Rules:
- improvementSuggestions: 4-6 bullets, actionable.
- recruiterConcerns: 2-4 bullets.
- marketInsights: 3-5 bullets tied to provided marketSignals.
- Do not add extra keys or markdown.`;

  try {
    const content = await groqChat({
      messages: [
        { role: "system", content: "You are an ATS resume strategist." },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
    });

    const parsed = extractJson(content);
    if (!parsed) return fallback;

    return {
      atsAlignmentScore: Number.isFinite(parsed.atsAlignmentScore)
        ? parsed.atsAlignmentScore
        : fallback.atsAlignmentScore,
      missingKeywords: Array.isArray(parsed.missingKeywords)
        ? parsed.missingKeywords
        : fallback.missingKeywords,
      missingSkills: Array.isArray(parsed.missingSkills)
        ? parsed.missingSkills
        : fallback.missingSkills,
      improvementSuggestions: Array.isArray(parsed.improvementSuggestions)
        ? parsed.improvementSuggestions
        : fallback.improvementSuggestions,
      recruiterConcerns: Array.isArray(parsed.recruiterConcerns)
        ? parsed.recruiterConcerns
        : fallback.recruiterConcerns,
      marketInsights: Array.isArray(parsed.marketInsights)
        ? parsed.marketInsights
        : fallback.marketInsights,
    };
  } catch {
    return fallback;
  }
}
