import Project from "../models/Project.js";
import Task from "../models/Task.js";
import TaskChangeRequest from "../models/TaskChangeRequest.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";


// Create project
const createProject = async (req, res) => {
  try {

    const {
      title,
      description,
      start_date,
      target_completion_date,
      status,
    } = req.body;


    const project = await Project.create({
      title,
      description,
      start_date,
      target_completion_date,
      status,
      createdBy: req.user.id,
    });


    res.status(201).json({
      message: "Project Files are created successfully",
      project,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};



// Get all projects created by admin
const getAllProjects = async (req, res) => {
  try {

    const allProjects = await Project.find({
      createdBy: req.user.id,
    }).populate(
      "createdBy",
      "name email"
    );


    if (allProjects.length === 0) {
      return res.json([]);
    }


    res.json(allProjects);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};



// Delete project
const deleteProject = async (req, res) => {

  const session = await mongoose.startSession(); //attomacity : either delete all or none

  try {


    session.startTransaction();

    const project = await Project.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    }).session(session);


    if (!project) {

      await session.abortTransaction();
      return res.status(404).json({
        message: "Project not found, check delete Project",
      });

    }

    // Check whether the project has any incomplete tasks
    const incompleteTask = await Task.findOne({
      projectId: project._id,
      status: { $ne: "completed" },
    }).session(session);

    if (incompleteTask) {

      await session.abortTransaction();
      return res.status(400).json({
        message:
          "Cannot delete this project. All tasks must be completed first.",
      });
    }
    // Find all tasks belonging to this project
    const projectTasks = await Task.find({
      projectId: project._id,
    }).select("_id") .session(session);;

    const taskIds = projectTasks.map((task) => task._id);

    // Delete change requests associated with these tasks
    await TaskChangeRequest.deleteMany(
      {task: { $in: taskIds }}, {session}
    );


    // Remove notifications related to the deleted project or its tasks
    await Notification.deleteMany({
      $or: [
        { relatedProject: project._id },
        { relatedTask: { $in: taskIds } },
      ],
    },
     {session} );

    // Delete completed tasks belonging to this project
    await Task.deleteMany({
      projectId: project._id,
    }, {session});

    // Delete the project
    await Project.deleteOne({
      _id: project._id,
      createdBy: req.user.id,
    }, {session});

    //Permanently commit all deletions
    await session.commitTransaction();

    res.json({
      message: "Project deleted successfully",
    });


  } catch (error) {


    if (session.inTransaction())
      {
        await session.abortTransaction();
      }
    return res.status(500).json({
      message: `Check Delete project section ${error.message}`,
    });

  }

  finally {
    await session.endSession();
  }

};



// Update project
const updateProject = async (req, res) => {

  try {

    const {
      title,
      description,
      start_date,
      target_completion_date,

    } = req.body;

    const allowedUpdates = {};

      if (title !== undefined) allowedUpdates.title = title;

      if (description !== undefined)
        allowedUpdates.description = description;

      if (start_date !== undefined)
        allowedUpdates.start_date = start_date;

      if (target_completion_date !== undefined)
        allowedUpdates.target_completion_date = target_completion_date;

      // if (status !== undefined)
      //   allowedUpdates.status = status;

      if (Object.keys(allowedUpdates).length === 0) {
        return res.status(400).json({
          message: "Please provide at least one field to update",
        });
      }


    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.id,
      },

      { $set: allowedUpdates },
      {
        new: true,
        runValidators: true,
      }
    );


    if (!project) {

      return res.status(404).json({
        message:
          "Project can't be updated because it can't be found",
      });

    }


    res.json({
      message: "Project updated successfully",
      project,
    });


  } catch (error) {

    res.status(500).json({
      message:
        `Can't update project, check updateProject, error: ${error.message}`,
    });

  }
};

// Get projects when logged-in as staff through assigned tasks
const getMyProjects = async (req, res) => {
  try {

    const tasks = await Task.find({
      assignedMembers: req.user.id,
    }).select("projectId");

    const projectIds = [
      ...new Set(
        tasks.map((task) => task.projectId.toString())
      ),
    ];

    const projects = await Project.find({
      _id: { $in: projectIds },
    })
      .populate("createdBy", "name email");

    res.json(projects);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};



export {createProject,getAllProjects,deleteProject,updateProject,getMyProjects,};