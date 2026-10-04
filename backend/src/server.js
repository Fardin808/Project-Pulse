import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js"
import taskRoutes from "./routes/taskRoutes.js";

import staffFindingRoutes from "./routes/staffFindingRoutes.js";
import taskRequestRoutes from "./routes/taskRequestRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();
connectDB();

const app = express(); //backend server

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/projects",projectRoutes);
app.use("/api/tasks",taskRoutes);
app.use("/api/staff", staffFindingRoutes);
app.use("/api/task-requests", taskRequestRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Restaurant Reservation API is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
