
import Risk from "../models/Risk.js";
import Task from "../models/Task.js";
import Project from "../models/Project.js";

// GET /api/risks
export const getRisks = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let filter = {};

    if (role === "admin") {
      // Admin sees risks from projects they created
      const projects = await Project.find({
        createdBy: userId,
      }).select("_id");

      const projectIds = projects.map((project) => project._id);

      filter = {
        projectId: { $in: projectIds },
      };

    } else if (role === "staff") {
      // Staff sees risks only for assigned tasks
      const tasks = await Task.find({
        assignedMembers: userId,
      }).select("_id");

      const taskIds = tasks.map((task) => task._id);

      filter = {
        taskId: { $in: taskIds },
      };

    } else {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const risks = await Risk.find(filter)
      .populate("taskId", "title status priority dueDate")
      .populate("projectId", "title")
      .sort({ detectedAt: -1 });

    return res.status(200).json(risks);

  } catch (error) {
    console.error("Get risks error:", error);

    return res.status(500).json({
      message: "Failed to fetch risks",
    });
  }
};
