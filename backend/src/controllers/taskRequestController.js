import TaskChangeRequest from "../models/TaskChangeRequest.js";
import Task from "../models/Task.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// Create a task change request
const createTaskRequest = async (req, res) => {
  try {

    const { task, reason } = req.body;

    // Validate required fields
    if (!task || !reason) {
      return res.status(400).json({
        message: "Task and reason are required",
      });
    }


    // Check whether the task exists
    const existingTask = await Task.findById(task);

    if (!existingTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }


    // Make sure staff is assigned to this task
    const isAssigned = existingTask.assignedMembers.some(
      (memberId) => memberId.toString() === req.user.id
    );

    if (!isAssigned) {
      return res.status(403).json({
        message: "You are not assigned to this task",
      });
    }


    // Check for an existing active request
    const existingRequest = await TaskChangeRequest.findOne({
      staff: req.user.id,
      task: task,
      status: {
        $in: ["pending", "holding"],
      },
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You already have an active request for this task",
      });
    }


    // Create request with default pending status
    const request = await TaskChangeRequest.create({
      staff: req.user.id,
      task: task,
      reason: reason,
    });

    // Get staff information
    const staff = await User.findById(
      req.user.id
    ).select("name");

    const staffName =
      staff?.name || "A staff member";


    // Notify admin about the new request
    await Notification.create({
      recipient: existingTask.createdBy,

      type: "request_submitted",

      title: "New Task Change Request",

      message:
        `${staffName} requested a change for "${existingTask.title}".`,

      relatedTask: existingTask._id,

      relatedProject: existingTask.projectId,
    });

    res.status(201).json({
      message: "Task change request submitted successfully",
      request,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// Get requests submitted by logged-in staff
const getMyTaskRequests = async (req, res) => {
  try {

    const requests = await TaskChangeRequest.find({
      staff: req.user.id,
    })
      .populate({
        path: "task",
        select: "title description status priority projectId",
        populate: {
          path: "projectId",
          select: "title status",
        },
      })
      .populate(
        "staff",
        "name email"
      )
      .sort({
        createdAt: -1,
      });


    res.json(requests);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// Get all task change requests for admin
const getAllTaskRequests = async (req, res) => {
  try {

    const requests = await TaskChangeRequest.find()
      .populate(
        "staff",
        "name email"
      )
      .populate({
        path: "task",
        select: "title description status priority projectId",
        populate: {
          path: "projectId",
          select: "title status",
        },
      })
      .sort({
        createdAt: -1,
      });


    res.json(requests);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// Admin updates a task change request
const updateTaskRequest = async (req, res) => {
  try {

    const { status, adminResponse } = req.body;


    // Validate admin decision
    if (!["holding", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be holding, approved, or rejected",
      });
    }


    // Find the request
    const request = await TaskChangeRequest.findById(
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        message: "Task change request not found",
      });
    }


    // Prevent changing a completed request
    if (
      request.status === "approved" ||
      request.status === "rejected"
    ) {
      return res.status(400).json({
        message: "This request has already been processed",
      });
    }


    // Get the related task
    const task = await Task.findById(request.task);

    if (!task) {
      return res.status(404).json({
        message: "Task associated with this request was not found",
      });
    }


    // Remove staff from task if request is approved
    if (status === "approved") {

      task.assignedMembers = task.assignedMembers.filter(
        (memberId) =>
          memberId.toString() !== request.staff.toString()
      );

      await task.save();
    }


    // Update request status and admin response
    request.status = status;
    request.adminResponse = adminResponse || "";

    await request.save();


    // Prepare notification information
    let notificationType;
    let notificationTitle;
    let notificationMessage;


    // Notification for holding request
    if (status === "holding") {

      notificationType = "request_holding";

      notificationTitle = "Task Request On Hold";

      notificationMessage =
        `Your task change request for "${task.title}" has been put on hold.`;

    }

    // Notification for approved request
    else if (status === "approved") {

      notificationType = "request_approved";

      notificationTitle = "Task Request Approved";

      notificationMessage =
        `Your task change request for "${task.title}" has been approved.`;

    }

    // Notification for rejected request
    else {

      notificationType = "request_rejected";

      notificationTitle = "Task Request Rejected";

      notificationMessage =
        `Your task change request for "${task.title}" has been rejected.`;

    }


    // Send notification to staff
    await Notification.create({
      recipient: request.staff,
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
      relatedTask: task._id,
      relatedProject: task.projectId,
    });


    // Get updated request information
    const updatedRequest = await TaskChangeRequest.findById(
      request._id
    )
      .populate(
        "staff",
        "name email"
      )
      .populate({
        path: "task",
        select:
          "title description status priority projectId assignedMembers",
        populate: {
          path: "projectId",
          select: "title status",
        },
      });


    // Prepare response message
    let message = "";

    if (status === "holding") {

      message = "Task change request has been put on hold";

    } else if (status === "approved") {

      message = "Task change request approved successfully";

    } else {

      message = "Task change request rejected successfully";

    }


    res.json({
      message,
      request: updatedRequest,
    });


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// Export controllers
export {
  createTaskRequest,
  getMyTaskRequests,
  getAllTaskRequests,
  updateTaskRequest,
};