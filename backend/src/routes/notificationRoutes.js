import express from "express";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notificationController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


// Get logged-in user's notifications
router.get("/", authMiddleware, getMyNotifications);


// Mark all notifications as read
router.put("/read-all", authMiddleware, markAllNotificationsAsRead);


// Mark one notification as read
router.put("/:id/read", authMiddleware, markNotificationAsRead);


export default router;
