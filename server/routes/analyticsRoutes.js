import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { marketAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

router.post("/market", authMiddleware, marketAnalytics);

export default router;