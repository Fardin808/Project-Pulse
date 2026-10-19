import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,

    },

    assignedMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Prerequisite task: completion or scheduled date unlocks this task
    dependency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    // Days after the prerequisite's original planned start date
    dependencyOffsetDays: {
      type: Number,
      min: 0,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "Dependency offset must be a whole number.",
      },
    },


    // date of previous task
    dependencyOriginalStartDate: {
      type: Date,
      default: null,
    },

    // Tracks whether the scheduled unlock notification was sent
    scheduledUnlockNotifiedAt: {
      type: Date,
      default: null,
    },

    priority: {
      type: String,
      enum: ["low", "normal", "high","critical"],
      default: "normal",
    },

    status: {
      type: String,
      enum: ["backlog", "todo", "inprogress","blocked","review","testing","completed"],
      default: "backlog",
    },

    plannedStartDate: {
      type: Date,
    },

    dueDate: {
      type: Date,
    },

    completionDate: {
      type: Date,
    },

    estimatedHours: {
      type: Number,
    },

    actualHours: {
      type: Number,
      default: 0,
    },

    progressNotes: {
      type: String,
    },

    // Last meaningful progress activity
    lastProgressAt: {
      type: Date,
      default: Date.now,
    },

    // project ID
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },


    // Admin ID
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

  },
  {
    timestamps: true,
  }
);


const Task = mongoose.model("Task", taskSchema);

export default Task;