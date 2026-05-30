import { aggregateJobsForAnalytics } from "../services/analyticsAggregationService.js";
import { buildMarketAnalytics } from "../services/analyticsService.js";
import { cleanAnalyticsWithAI } from "../services/analyticsCleanerService.js";

export async function marketAnalytics(req, res, next) {
  try {
    const { category = "frontend", limit } = req.body || {};

    // 1. Fetch raw jobs from Wire
    const { jobs } = await aggregateJobsForAnalytics({ category, limit });
    console.log(`[analytics] category=${category} | jobs=${jobs.length}`);

    // 2. Build raw counts/pairings/regions from job data
    const rawAnalytics = buildMarketAnalytics(jobs, category);

    // 3. Send through Groq to strip noise and normalize skill names
    const analytics = await cleanAnalyticsWithAI(rawAnalytics, category);

    return res.json({ jobsCount: jobs.length, analytics });
  } catch (err) {
    return next(err);
  }
}