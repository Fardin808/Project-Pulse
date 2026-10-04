import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  ListTodo,
  Clock,
  CalendarDays,
  Users,
  Pencil,
  Trash2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { getTasks, deleteTask } from "../services/taskApi";
import { getMyNotifications } from "../services/notificationApi";
import DashboardLayout from "../components/layout/DashboardLayout";


function Tasks() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);


  useEffect(() => {
    fetchTasks();
    fetchNotificationCount();
  }, [projectId]);


  // Load project tasks
  const fetchTasks = async () => {
    try {
      const data = await getTasks(projectId);
      setTasks(data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load tasks"
      );
    } finally {
      setLoading(false);
    }
  };


  // Load unread notification count
  const fetchNotificationCount = async () => {
    try {
      const notifications =
        await getMyNotifications();

      const count = notifications.filter(
        (notification) =>
          !notification.isRead
      ).length;

      setUnreadCount(count);
    } catch (error) {
      console.log(
        "Failed to load notifications:",
        error
      );
    }
  };


  // Delete task after confirmation
  const handleDelete = async () => {
    if (!taskToDelete || deleting) {
      return;
    }

    try {
      setDeleting(true);

      await deleteTask(taskToDelete._id);

      // Remove deleted task immediately from UI
      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) =>
            task._id !== taskToDelete._id
        )
      );

      toast.success(
        `"${taskToDelete.title}" deleted successfully`
      );

      setTaskToDelete(null);

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete task"
      );
    } finally {
      setDeleting(false);
    }
  };


  // Priority badge
  const getPriorityStyle = (priority) => {
    if (priority === "critical") {
      return "bg-red-100 text-red-700 border-red-200";
    }

    if (priority === "high") {
      return "bg-orange-100 text-orange-700 border-orange-200";
    }

    if (priority === "normal") {
      return "bg-blue-100 text-blue-700 border-blue-200";
    }

    return "bg-green-100 text-green-700 border-green-200";
  };


  // Status badge
  const getStatusStyle = (status) => {
    if (status === "completed") {
      return "bg-green-100 text-green-700";
    }

    if (status === "inprogress") {
      return "bg-blue-100 text-blue-700";
    }

    if (status === "blocked") {
      return "bg-red-100 text-red-700";
    }

    if (status === "review") {
      return "bg-purple-100 text-purple-700";
    }

    if (status === "testing") {
      return "bg-cyan-100 text-cyan-700";
    }

    if (status === "todo") {
      return "bg-orange-100 text-orange-700";
    }

    return "bg-gray-100 text-gray-700";
  };


  // Make status text easier to read
  const getStatusLabel = (status) => {
    if (status === "inprogress") {
      return "In Progress";
    }

    return status;
  };


  // Search tasks
  const filteredTasks = tasks.filter(
    (task) => {
      const searchText =
        search.toLowerCase();

      const assignedStaff =
        task.assignedMembers
          ?.map((member) => member.name)
          .join(" ")
          .toLowerCase() || "";

      return (
        task.title
          ?.toLowerCase()
          .includes(searchText) ||
        task.description
          ?.toLowerCase()
          .includes(searchText) ||
        assignedStaff.includes(searchText)
      );
    }
  );


  const completedCount = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const activeCount = tasks.filter(
    (task) =>
      task.status !== "completed" &&
      task.status !== "backlog"
  ).length;


  return (
    <DashboardLayout
      role="admin"
      unreadCount={unreadCount}
    >

      {/* Header */}
      <div className="mb-8">

        <button
          onClick={() =>
            navigate("/admin/projects")
          }
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-5"
        >
          <ArrowLeft size={17} />
          Back to Projects
        </button>


        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Project Tasks
            </h1>

            <p className="text-gray-500 mt-1">
              Manage tasks, assignments and
              project progress.
            </p>
          </div>


          <button
            onClick={() =>
              navigate(
                `/admin/projects/${projectId}/tasks/create`
              )
            }
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
          >
            <Plus size={18} />
            Create Task
          </button>

        </div>

      </div>


      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Tasks
          </p>

          <div className="flex items-center justify-between mt-3">
            <h2 className="text-3xl font-bold text-gray-900">
              {tasks.length}
            </h2>

            <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <ListTodo size={21} />
            </div>
          </div>
        </div>


        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Active
          </p>

          <div className="flex items-center justify-between mt-3">
            <h2 className="text-3xl font-bold text-blue-600">
              {activeCount}
            </h2>

            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Clock size={21} />
            </div>
          </div>
        </div>


        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Completed
          </p>

          <div className="flex items-center justify-between mt-3">
            <h2 className="text-3xl font-bold text-green-600">
              {completedCount}
            </h2>

            <div className="w-11 h-11 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <ListTodo size={21} />
            </div>
          </div>
        </div>

      </div>


      {/* Main task section */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 border-b border-gray-100">

          <div>
            <h2 className="font-semibold text-gray-900">
              All Tasks
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              {filteredTasks.length} task
              {filteredTasks.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>


          <div className="relative w-full md:w-72">

            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search tasks or staff..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
            />

          </div>

        </div>


        {loading ? (

          <div className="py-16 text-center text-gray-500">
            Loading tasks...
          </div>

        ) : filteredTasks.length === 0 ? (

          <div className="py-16 px-6 text-center">

            <div className="w-14 h-14 mx-auto bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <ListTodo size={25} />
            </div>

            <h3 className="font-semibold text-gray-800 mt-4">
              {tasks.length === 0
                ? "No tasks yet"
                : "No matching tasks"}
            </h3>

            <p className="text-sm text-gray-400 mt-2">
              {tasks.length === 0
                ? "Create the first task for this project."
                : "Try searching with another keyword."}
            </p>

            {tasks.length === 0 && (
              <button
                onClick={() =>
                  navigate(
                    `/admin/projects/${projectId}/tasks/create`
                  )
                }
                className="inline-flex items-center gap-2 mt-5 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700"
              >
                <Plus size={17} />
                Create Task
              </button>
            )}

          </div>

        ) : (

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 p-5">

            {filteredTasks.map((task) => (

              <div
                key={task._id}
                className="border border-gray-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition"
              >

                {/* Task header */}
                <div className="flex items-start justify-between gap-4">

                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {task.title}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {task.description ||
                        "No description available"}
                    </p>
                  </div>


                  <span
                    className={`shrink-0 capitalize text-xs font-semibold px-2.5 py-1 rounded-full border ${getPriorityStyle(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>

                </div>


                {/* Status */}
                <div className="mt-4">

                  <span
                    className={`inline-flex capitalize text-xs font-semibold px-3 py-1 rounded-full ${getStatusStyle(
                      task.status
                    )}`}
                  >
                    {getStatusLabel(task.status)}
                  </span>

                </div>


                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">

                  <div className="bg-gray-50 rounded-xl p-3">

                    <div className="flex items-center gap-2 text-gray-400">
                      <CalendarDays size={15} />

                      <p className="text-xs">
                        Planned Start
                      </p>
                    </div>

                    <p className="text-sm font-medium text-gray-700 mt-2">
                      {task.plannedStartDate
                        ? new Date(
                            task.plannedStartDate
                          ).toLocaleDateString()
                        : "Not set"}
                    </p>

                  </div>


                  <div className="bg-gray-50 rounded-xl p-3">

                    <div className="flex items-center gap-2 text-gray-400">
                      <CalendarDays size={15} />

                      <p className="text-xs">
                        Due Date
                      </p>
                    </div>

                    <p className="text-sm font-medium text-gray-700 mt-2">
                      {task.dueDate
                        ? new Date(
                            task.dueDate
                          ).toLocaleDateString()
                        : "Not set"}
                    </p>

                  </div>

                </div>


                {/* Hours */}
                <div className="grid grid-cols-2 gap-3 mt-3">

                  <div>
                    <p className="text-xs text-gray-400">
                      Estimated Hours
                    </p>

                    <p className="text-sm font-semibold text-gray-700 mt-1">
                      {task.estimatedHours || 0} hrs
                    </p>
                  </div>


                  <div>
                    <p className="text-xs text-gray-400">
                      Actual Hours
                    </p>

                    <p className="text-sm font-semibold text-gray-700 mt-1">
                      {task.actualHours || 0} hrs
                    </p>
                  </div>

                </div>


                {/* Staff */}
                <div className="mt-5">

                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <Users size={15} />
                    Assigned Staff
                  </div>

                  {task.assignedMembers &&
                  task.assignedMembers.length > 0 ? (

                    <div className="flex flex-wrap gap-2">

                      {task.assignedMembers.map(
                        (member) => (

                          <span
                            key={member._id}
                            className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1.5 rounded-lg"
                          >
                            {member.name}
                          </span>

                        )
                      )}

                    </div>

                  ) : (

                    <p className="text-sm text-gray-400">
                      No staff assigned
                    </p>

                  )}

                </div>


                {/* Progress notes */}
                <div className="mt-5 bg-gray-50 rounded-xl p-3">

                  <p className="text-xs text-gray-400">
                    Progress Notes
                  </p>

                  <p className="text-sm text-gray-600 mt-1">
                    {task.progressNotes ||
                      "No progress notes yet."}
                  </p>

                </div>


                {/* Actions */}
                <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100">

                  <button
                    onClick={() =>
                      setTaskToDelete(task)
                    }
                    className="inline-flex items-center gap-2 border border-red-200 text-red-600 px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>


                  <button
                    onClick={() =>
                      navigate(
                        `/admin/projects/${projectId}/tasks_edit/${task._id}`
                      )
                    }
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* Delete confirmation modal */}
      {taskToDelete && (

        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">

            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
              <AlertTriangle size={23} />
            </div>


            <h2 className="text-xl font-bold text-gray-900 mt-4">
              Delete Task?
            </h2>


            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700">
                {taskToDelete.title}
              </span>
              ? This action cannot be undone.
            </p>


            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() =>
                  setTaskToDelete(null)
                }
                disabled={deleting}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>


              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Trash2 size={16} />

                {deleting
                  ? "Deleting..."
                  : "Delete Task"}
              </button>

            </div>

          </div>

        </div>

      )}

    </DashboardLayout>
  );
}


export default Tasks;