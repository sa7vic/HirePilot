import fs from "fs";
import pdfParse from "pdf-parse";
import User from "../models/User.js";
import { extractJson, groqChat } from "../services/groqService.js";
import { analyzeMarketResume } from "../services/marketResumeAnalyzer.js";

const limitText = (text, max = 12000) =>
  text.length > max ? text.slice(0, max) : text;

export async function resumeAnalyze(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = limitText(pdfData.text || "");

    const prompt = `You are an ATS-focused recruiter. Return STRICT JSON only, no markdown, no extra text.\n\nRequired JSON structure:\n{\n  "ats_score": number,\n  "experience_level": "",\n  "top_skills": [],\n  "missing_skills": [],\n  "strengths": [],\n  "weaknesses": [],\n  "recommended_roles": [],\n  "resume_summary": ""\n}\n\nRules:\n- ats_score is 0-100 integer.\n- experience_level must be one of: Intern, Junior, Mid, Senior.\n- top_skills and missing_skills should be concise, 5-12 items.\n- strengths and weaknesses should be short, recruiter-style bullets.\n- resume_summary must be 2-3 sentences, no fluff.\n\nResume text:\n"""${resumeText}"""`;

    const content = await groqChat({
      messages: [
        { role: "system", content: "You are a resume analyst." },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
    });

    const analysis = extractJson(content) || {
      ats_score: 0,
      experience_level: "",
      top_skills: [],
      missing_skills: [],
      strengths: [],
      weaknesses: [],
      recommended_roles: [],
      resume_summary: "",
    };

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        resumeUrl: `/uploads/${req.file.filename}`,
        resumeText,
        skills: analysis.top_skills || [],
        preferredRoles: analysis.recommended_roles || [],
        resumeAnalysis: analysis,
      },
      { new: true }
    );

    return res.json({ analysis, resumeUrl: user?.resumeUrl });
  } catch (err) {
    return next(err);
  }
}

export async function resumeProfile(req, res, next) {
  try {
    const user = await User.findById(req.userId).select(
      "skills preferredRoles resumeUrl resumeText resumeAnalysis"
    );
    if (!user?.resumeText) {
      return res.status(404).json({ message: "Resume not analyzed yet" });
    }

    return res.json({
      skills: user.skills || [],
      preferredRoles: user.preferredRoles || [],
      missingSkills: user.resumeAnalysis?.missing_skills || [],
      resumeSummary: user.resumeAnalysis?.resume_summary || "",
      resumeUrl: user.resumeUrl || "",
    });
  } catch (err) {
    return next(err);
  }
}

export async function marketResumeOptimize(req, res, next) {
  try {
    const { targetRole, tag, category } = req.body || {};
    if (!targetRole) {
      return res.status(400).json({ message: "Target role is required" });
    }

    const user = await User.findById(req.userId);
    if (!user?.resumeText) {
      return res.status(400).json({ message: "Upload a resume first" });
    }

    const result = await analyzeMarketResume({
      user,
      targetRole,
      tag,
      category,
    });

    return res.json({ result });
  } catch (err) {
    return next(err);
  }
}

export async function interviewPrep(req, res, next) {
  try {
    const { company, role, jobDescription } = req.body;
    if (!company || !role) {
      return res
        .status(400)
        .json({ message: "Company and role are required" });
    }

    const user = await User.findById(req.userId);
    const text = user?.resumeText || "";

    if (!text) {
      return res
        .status(400)
        .json({ message: "Upload a resume before interview prep" });
    }

    const prompt = `You are a senior recruiter preparing interview prep. Return STRICT JSON only.

Required JSON structure:
{
  "focus_areas": [],
  "questions": [
    {
      "question": "",
      "why_it_matters": "",
      "what_to_cover": ""
    }
  ],
  "red_flags": [],
  "closing_pitch": ""
}

Rules:
- focus_areas: 4-8 concise topics.
- questions: 6-10 items with actionable guidance.
- red_flags: 3-6 short risks to avoid.
- closing_pitch: 2-3 sentences, confident but not exaggerated.

Company: ${company}
Role: ${role}
Job description (if provided):
"""${limitText(jobDescription || "")}"""

Resume text:
"""${limitText(text)}"""`;

    const content = await groqChat({
      messages: [
        { role: "system", content: "You are a hiring manager." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    const result = extractJson(content) || {
      focus_areas: [],
      questions: [],
      red_flags: [],
      closing_pitch: "",
    };

    return res.json({ result });
  } catch (err) {
    return next(err);
  }
}

export async function jobMatch(req, res, next) {
  try {
    const { jobDescription, resumeText } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ message: "Job description is required" });
    }

    const user = await User.findById(req.userId);
    const text = resumeText || user?.resumeText;

    if (!text) {
      return res
        .status(400)
        .json({ message: "Upload a resume before matching jobs" });
    }

    const prompt = `You are a recruiter scoring candidate-job fit. Return STRICT JSON only.\n\nRequired JSON structure:\n{\n  "match_score": number,\n  "matched_skills": [],\n  "missing_skills": [],\n  "strengths_for_role": [],\n  "improvement_suggestions": [],\n  "final_recommendation": ""\n}\n\nRules:\n- match_score is 0-100 integer, realistic.\n- matched_skills and missing_skills are concise tags.\n- strengths_for_role and improvement_suggestions are 3-6 recruiter bullets.\n- final_recommendation is 1-2 sentences, factual and actionable.\n\nResume text:\n"""${limitText(text)}"""\n\nJob description:\n"""${limitText(jobDescription)}"""`;

    const content = await groqChat({
      messages: [
        { role: "system", content: "You are a career coach." },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
    });

    const result = extractJson(content) || {
      match_score: 0,
      matched_skills: [],
      missing_skills: [],
      strengths_for_role: [],
      improvement_suggestions: [],
      final_recommendation: "",
    };

    return res.json({ result });
  } catch (err) {
    return next(err);
  }
}

export async function coverLetter(req, res, next) {
  try {
    const { company, role, jobDescription, resumeText } = req.body;
    if (!company || !role || !jobDescription) {
      return res
        .status(400)
        .json({ message: "Company, role, and job description are required" });
    }

    const user = await User.findById(req.userId);
    const text = resumeText || user?.resumeText || "";

    const prompt = `Write a concise, ATS-friendly cover letter under 350 words. Use a professional recruiter-friendly tone.\n\nRules:\n- No exaggerated language or fake enthusiasm.\n- Mention relevant skills and experience from the resume.\n- Align directly to the job description.\n- 3-4 short paragraphs max.\n\nCompany: ${company}\nRole: ${role}\nJob description:\n"""${limitText(jobDescription)}"""\n\nResume highlights:\n"""${limitText(text)}"""`;

    const content = await groqChat({
      messages: [
        { role: "system", content: "You are a professional career writer." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    return res.json({ coverLetter: content.trim() });
  } catch (err) {
    return next(err);
  }
}
