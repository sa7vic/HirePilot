import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  executeTask,
  getCatalog,
  getJob,
  listCatalogs,
  searchActions,
} from "../controllers/wireController.js";

const router = express.Router();

router.get("/catalogs", authMiddleware, listCatalogs);
router.get("/catalog/:slug", authMiddleware, getCatalog);
router.get("/search", authMiddleware, searchActions);
router.post("/task", authMiddleware, executeTask);
router.get("/jobs/:id", authMiddleware, getJob);

export default router;
