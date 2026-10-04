import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {createProject,getAllProjects,deleteProject,updateProject,getMyProjects} from "../controllers/projectController.js";

const router = express.Router();

// Staff projects
router.get("/my-projects", authMiddleware, getMyProjects);

// Admin projects
router.get("/", authMiddleware, getAllProjects);

router.post("/", authMiddleware, createProject);

router.delete("/:id", authMiddleware, deleteProject);

router.put("/:id", authMiddleware, updateProject);

export default router;