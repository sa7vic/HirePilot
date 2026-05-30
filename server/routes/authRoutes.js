import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { login, me, register } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);

export default router;
