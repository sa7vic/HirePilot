import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createApplication,
  deleteApplication,
  listApplications,
  updateApplication,
} from "../controllers/applicationController.js";

const router = express.Router();

router.get("/", authMiddleware, listApplications);
router.post("/", authMiddleware, createApplication);
router.patch("/:id", authMiddleware, updateApplication);
router.delete("/:id", authMiddleware, deleteApplication);

export default router;
