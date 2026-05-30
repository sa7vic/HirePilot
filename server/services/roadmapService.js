import { aggregateJobs } from "./jobAggregationService.js";
import { buildMarketAnalytics, normalizeSkill } from "./analyticsService.js";
import { getAdjacentSkills } from "./skillGraph.js";
import { extractJson, groqChat } from "./groqService.js";

const buildReadinessScore = (topSkills, userSkillsSet) => {
  if (!topSkills.length) return 0;
  const matched = topSkills.filter((skill) => userSkillsSet.has(skill)).length;
  return Math.round((matched / topSkills.length) * 100);
};

const estimateTimeline = (missingCount) => {
  if (missingCount >= 8) return "5-7 months";
  if (missingCount >= 5) return "3-5 months";
  if (missingCount >= 3) return "2-3 months";
  if (missingCount >= 1) return "1-2 months";
  return "0-1 month";
};

export async function generateRoadmap({ user, targetRole, tag, category }) {
  const { jobs } = await aggregateJobs({
    targetRole,
    tag,
    category,
    limit: 35,
  });

  const analytics = buildMarketAnalytics(jobs);
  const topSkills = analytics.topSkills.slice(0, 10);

  const userSkills = (user.skills?.length
    ? user.skills
    : user.resumeAnalysis?.top_skills || [])
    .map((skill) => normalizeSkill(skill))
    .filter(Boolean);

  const userSkillsSet = new Set(userSkills);

  const missingSkills = topSkills
    .filter((skill) => !userSkillsSet.has(skill.normalized))
    .map((skill) => skill.skill)
    .slice(0, 8);

  const readinessScore = buildReadinessScore(
    topSkills.map((skill) => skill.normalized),
    userSkillsSet
  );

  const marketDemand = jobs.length >= 45 ? "High" : jobs.length >= 20 ? "Medium" : "Low";
  const trendingTechnologies = analytics.trendingSkills
    .slice(0, 6)
    .map((item) => item.skill);

  const adjacentSkills = getAdjacentSkills([
    ...userSkills,
    ...missingSkills.map((skill) => normalizeSkill(skill)),
  ]).slice(0, 6);

  const fallback = {
    targetRole,
    readinessScore,
    marketDemand,
    missingSkills,
    recommendedLearningOrder: [...missingSkills, ...adjacentSkills].slice(0, 8),
    estimatedTimeline: estimateTimeline(missingSkills.length),
    trendingTechnologies,
    recruiterInsights: [
      "Focus on demonstrating recent project outcomes tied to the target role.",
      "Highlight measurable impact and ownership in your resume bullets.",
      "Build proof-of-work for the missing skills in the roadmap.",
    ],
  };

  const prompt = `Return STRICT JSON only. Use the provided values for targetRole, readinessScore, marketDemand, missingSkills, trendingTechnologies. Fill the remaining fields with concise recruiter-style guidance.

Required JSON structure:
{
  "targetRole": "",
  "readinessScore": number,
  "marketDemand": "",
  "missingSkills": [],
  "recommendedLearningOrder": [],
  "estimatedTimeline": "",
  "trendingTechnologies": [],
  "recruiterInsights": []
}

Provided values:
- targetRole: ${targetRole}
- readinessScore: ${readinessScore}
- marketDemand: ${marketDemand}
- missingSkills: ${JSON.stringify(missingSkills)}
- trendingTechnologies: ${JSON.stringify(trendingTechnologies)}
- adjacentSkills: ${JSON.stringify(adjacentSkills)}

Rules:
- recommendedLearningOrder should prioritize missingSkills first, then adjacentSkills.
- estimatedTimeline should be realistic for an employed learner.
- recruiterInsights must be 3-5 short bullets.
- Do not add any extra keys or markdown.`;

  try {
    const content = await groqChat({
      messages: [
        { role: "system", content: "You are a career roadmap strategist." },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
    });

    const parsed = extractJson(content);
    if (!parsed) return fallback;

    return {
      targetRole: parsed.targetRole || fallback.targetRole,
      readinessScore: Number.isFinite(parsed.readinessScore)
        ? parsed.readinessScore
        : fallback.readinessScore,
      marketDemand: parsed.marketDemand || fallback.marketDemand,
      missingSkills: Array.isArray(parsed.missingSkills)
        ? parsed.missingSkills
        : fallback.missingSkills,
      recommendedLearningOrder: Array.isArray(parsed.recommendedLearningOrder)
        ? parsed.recommendedLearningOrder
        : fallback.recommendedLearningOrder,
      estimatedTimeline: parsed.estimatedTimeline || fallback.estimatedTimeline,
      trendingTechnologies: Array.isArray(parsed.trendingTechnologies)
        ? parsed.trendingTechnologies
        : fallback.trendingTechnologies,
      recruiterInsights: Array.isArray(parsed.recruiterInsights)
        ? parsed.recruiterInsights
        : fallback.recruiterInsights,
    };
  } catch {
    return fallback;
  }
}
