import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  createTask,
  getProjectTasks,
  updateTask,
  getTaskById,
  deleteTask,
  getMyTasks,
  getMyProjectTasks, updateStaffTask,getStaffTaskById,

} from "../controllers/taskController.js";

const router = express.Router();


// Create task
router.post("/", authMiddleware, createTask);


// Get tasks assigned to logged-in staff
router.get("/my-tasks", authMiddleware, getMyTasks);


// Get single task
router.get("/single/:id", authMiddleware, getTaskById);


router.get("/my-project/:projectId",authMiddleware,getMyProjectTasks);

// Get single task for assigned staff
router.get("/staff/single/:id",authMiddleware,getStaffTaskById);

// Get all tasks of a project
router.get("/:projectId", authMiddleware, getProjectTasks);


// Update task
router.put("/:id", authMiddleware, updateTask);


// Delete task
router.delete("/:id", authMiddleware, deleteTask);

// update task by staff
router.put("/staff/:id",authMiddleware,updateStaffTask);

export default router;