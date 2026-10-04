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