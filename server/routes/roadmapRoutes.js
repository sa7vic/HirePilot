import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { generateCareerRoadmap } from "../controllers/roadmapController.js";

const router = express.Router();

router.post("/", authMiddleware, generateCareerRoadmap);

export default router;
