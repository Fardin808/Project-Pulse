import Task from "../models/Task.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";



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
    } = req.body;


    // Create the task
    const task = await Task.create({
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

      // Logged-in admin becomes the creator
      createdBy: req.user.id,
    });

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

    // Convert old member ObjectIds to strings
    // so that they are easier to compare.
    const oldMembers = oldTask.assignedMembers.map(
      (memberId) => memberId.toString()
    );

    // STEP 2: Update the task

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.id,
      },

      req.body,

      {
        new: true,
      }
    );

    // STEP 3: Check whether admin changed assignedMembers

    if (req.body.assignedMembers) {

      // Get the new assigned member IDs
      const newMembers = task.assignedMembers.map(
        (memberId) => memberId.toString()
      );

      // Find NEWLY ASSIGNED staff
      //
      // Example:
      // old = [A]
      // new = [A, B]
      //
      // addedMembers = [B]
      // ------------------------------------------------

      const addedMembers = newMembers.filter(
        (memberId) =>
          !oldMembers.includes(memberId)
      );


      // ------------------------------------------------
      // Find REMOVED staff
      //
      // Example:
      // old = [A, B]
      // new = [B]
      //
      // removedMembers = [A]
      // ------------------------------------------------

      const removedMembers = oldMembers.filter(
        (memberId) =>
          !newMembers.includes(memberId)
      );

      // AUTOMATIC NOTIFICATION:
      // Notify newly assigned staff


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

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });


    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
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


    // Store changed information
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


    // Save task changes
    await task.save();


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