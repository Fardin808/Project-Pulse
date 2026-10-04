import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getStaffTaskById, updateStaffTask } from "../services/taskApi";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  FileText,
  ListTodo,
  Save,
  Tag,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";

function StaffEditTask() {

  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);

  const [formData, setFormData] = useState({
    status: "backlog",
    actualHours: 0,
    progressNotes: "",
  });


  useEffect(() => {
    fetchTask();
  }, [taskId]);


  const fetchTask = async () => {

    try {

      const data = await getStaffTaskById(taskId);

      setTask(data);

      setFormData({
        status: data.status || "backlog",
        actualHours: data.actualHours || 0,
        progressNotes: data.progressNotes || "",
      });

    } catch (error) {

      console.log(error);

      toast.error(
        error.response?.data?.message || "Failed to load task"
      );

    }

  };


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await updateStaffTask(taskId, formData);

      toast.success("Task updated successfully");

      navigate(-1);

    } catch (error) {

      console.log(error);

      toast.error(
        error.response?.data?.message || "Failed to update task"
      );

    }

  };


  if (!task) {

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <p className="text-gray-600">
          Loading task...
        </p>
      </div>
    );

  }


  return (

  <DashboardLayout role="staff">

    {/* Back */}
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-5 transition"
    >
      <ArrowLeft size={17} />
      Back
    </button>


    {/* Header */}
    <div className="mb-8">

      <div className="flex items-center gap-3">

        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <ListTodo size={22} />
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Update Task
          </h1>

          <p className="text-gray-500 mt-1">
            Update your task progress and working hours.
          </p>
        </div>

      </div>

    </div>


    <div className="max-w-5xl">

      {/* Task Information */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-5">

        <div className="px-5 md:px-6 py-4 border-b border-gray-100">

          <div className="flex items-center gap-2">
            <FileText
              size={18}
              className="text-indigo-600"
            />

            <h2 className="font-semibold text-gray-900">
              Task Information
            </h2>
          </div>

        </div>


        <div className="p-5 md:p-6">

          <div>

            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Task Title
            </p>

            <p className="font-semibold text-gray-900 mt-2">
              {task.title}
            </p>

          </div>


          <div className="mt-5">

            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Description
            </p>

            <div className="bg-slate-50 rounded-xl p-4 mt-2">

              <p className="text-sm text-gray-600 leading-6">
                {task.description ||
                  "No description available."}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* Task Details */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-5">

        <div className="px-5 md:px-6 py-4 border-b border-gray-100">

          <h2 className="font-semibold text-gray-900">
            Task Details
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            These details are managed by the admin.
          </p>

        </div>


        <div className="p-5 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Priority */}
          <div className="bg-slate-50 rounded-xl p-4">

            <div className="flex items-center gap-2 text-gray-400">
              <Tag size={15} />

              <span className="text-xs">
                Priority
              </span>
            </div>


            <span
              className={`inline-flex mt-3 px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                task.priority === "critical"
                  ? "bg-red-100 text-red-700"
                  : task.priority === "high"
                  ? "bg-orange-100 text-orange-700"
                  : task.priority === "low"
                  ? "bg-gray-200 text-gray-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {task.priority}
            </span>

          </div>


          {/* Estimated Hours */}
          <div className="bg-slate-50 rounded-xl p-4">

            <div className="flex items-center gap-2 text-gray-400">
              <Clock3 size={15} />

              <span className="text-xs">
                Estimated Hours
              </span>
            </div>

            <p className="font-semibold text-gray-800 mt-3">
              {task.estimatedHours || 0} hrs
            </p>

          </div>


          {/* Planned Start */}
          <div className="bg-slate-50 rounded-xl p-4">

            <div className="flex items-center gap-2 text-gray-400">
              <CalendarDays size={15} />

              <span className="text-xs">
                Planned Start Date
              </span>
            </div>

            <p className="font-semibold text-gray-800 mt-3">
              {task.plannedStartDate
                ? task.plannedStartDate.split("T")[0]
                : "Not set"}
            </p>

          </div>


          {/* Due Date */}
          <div className="bg-slate-50 rounded-xl p-4">

            <div className="flex items-center gap-2 text-gray-400">
              <CalendarDays size={15} />

              <span className="text-xs">
                Due Date
              </span>
            </div>

            <p className="font-semibold text-gray-800 mt-3">
              {task.dueDate
                ? task.dueDate.split("T")[0]
                : "Not set"}
            </p>

          </div>

        </div>

      </div>


      {/* Editable Fields */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

        <div className="px-5 md:px-6 py-4 border-b border-gray-100">

          <h2 className="font-semibold text-gray-900">
            Update Progress
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            You can update your status, actual hours,
            and progress notes.
          </p>

        </div>


        <div className="p-5 md:p-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Status */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              >
                <option value="backlog">
                  Backlog
                </option>

                <option value="todo">
                  Todo
                </option>

                <option value="inprogress">
                  In Progress
                </option>

                <option value="review">
                  Review
                </option>

                <option value="testing">
                  Testing
                </option>

                <option value="completed">
                  Completed
                </option>
              </select>

            </div>


            {/* Actual Hours */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual Hours
              </label>

              <div className="relative">

                <Clock3
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="number"
                  name="actualHours"
                  min="0"
                  value={formData.actualHours}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                />

              </div>

            </div>

          </div>


          {/* Progress Notes */}
          <div className="mt-5">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Progress Notes
            </label>

            <textarea
              name="progressNotes"
              value={formData.progressNotes}
              onChange={handleChange}
              rows="5"
              placeholder="Write your progress update..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            />

            <p className="text-xs text-gray-400 mt-2">
              Briefly describe what you completed,
              what you are currently working on, or
              any problems you faced.
            </p>

          </div>


          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-7 pt-5 border-t border-gray-100">

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>


            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
            >
              <Save size={16} />
              Update Task
            </button>

          </div>

        </div>

      </div>

    </div>

  </DashboardLayout>
);

}

export default StaffEditTask;