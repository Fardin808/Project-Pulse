import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  start_date: {
    type: Date,
  },
  target_completion_date: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["pending", "ongoing", "completed"],
    default: "pending",
  },

  createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
},
});

const Project = mongoose.model("Project", projectSchema);
export default Project;
