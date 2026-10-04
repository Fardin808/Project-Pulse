import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  createTaskRequest,
  getMyTaskRequests,
  getAllTaskRequests,
  updateTaskRequest,
} from "../controllers/taskRequestController.js";

const router = express.Router();


// Staff creates a task change request
router.post(
  "/",
  authMiddleware,
  createTaskRequest
);


// Staff views their own requests
router.get(
  "/my-requests",
  authMiddleware,
  getMyTaskRequests
);


// Admin views all requests
router.get(
  "/",
  authMiddleware,
  getAllTaskRequests
);


// Admin approves/rejects a request
router.put(
  "/:id",
  authMiddleware,
  updateTaskRequest
);


export default router;