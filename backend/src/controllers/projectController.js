import Project from "../models/Project.js";
import Task from "../models/Task.js";


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
  try {

    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });


    if (!project) {

      return res.status(404).json({
        message: "Project not found, check delete Project",
      });

    }


    res.json({
      message: "Project deleted successfully",
    });


  } catch (error) {

    return res.status(500).json({
      message: `Check Delete project section ${error.message}`,
    });

  }
};



// Update project
const updateProject = async (req, res) => {

  try {

    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.id,
      },
      req.body,
      {
        new: true,
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