import express from "express";
import cron from "node-cron";
import { checkScheduledUnlocks } from "./services/scheduledUnlockService.js";
import { checkOverdueTasks, checkNoProgressTasks, checkDependencyRisks, checkEffortAnomalies, checkTeamBottlenecks,} from "./services/riskDetectionService.js";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js"
import taskRoutes from "./routes/taskRoutes.js";

import staffFindingRoutes from "./routes/staffFindingRoutes.js";
import taskRequestRoutes from "./routes/taskRequestRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

import riskRoutes from "./routes/RiskRoutes.js";


dotenv.config();

const isVercel = Boolean(process.env.VERCEL);

if (!isVercel) {
  connectDB().catch((error) => {
    console.error("Database startup failed:", error);
    process.exit(1);
  });
}
const app = express(); //backend server

app.use(cors());
app.use(express.json());

if (isVercel) {
  app.use(async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (error) {
      res.status(503).json({
        message: "Database connection unavailable",
      });
    }
  });
}

app.use("/api/auth", authRoutes);
app.use("/api/projects",projectRoutes);
app.use("/api/tasks",taskRoutes);
app.use("/api/staff", staffFindingRoutes);
app.use("/api/task-requests", taskRequestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/risks", riskRoutes);

app.get("/", (req, res) => {
  res.send("Project Pluse API is running");
});

const PORT = process.env.PORT || 5000;

if (!isVercel){
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Check scheduled task unlocks every minute
  cron.schedule("* * * * *", async () => {
    try {
      await checkScheduledUnlocks();
    } catch (error) {
      console.error("Scheduled unlock check failed:", error);
    }
  });

  // Automatically check overdue tasks every 2 minutes
  cron.schedule("*/2 * * * *", async () => {
    try {
      const result = await checkOverdueTasks();

      if (result.detected > 0 || result.resolved > 0) {
        console.log("Overdue risk check:", result);
      }
    } catch (error) {
      console.error("Overdue risk check failed:", error);
    }
  });

  // Check for tasks without progress every 2 minutes
  cron.schedule("*/2 * * * *", async () => {
    try {
      const result = await checkNoProgressTasks();

      if (result.detected > 0 || result.resolved > 0) {
        console.log("No-progress risk check:", result);
      }
    } catch (error) {
      console.error("No-progress risk check failed:", error);
    }
  });

  // Check dependency risks every 2 minutes
  cron.schedule("*/2 * * * *", async () => {
    try {
      const result = await checkDependencyRisks();

      if (result.detected > 0 || result.resolved > 0) {
        console.log("Dependency risk check:", result);
      }
    } catch (error) {
      console.error("Dependency risk check failed:", error);
    }
  });

  // Check effort estimation anomalies every 2 minutes
  cron.schedule("*/2 * * * *", async () => {
    try {
      const result = await checkEffortAnomalies();

      if (
        result.detected > 0 ||
        result.updated > 0 ||
        result.resolved > 0
      ) {
        console.log("Effort anomaly check:", result);
      }
    } catch (error) {
      console.error("Effort anomaly check failed:", error);
    }
});

    // Check team bottlenecks every 2 minutes
    cron.schedule("*/2 * * * *", async () => {
      try {
        const result = await checkTeamBottlenecks();

        if (
          result.detected > 0 ||
          result.updated > 0 ||
          result.resolved > 0
        ) {
          console.log("Team bottleneck check:", result);
        }
      } catch (error) {
        console.error("Team bottleneck check failed:", error);
      }
    });
});}
export default app;
