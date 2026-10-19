import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMyProjectTasks } from "../services/taskApi";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  FileText,
  FolderKanban,
  Pencil,
  ListTodo,
  Lock,
  CheckCircle2,
  CirclePlay,
  Eye,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";


function StaffProjectTasks() {

  const { projectId } = useParams();

  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);

  const [project, setProject] = useState(null);

  const getDependencyStatus = (task) => {
    if (task.status === "completed") {
      return "completed";
    }

    if (!task.dependency) {
      return "ready";
    }

    // Condition 1: Prerequisite completed
    if (task.dependency.status === "completed") {
      return "ready";
    }

    // Condition 2: Scheduled unlock date reached
    const originalStart = task.dependencyOriginalStartDate;
    const offset = Number(task.dependencyOffsetDays);

    if (
      originalStart &&
      Number.isInteger(offset) &&
      offset >= 0
    ) {
      const unlockDate = new Date(originalStart);

      if (!Number.isNaN(unlockDate.getTime())) {
        unlockDate.setUTCDate(
          unlockDate.getUTCDate() + offset
        );

        if (Date.now() >= unlockDate.getTime()) {
          return "ready";
        }
      }
    }

    return "locked";
  };


  useEffect(() => {

    fetchTasks();

  }, [projectId]);


  const fetchTasks = async () => {

    try {

      const data = await getMyProjectTasks(projectId);

      setTasks(data);

      if (data.length > 0) {
        setProject(data[0].projectId);
      }

    } catch (error) {

      console.log(error);

    }

  };


return (
  <DashboardLayout role="staff">

    {/* Back */}
    <button
      type="button"
      onClick={() => navigate("/staff/projects")}
      className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-5 transition"
    >
      <ArrowLeft size={17} />
      Back to Projects
    </button>


    {/* Project information */}
    {project && (

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 md:p-6 mb-7">

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

          <div className="flex items-start gap-4">

            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <FolderKanban size={22} />
            </div>


            <div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {project.title}
              </h1>

              <p className="text-sm text-gray-500 mt-2 max-w-2xl leading-6">
                {project.description ||
                  "No description available."}
              </p>

            </div>

          </div>


          <span
            className={`self-start px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
              project.status === "completed"
                ? "bg-green-50 text-green-700"
                : project.status === "ongoing"
                ? "bg-blue-50 text-blue-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {project.status || "Pending"}
          </span>

        </div>


        {/* Project dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-gray-100">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center">
              <CalendarDays size={17} />
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Start Date
              </p>

              <p className="text-sm font-medium text-gray-700 mt-0.5">
                {project.start_date
                  ? project.start_date.split("T")[0]
                  : "Not set"}
              </p>
            </div>

          </div>


          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center">
              <CalendarDays size={17} />
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Target Completion
              </p>

              <p className="text-sm font-medium text-gray-700 mt-0.5">
                {project.target_completion_date
                  ? project.target_completion_date.split(
                      "T"
                    )[0]
                  : "Not set"}
              </p>
            </div>

          </div>

        </div>

      </div>

    )}


    {/* Tasks header */}
    <div className="flex items-center gap-3 mb-5">

      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
        <ListTodo size={19} />
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900">
          My Tasks
        </h2>

        <p className="text-sm text-gray-400">
          Tasks assigned to you in this project
        </p>
      </div>

    </div>


    {/* No tasks */}
    {tasks.length === 0 ? (

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm py-14 px-6 text-center">

        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <ListTodo size={25} />
        </div>

        <h3 className="font-semibold text-gray-800 mt-4">
          No tasks assigned
        </h3>

        <p className="text-sm text-gray-400 mt-2">
          No tasks are currently assigned to you in
          this project.
        </p>

      </div>

    ) : (

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {tasks.map((task) => (

          <div
            key={task._id}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col"
          >

            <div className="p-5 md:p-6 flex-1">

              {/* Task heading */}
              <div className="flex items-start justify-between gap-4">

                <div>

                  <h3 className="text-lg font-semibold text-gray-900">
                    {task.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-2 leading-6">
                    {task.description ||
                      "No description available."}
                  </p>

                </div>


                {/* Priority */}
                <span
                  className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                    task.priority === "critical"
                      ? "bg-red-50 text-red-700"
                      : task.priority === "high"
                      ? "bg-orange-50 text-orange-700"
                      : task.priority === "low"
                      ? "bg-gray-100 text-gray-600"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {task.priority}
                </span>

              </div>


              {/* Dependency Status */}
              <div className="mt-5">
                {getDependencyStatus(task) === "completed" ? (
                  <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
                    <CheckCircle2
                      size={19}
                      className="text-green-600 shrink-0"
                    />

                    <div>
                      <p className="text-sm font-semibold text-green-700">
                        Completed
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        This task has been completed.
                      </p>
                    </div>
                  </div>
                ) : getDependencyStatus(task) === "locked" ? (
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <Lock
                      size={19}
                      className="text-amber-600 shrink-0 mt-0.5"
                    />

                    <div>
                      <p className="text-sm font-semibold text-amber-700">
                        Locked
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Complete "{task.dependency?.title || "the prerequisite task"}"
                        {" "}or wait until the scheduled unlock date.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <CirclePlay
                      size={19}
                      className="text-blue-600 shrink-0"
                    />

                    <div>
                      <p className="text-sm font-semibold text-blue-700">
                        Ready
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        This task is available to work on.
                      </p>
                    </div>
                  </div>
                )}
              </div>



              {/* Status */}
              <div className="mt-4">

                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    task.status === "completed"
                      ? "bg-green-50 text-green-700"
                      : task.status === "blocked"
                      ? "bg-red-50 text-red-700"
                      : task.status === "inprogress"
                      ? "bg-blue-50 text-blue-700"
                      : task.status === "review" ||
                        task.status === "testing"
                      ? "bg-purple-50 text-purple-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {task.status === "inprogress"
                    ? "In Progress"
                    : task.status}
                </span>

              </div>


              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">

                <div className="flex items-start gap-3">

                  <CalendarDays
                    size={16}
                    className="text-gray-400 mt-0.5"
                  />

                  <div>
                    <p className="text-xs text-gray-400">
                      Planned Start
                    </p>

                    <p className="text-sm font-medium text-gray-700 mt-0.5">
                      {task.plannedStartDate
                        ? task.plannedStartDate.split(
                            "T"
                          )[0]
                        : "Not set"}
                    </p>
                  </div>

                </div>


                <div className="flex items-start gap-3">

                  <CalendarDays
                    size={16}
                    className="text-gray-400 mt-0.5"
                  />

                  <div>
                    <p className="text-xs text-gray-400">
                      Due Date
                    </p>

                    <p className="text-sm font-medium text-gray-700 mt-0.5">
                      {task.dueDate
                        ? task.dueDate.split("T")[0]
                        : "Not set"}
                    </p>
                  </div>

                </div>

              </div>


              {/* Hours */}
              <div className="grid grid-cols-2 gap-3 mt-5">

                <div className="bg-slate-50 rounded-xl p-4">

                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock3 size={15} />

                    <p className="text-xs">
                      Estimated
                    </p>
                  </div>

                  <p className="text-lg font-semibold text-gray-800 mt-2">
                    {task.estimatedHours || 0}
                    <span className="text-xs font-normal text-gray-400 ml-1">
                      hrs
                    </span>
                  </p>

                </div>


                <div className="bg-slate-50 rounded-xl p-4">

                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock3 size={15} />

                    <p className="text-xs">
                      Actual
                    </p>
                  </div>

                  <p className="text-lg font-semibold text-gray-800 mt-2">
                    {task.actualHours || 0}
                    <span className="text-xs font-normal text-gray-400 ml-1">
                      hrs
                    </span>
                  </p>

                </div>

              </div>


              {/* Progress notes */}
              <div className="bg-indigo-50/60 rounded-xl p-4 mt-5">

                <div className="flex items-center gap-2">

                  <FileText
                    size={15}
                    className="text-indigo-500"
                  />

                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                    Progress Notes
                  </p>

                </div>

                <p className="text-sm text-gray-600 mt-2 leading-6 whitespace-pre-wrap">
                  {task.progressNotes ||
                    "No progress notes yet."}
                </p>

              </div>

            </div>


            {/* Actions */}
            <div className="border-t border-gray-100 p-4">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/staff/tasks/${task._id}/edit`
                  )
                }
                className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
              >

              {getDependencyStatus(task) === "locked" ? (
                <>
                  <Eye size={16} />
                  View Locked Task
                </>
              ) : (
                <>
                  <Pencil size={16} />
                  Update Task
                </>
              )}

              </button>

            </div>

          </div>

        ))}

      </div>

    )}

  </DashboardLayout>
);

}


export default StaffProjectTasks;