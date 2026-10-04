import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTasks } from "../services/taskApi";
import {
  CalendarDays,
  Clock3,
  FolderKanban,
  ListTodo,
  ArrowRight,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";



function StaffTasks() {

  const [tasks, setTasks] = useState([]);

  const navigate = useNavigate();


  useEffect(() => {

    fetchMyTasks();

  }, []);


  const fetchMyTasks = async () => {

    try {

      const data = await getMyTasks();

      setTasks(data);

    } catch (error) {

      console.log(error);

    }

  };


return (
  <DashboardLayout role="staff">

    {/* Header */}
    <div className="mb-8">

      <div className="flex items-center gap-3">

        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <ListTodo size={23} />
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            My Tasks
          </h1>

          <p className="text-gray-500 mt-1">
            View all tasks currently assigned to you.
          </p>
        </div>

      </div>

    </div>


    {/* No Tasks */}
    {tasks.length === 0 ? (

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm py-16 px-6 text-center">

        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <ListTodo size={25} />
        </div>

        <h2 className="font-semibold text-gray-800 mt-4">
          No tasks assigned
        </h2>

        <p className="text-sm text-gray-400 mt-2">
          You currently have no tasks assigned to you.
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

              {/* Task Header */}
              <div className="flex items-start justify-between gap-4">

                <div>

                  <h2 className="text-lg font-semibold text-gray-900">
                    {task.title}
                  </h2>

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


              {/* Project */}
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 mt-5">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-lg bg-white text-indigo-600 flex items-center justify-center">
                    <FolderKanban size={17} />
                  </div>

                  <div>

                    <p className="text-xs text-indigo-400">
                      Project
                    </p>

                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {task.projectId?.title ||
                        "Unknown Project"}
                    </p>

                  </div>

                </div>

              </div>


              {/* Status */}
              <div className="mt-5">

                <p className="text-xs text-gray-400 mb-2">
                  Status
                </p>

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
                      : task.status === "todo"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-gray-100 text-gray-600"
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
                        ? task.plannedStartDate.split("T")[0]
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

                    <span className="text-xs">
                      Estimated
                    </span>
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

                    <span className="text-xs">
                      Actual
                    </span>
                  </div>

                  <p className="text-lg font-semibold text-gray-800 mt-2">
                    {task.actualHours || 0}

                    <span className="text-xs font-normal text-gray-400 ml-1">
                      hrs
                    </span>
                  </p>

                </div>

              </div>

            </div>


            {/* Footer */}
            <div className="border-t border-gray-100 p-4">

              <button
                type="button"
                onClick={() =>
                  navigate(`/staff/tasks/${task._id}/edit`)
                }
                className="w-full inline-flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition group"
              >
                <span>View Task</span>

                <ArrowRight
                  size={17}
                  className="group-hover:translate-x-1 transition"
                />
              </button>

            </div>

          </div>

        ))}

      </div>

    )}

  </DashboardLayout>
);
}


export default StaffTasks;