import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Unique identifier for an automatically generated notification
    eventKey: {
      type: String,
      default: undefined,
    },

    type: {
      type: String,
      enum: [
        "task_assigned",
        "task_unassigned",
        "task_updated",
        "task_ready",
        "request_submitted",
        "request_holding",
        "request_approved",
        "request_rejected",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    //stores the ID of Task A
    relatedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    //stores the ID of Project A
    relatedProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index(
  { eventKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      eventKey: { $type: "string" },
    },
  }
);

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

export default Notification;