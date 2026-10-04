import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getAllStaff } from "../controllers/staffFindingController.js";

const router= express.Router();

router.get("/", authMiddleware, getAllStaff);

export default router;