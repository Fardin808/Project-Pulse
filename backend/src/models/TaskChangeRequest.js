import mongoose from "mongoose";

const taskRequestSchema = new mongoose.Schema(
  {
    // Staff member who sends the request
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Task the staff wants to change
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    // Reason for requesting a task change
    reason: {
      type: String,
      required: true,
    },

    // Admin's decision
    status: {
      type: String,
      enum: ["pending", "holding", "approved", "rejected"],
      default: "pending",
    },

    // Optional response from admin
    adminResponse: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const TaskChangeRequest = mongoose.model(
  "TaskRequest",
  taskRequestSchema
);

export default TaskChangeRequest;