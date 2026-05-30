import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  coverLetter,
  interviewPrep,
  jobMatch,
  marketResumeOptimize,
  resumeAnalyze,
  resumeProfile,
} from "../controllers/aiController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  "/resume-analyze",
  authMiddleware,
  upload.single("resume"),
  resumeAnalyze
);
router.post("/job-match", authMiddleware, jobMatch);
router.post("/cover-letter", authMiddleware, coverLetter);
router.post("/interview-prep", authMiddleware, interviewPrep);
router.post("/market-resume", authMiddleware, marketResumeOptimize);
router.get("/resume-profile", authMiddleware, resumeProfile);

export default router;
