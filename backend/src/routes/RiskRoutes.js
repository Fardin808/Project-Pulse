
import express from "express";
import { getRisks } from "../controllers/RiskController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin and Staff can view their permitted risks
router.get("/", protect, getRisks);

export default router;
