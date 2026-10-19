import Task from "../models/Task.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import Project from "../models/Project.js";

  //check validiaty of the dependency

  const validateDependency = async ({

    taskId = null,
    projectId,
    dependencyId,
    createdBy,
     }) => {

      // No dependency selected
    if (!dependencyId) {
      return null;
    }

    // Check whether the dependency ID is valid
    if (!mongoose.isValidObjectId(dependencyId)) {
      throw new Error("Invalid dependency ID");
    }

    // A task cannot depend on itself
    if (taskId && String(taskId) === String(dependencyId)) {
      throw new Error("A task cannot depend on itself");
    }

    // Find the prerequisite task
    const dependency = await Task.findById(dependencyId);

    if (!dependency) {
      throw new Error("Dependency task not found");
    }

    // Dependency must belong to the same project
    if (String(dependency.projectId) !== String(projectId)) {
      throw new Error("Dependency must belong to the same project");
    }

    // Dependency must belong to the same admin
    if (String(dependency.createdBy) !== String(createdBy)) {
      throw new Error(
        "You cannot select a dependency created by another admin"
      );
    }

    // Prevent circular dependencies
    const visited = new Set();
    let current = dependency;

    while (current) {
      const currentId = String(current._id);

      if (taskId && currentId === String(taskId)) {
        throw new Error("Circular task dependency is not allowed");
      }

      if (visited.has(currentId)) {
        throw new Error("Circular dependency detected");
      }

      visited.add(currentId);

      if (!current.dependency) {
        break;
      }

      current = await Task.findById(current.dependency);
    }

    return dependency;
  };

  // check ela
  const getDependencyReadiness = (task, prerequisiteTask) => {
    if (!task.dependency) {
      return { unlocked: true, unlockDate: null };
    }

    if (!prerequisiteTask) {
      return { unlocked: false, unlockDate: null };
    }

    // Condition 1: prerequisite completed
    if (prerequisiteTask.status === "completed") {
      return { unlocked: true, unlockDate: null };
    }

    // Condition 2: scheduled unlock date
    const originalStart = task.dependencyOriginalStartDate;

    const offset = Number(task.dependencyOffsetDays);

    if (
      !originalStart ||
      !Number.isInteger(offset) ||
      offset < 0
    ) {
      return { unlocked: false, unlockDate: null };
    }

    const unlockDate = new Date(originalStart);

    if (Number.isNaN(unlockDate.getTime())) {
      return { unlocked: false, unlockDate: null };
    }

    unlockDate.setUTCDate(
      unlockDate.getUTCDate() + offset
    );

    return {
      unlocked: Date.now() >= unlockDate.getTime(),
      unlockDate,
    };
  };

  // Notify staff when their dependent tasks become ready
  const notifyReadyTasks = async (completedTask) => {
    const dependentTasks = await Task.find({
      dependency: completedTask._id,
      status: { $ne: "completed" },
    });

    const notifications = [];

    for (const dependentTask of dependentTasks) {


      const readiness = getDependencyReadiness(
        dependentTask,
        completedTask
      );

      if (!readiness.unlocked) continue;

      // A time-based task may already have unlocked earlier.
      // Avoid incorrectly announcing it as newly ready.
      const originalStart =
        dependentTask.dependencyOriginalStartDate;

      if (originalStart) {
        const scheduledUnlock = new Date(originalStart);
        const offset = Number(dependentTask.dependencyOffsetDays);

        if (
          Number.isInteger(offset) &&
          offset >= 0 &&
          !Number.isNaN(scheduledUnlock.getTime())
        ) {
          scheduledUnlock.setUTCDate(
            scheduledUnlock.getUTCDate() + offset
          );

          if (scheduledUnlock <= new Date()) continue;
        }
      }

      for (const memberId of dependentTask.assignedMembers) {
        notifications.push({
          recipient: memberId,
          type: "task_ready",
          title: "Task Ready to Start",
          message: `Your task "${dependentTask.title}" is now ready to start because "${completedTask.title}" has been completed.`,
          relatedTask: dependentTask._id,
          relatedProject: dependentTask.projectId,
        });
      }
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  };

  // Automatically update project status based on its tasks
  const updateProjectStatus = async (projectId) => {

    const totalTasks = await Task.countDocuments({
      projectId: projectId,
    });

    const completedTasks = await Task.countDocuments({
      projectId: projectId,
      status: "completed",
    });

    let projectStatus;

    if (totalTasks === 0) {
      projectStatus = "pending";
    }
    else if (totalTasks === completedTasks) {
      projectStatus = "completed";
    }
    else {
      projectStatus = "ongoing";
    }

    await Project.findByIdAndUpdate(projectId, {
      status: projectStatus,
    });
  };
// CREATE TASK - ADMIN

const createTask = async (req, res) => {
  try {

    const {
      title,
      description,
      assignedMembers,
      priority,
      status,
      plannedStartDate,
      dueDate,
      completionDate,
      estimatedHours,
      actualHours,
      progressNotes,
      projectId,
      dependency,
      dependencyOffsetDays,
    } = req.body;

    let prerequisiteTask;

    const selectedOffset = dependencyOffsetDays ?? 0;

    // Validate dependency
    try {

        prerequisiteTask = await validateDependency({
          projectId,
          dependencyId: dependency,
          createdBy: req.user.id,
        });

        if (dependency) {
          if (!prerequisiteTask?.plannedStartDate) {
            return res.status(400).json({
              message: "Prerequisite must have a planned start date.",
            });
          }

          if (
            selectedOffset === "" ||
            selectedOffset === null ||
            !Number.isInteger(Number(selectedOffset)) ||
            Number(selectedOffset) < 0
          ) {
            return res.status(400).json({
              message: "Dependency offset must be a non-negative whole number.",
            });
          }
        }

    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    // Create the task
    const task = await Task.create({
      title,
      description,
      assignedMembers,
      dependency: dependency || null,
      priority,
      status,
      plannedStartDate,
      dueDate,
      completionDate,
      estimatedHours,
      actualHours,
      progressNotes,
      projectId,


      dependencyOffsetDays: dependency
        ? Number(selectedOffset)
        : 0,

      dependencyOriginalStartDate: dependency
        ? prerequisiteTask.plannedStartDate
        : null,

      // Logged-in admin becomes the creator
      createdBy: req.user.id,
    });

    await updateProjectStatus(task.projectId);

    // AUTOMATIC NOTIFICATION
    // Notify every staff member assigned to the new task

    if (assignedMembers && assignedMembers.length > 0) {

      const notifications = assignedMembers.map(
        (memberId) => ({
          recipient: memberId,

          type: "task_assigned",

          title: "New Task Assigned",

          message:
            `You have been assigned to "${task.title}".`,

          relatedTask: task._id,

          relatedProject: task.projectId,
        })
      );


      // Create all notifications together
      await Notification.insertMany(notifications);
    }


    res.status(201).json({
      message: "Task created successfully",
      task,
    });


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// GET ALL TASKS OF A PROJECT - ADMIN

const getProjectTasks = async (req, res) => {
  try {

    const tasks = await Task.find({
      projectId: req.params.projectId,
      createdBy: req.user.id,
    })
      .populate(
        "assignedMembers",
        "name email"
      )
      .populate("dependency", "title status assignedMembers plannedStartDate")
      .populate(
        "createdBy",
        "name email"
      );


    res.json(tasks);


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// UPDATE TASK - ADMIN

const updateTask = async (req, res) => {
  try {
    // STEP 1: Get the task BEFORE updating it. We need the old assignedMembers list so that  we can compare it with the new assignedMembers.
    const oldTask = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });


    if (!oldTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    // Store original values to detect admin changes
    const originalTask = oldTask.toObject();

    // Convert old member ObjectIds to strings
    // so that they are easier to compare.
    const oldMembers = oldTask.assignedMembers.map(
      (memberId) => memberId.toString()
    );


    const updatedDependency =
      req.body.dependency !== undefined
        ? req.body.dependency || null
        : oldTask.dependency;

    const updatedProjectId = oldTask.projectId;

    // Validate the selected dependency
    try {
      await validateDependency({
        taskId: oldTask._id,
        projectId: updatedProjectId,
        dependencyId: updatedDependency,
        createdBy: req.user.id,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    // Update the task

    const allowedFields = [
      "title",
      "description",
      "assignedMembers",
      "priority",
      "status",
      "plannedStartDate",
      "dueDate",
      "completionDate",
      "estimatedHours",
      "actualHours",
      "progressNotes",
      "dependency",
      "dependencyOffsetDays",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // No Dependency option
    if (updateData.dependency === "") {
      updateData.dependency = null;
    }


    const finalDependency =
      updateData.dependency !== undefined
        ? updateData.dependency
        : oldTask.dependency;


    const finalOffset =
      updateData.dependencyOffsetDays ??
      oldTask.dependencyOffsetDays ??
      0;

    if (!finalDependency) {
      updateData.dependency = null;
      updateData.dependencyOffsetDays = 0;
      updateData.dependencyOriginalStartDate = null;
      updateData.scheduledUnlockNotifiedAt = null;
    } else {
        if (
          finalOffset === "" ||
          finalOffset === null ||
          !Number.isInteger(Number(finalOffset)) ||
          Number(finalOffset) < 0
        ) {
        return res.status(400).json({
          message: "Dependency offset must be a non-negative whole number.",
        });
      }

      const dependencyChanged =
        String(finalDependency) !== String(oldTask.dependency);

      const offsetChanged =
        Number(finalOffset) !== Number(oldTask.dependencyOffsetDays ?? 0);

      // Reset notification tracking if dependency or offset changes
      if (dependencyChanged || offsetChanged) {
        updateData.scheduledUnlockNotifiedAt = null;
      }

      const prerequisite = await Task.findById(finalDependency);

      if (
          (dependencyChanged || !oldTask.dependencyOriginalStartDate) &&
          !prerequisite?.plannedStartDate
        ) {
        return res.status(400).json({
          message: "Prerequisite must have a planned start date.",
        });
      }

      updateData.dependencyOffsetDays = Number(finalOffset);

      if (
        dependencyChanged ||
        !oldTask.dependencyOriginalStartDate
      ) {
        updateData.dependencyOriginalStartDate =
          prerequisite.plannedStartDate;
      }
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.id,
      },

      updateData,

      {
        new: true,
        runValidators: true,
      }
    );

    if (oldTask.status !== task.status) {
      await updateProjectStatus(task.projectId);
    }

    // Notify staff when admin completes a prerequisite task
    if (oldTask.status !== "completed" && task.status === "completed") {
      await notifyReadyTasks(task);
    }

    // STEP 3: Check whether admin changed assignedMembers

    if (req.body.assignedMembers) {

      // Get the new assigned member IDs
      const newMembers = task.assignedMembers.map(
        (memberId) => memberId.toString()
      );


      const addedMembers = newMembers.filter(
        (memberId) =>
          !oldMembers.includes(memberId)
      );


      const removedMembers = oldMembers.filter(
        (memberId) =>
          !newMembers.includes(memberId)
      );

      // AUTOMATIC NOTIFICATION:
      // Notify newly assigned
      for (const memberId of addedMembers) {

        await Notification.create({

          recipient: memberId,

          type: "task_assigned",

          title: "Task Assigned",

          message:
            `You have been assigned to "${task.title}".`,

          relatedTask: task._id,

          relatedProject: task.projectId,
        });

      }
      // AUTOMATIC NOTIFICATION:
      // Notify staff removed from the task

      for (const memberId of removedMembers) {

        await Notification.create({

          recipient: memberId,

          type: "task_unassigned",

          title: "Task Assignment Removed",

          message:
            `You have been removed from "${task.title}".`,

          relatedTask: task._id,

          relatedProject: task.projectId,
        });

      }

    }


    // Notify existing staff when admin updates task details
    const trackedFields = {
      title: "Title",
      description: "Description",
      priority: "Priority",
      status: "Status",
      plannedStartDate: "Planned Start Date",
      dueDate: "Due Date",
      completionDate: "Completion Date",
      estimatedHours: "Estimated Hours",
      actualHours: "Actual Hours",
      progressNotes: "Progress Notes",
      dependency: "Dependency",
      dependencyOffsetDays: "Dependency Unlock Days",
    };

    const changedFields = Object.entries(trackedFields)
      .filter(([field]) => {
        const oldValue = originalTask[field];
        const newValue = task[field];

        // Compare dates and ObjectIds consistently
        const normalize = (value) => {
          if (value === null || value === undefined) return "";
          if (value instanceof Date) return value.toISOString();
          return String(value);
        };

        return normalize(oldValue) !== normalize(newValue);
      })
      .map(([, label]) => label);

    if (changedFields.length > 0) {
      const currentMembers = task.assignedMembers.map(String);
      const existingMembers = currentMembers.filter((memberId) =>
        oldMembers.includes(memberId)
      );

      if (existingMembers.length > 0) {
        const notifications = existingMembers.map((memberId) => ({
          recipient: memberId,
          type: "task_updated",
          title: "Task Updated",
          message: `Your task "${task.title}" has been updated by the admin. Changes: ${changedFields.join(", ")}.`,
          relatedTask: task._id,
          relatedProject: task.projectId,
        }));

        await Notification.insertMany(notifications);
      }
    }


    res.json({
      message: "Task updated successfully",
      task,
    });


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// DELETE TASK - ADMIN

const deleteTask = async (req, res) => {
  try {

    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });


    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Check whether other tasks depend on this task
    const dependentTask = await Task.findOne({
      dependency: task._id,
    });

    if (dependentTask) {
      return res.status(400).json({
        message: `Cannot delete "${task.title}". "${dependentTask.title}" depends on it. Remove that dependency first.`,
      });
    }

    // Save assigned members before deleting the task
    const assignedMembers = task.assignedMembers || [];

    // Delete the task
    await task.deleteOne();

    await updateProjectStatus(task.projectId);

    // Notify staff that their task was deleted
    if (assignedMembers.length > 0) {
      const notifications = assignedMembers.map((memberId) => ({
        recipient: memberId,
        type: "task_unassigned",
        title: "Task Deleted",
        message: `The task "${task.title}" has been deleted by the admin.`,
        relatedTask: null,
        relatedProject: task.projectId,
      }));

      await Notification.insertMany(notifications);
    }

    res.json({
      message: "Task deleted successfully",
    });


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// GET SINGLE TASK - ADMIN
const getTaskById = async (req, res) => {
  try {

    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    })
      .populate({
        path: "assignedMembers",
        select: "name email",
      })
      .populate("dependency", "title status assignedMembers plannedStartDate")
      .populate({
        path: "createdBy",
        select: "name email",
      });


    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }


    res.json(task);


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// GET ALL TASKS ASSIGNED TO LOGGED-IN STAFF

const getMyTasks = async (req, res) => {
  try {

    const tasks = await Task.find({
      assignedMembers: req.user.id,
    })
      .populate(
        "projectId",
        "title description start_date target_completion_date status"
      )
      .populate(
        "assignedMembers",
        "name email"
      )
      .populate("dependency", "title status assignedMembers plannedStartDate")
      .populate(
        "createdBy",
        "name email"
      );


    res.json(tasks);


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// GET STAFF TASKS INSIDE A SPECIFIC PROJECT

const getMyProjectTasks = async (req, res) => {
  try {

    const tasks = await Task.find({
      projectId: req.params.projectId,
      assignedMembers: req.user.id,
    })
      .populate(
        "assignedMembers",
        "name email"
      )
      .populate(
        "createdBy",
        "name email"
      )
      .populate("dependency", "title status assignedMembers plannedStartDate")
      .populate(
        "projectId",
        "title description start_date target_completion_date status"
      );


    res.json(tasks);


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// UPDATE TASK - STAFF

// Staff can ONLY update:
// 1. status
// 2. actualHours
// 3. progressNotes

const updateStaffTask = async (req, res) => {
  try {

    const {
      status,
      actualHours,
      progressNotes,
    } = req.body;


    // Find the assigned task
    const task = await Task.findOne({
      _id: req.params.id,
      assignedMembers: req.user.id,
    });


    if (!task) {
      return res.status(404).json({
        message:
          "Task not found or task is not assigned to you",
      });
    }

    // Check completion-based or time-based dependency
    if (task.dependency) {
      const prerequisiteTask = await Task.findById(task.dependency);

      const readiness = getDependencyReadiness(
        task,
        prerequisiteTask
      );

      if (!readiness.unlocked) {
        return res.status(403).json({
          message: prerequisiteTask
            ? "Task is locked until its dependency condition is satisfied."
            : "Task locked. The prerequisite task no longer exists.",
          unlockDate: readiness.unlockDate,
        });
      }
    }


    // Store changed information
    const previousStatus = task.status;
    const changes = [];


    // Check status change
    if (
      status !== undefined &&
      status !== task.status
    ) {
      changes.push(
        `Status: ${task.status} → ${status}`
      );

      task.status = status;
    }


    // Check actual hours change
    if (
      actualHours !== undefined &&
      Number(actualHours) !== task.actualHours
    ) {
      changes.push(
        `Actual Hours: ${task.actualHours} → ${actualHours}`
      );

      task.actualHours = actualHours;
    }


    // Check progress notes change
    if (
      progressNotes !== undefined &&
      progressNotes !== task.progressNotes
    ) {
      changes.push("Progress Notes updated");

      task.progressNotes = progressNotes;
    }


    // Do not create notification if nothing changed
    if (changes.length === 0) {
      return res.json({
        message: "No changes were made",
        task,
      });
    }

    // Record the time of the latest meaningful progress update
    task.lastProgressAt = new Date();

    // Save task changes
    await task.save();
    if (previousStatus !== task.status) {
      await updateProjectStatus(task.projectId);
    }

    // Notify dependent-task staff when this task is completed
    if (previousStatus !== "completed" && task.status === "completed") {
      await notifyReadyTasks(task);
}


    // Get staff information
    const staff = await User.findById(
      req.user.id
    ).select("name");


    const staffName =
      staff?.name || "A staff member";


    // Notify admin
    await Notification.create({
      recipient: task.createdBy,

      type: "task_updated",

      title: "Task Updated by Staff",

      message:
        `${staffName} updated "${task.title}". ${changes.join(", ")}.`,

      relatedTask: task._id,

      relatedProject: task.projectId,
    });


    res.json({
      message: "Task updated successfully",
      task,
    });


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// GET SINGLE TASK - STAFF
// Staff can only access a task if they are currently one of the assignedMembers.
const getStaffTaskById = async (req, res) => {
  try {

    const task = await Task.findOne({
      _id: req.params.id,
      assignedMembers: req.user.id,
    })
      .populate(
        "assignedMembers",
        "name email"
      )
      .populate(
        "createdBy",
        "name email"
      )
      .populate("dependency", "title status assignedMembers plannedStartDate")

      .populate(
        "projectId",
        "title description start_date target_completion_date status"
      );


    if (!task) {
      return res.status(404).json({
        message:
          "Task not found or task is not assigned to you",
      });
    }


    res.json(task);


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


export {
  createTask,
  getProjectTasks,
  updateTask,
  getTaskById,
  deleteTask,
  getMyTasks,
  getMyProjectTasks,
  updateStaffTask,
  getStaffTaskById,
};