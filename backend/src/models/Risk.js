import mongoose from "mongoose";

const riskSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "overdue",
        "no_progress",
        "dependency_risk",
        "effort_anomaly",
        "team_bottleneck",
      ],
      required: true,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "resolved"],
      default: "active",
    },

    detectedAt: {
      type: Date,
      default: Date.now,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate risk records for the same task and risk type
riskSchema.index(
  { taskId: 1, type: 1 },
  { unique: true }
);

const Risk = mongoose.model("Risk", riskSchema);

export default Risk;