import User from "../models/User.js";
import { generateRoadmap } from "../services/roadmapService.js";

export async function generateCareerRoadmap(req, res, next) {
  try {
    const { targetRole, tag, category } = req.body || {};
    if (!targetRole) {
      return res.status(400).json({ message: "Target role is required" });
    }

    const user = await User.findById(req.userId);
    if (!user?.resumeText) {
      return res.status(400).json({ message: "Upload a resume first" });
    }

    const roadmap = await generateRoadmap({ user, targetRole, tag, category });
    return res.json({ roadmap });
  } catch (err) {
    return next(err);
  }
}
