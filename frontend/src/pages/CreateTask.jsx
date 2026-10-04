import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock,
  FileText,
  ListTodo,
  Save,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { createTask, getStaff } from "../services/taskApi";
import { getMyNotifications } from "../services/notificationApi";
import DashboardLayout from "../components/layout/DashboardLayout";


function CreateTask() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [staff, setStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "normal",
    status: "backlog",
    plannedStartDate: "",
    dueDate: "",
    estimatedHours: "",
    actualHours: 0,
    progressNotes: "",
    assignedMembers: [],
    projectId: projectId,
  });


  useEffect(() => {
    fetchStaff();
    fetchNotificationCount();
  }, []);


  // Load staff members
  const fetchStaff = async () => {
    try {
      const data = await getStaff();
      setStaff(data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load staff members"
      );
    } finally {
      setLoadingStaff(false);
    }
  };


  // Load unread notifications
  const fetchNotificationCount = async () => {
    try {
      const notifications =
        await getMyNotifications();

      const count = notifications.filter(
        (notification) => !notification.isRead
      ).length;

      setUnreadCount(count);
    } catch (error) {
      console.log(
        "Failed to load notifications:",
        error
      );
    }
  };


  // Update normal form fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };


  // Select or remove a staff member
  const toggleStaff = (staffId) => {
    setFormData((currentData) => {
      const isSelected =
        currentData.assignedMembers.includes(
          staffId
        );

      return {
        ...currentData,

        assignedMembers: isSelected
          ? currentData.assignedMembers.filter(
              (id) => id !== staffId
            )
          : [
              ...currentData.assignedMembers,
              staffId,
            ],
      };
    });
  };


  // Create task
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) {
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (
      formData.plannedStartDate &&
      formData.dueDate &&
      new Date(formData.dueDate) <
        new Date(formData.plannedStartDate)
    ) {
      toast.error(
        "Due date cannot be before the planned start date"
      );
      return;
    }

    try {
      setSubmitting(true);

      await createTask(formData);

      toast.success(
        "Task created successfully"
      );

      navigate(
        `/admin/projects/${projectId}/tasks`
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to create task"
      );
    } finally {
      setSubmitting(false);
    }
  };


  const inputStyle =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

  const labelStyle =
    "block text-sm font-medium text-gray-700 mb-2";


  return (
    <DashboardLayout
      role="admin"
      unreadCount={unreadCount}
    >
      {/* Back */}
      <button
        onClick={() =>
          navigate(
            `/admin/projects/${projectId}/tasks`
          )
        }
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-5"
      >
        <ArrowLeft size={17} />
        Back to Tasks
      </button>


      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Create Task
        </h1>

        <p className="text-gray-500 mt-1">
          Add a new task and assign it to
          staff members.
        </p>
      </div>


      <form
        onSubmit={handleSubmit}
        className="max-w-6xl space-y-6"
      >

        {/* Task information */}
        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm">

          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <FileText size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Task Information
              </h2>

              <p className="text-sm text-gray-400">
                Enter the basic task details.
              </p>
            </div>
          </div>


          <div className="p-6 space-y-5">

            <div>
              <label className={labelStyle}>
                Task Title{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                name="title"
                placeholder="Enter task title"
                value={formData.title}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>


            <div>
              <label className={labelStyle}>
                Description
              </label>

              <textarea
                name="description"
                placeholder="Describe the task..."
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className={`${inputStyle} resize-none`}
              />
            </div>

          </div>

        </section>


        {/* Assignment */}
        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm">

          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">

            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Users size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Staff Assignment
              </h2>

              <p className="text-sm text-gray-400">
                Choose one or more staff
                members for this task.
              </p>
            </div>

          </div>


          <div className="p-6">

            {loadingStaff ? (

              <p className="text-sm text-gray-500">
                Loading staff members...
              </p>

            ) : staff.length === 0 ? (

              <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center">
                <Users
                  size={24}
                  className="mx-auto text-gray-300"
                />

                <p className="text-sm text-gray-500 mt-3">
                  No staff members available.
                </p>
              </div>

            ) : (

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">

                {staff.map((person) => {
                  const selected =
                    formData.assignedMembers.includes(
                      person._id
                    );

                  return (
                    <button
                      key={person._id}
                      type="button"
                      onClick={() =>
                        toggleStaff(person._id)
                      }
                      className={`flex items-center gap-3 p-4 border rounded-xl text-left transition ${
                        selected
                          ? "border-indigo-400 bg-indigo-50"
                          : "border-gray-200 hover:border-indigo-200 hover:bg-gray-50"
                      }`}
                    >

                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold uppercase ${
                          selected
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {person.name
                          ?.charAt(0) || "S"}
                      </div>


                      <div className="flex-1 min-w-0">

                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {person.name}
                        </p>

                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {person.email}
                        </p>

                      </div>


                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          selected
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-gray-300"
                        }`}
                      >
                        {selected && (
                          <Check size={13} />
                        )}
                      </div>

                    </button>
                  );
                })}

              </div>

            )}


            <p className="text-xs text-gray-400 mt-4">
              {
                formData.assignedMembers
                  .length
              }{" "}
              staff member
              {formData.assignedMembers
                .length !== 1
                ? "s"
                : ""}{" "}
              selected
            </p>

          </div>

        </section>


        {/* Priority and status */}
        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm">

          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">

            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
              <ListTodo size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Priority & Status
              </h2>

              <p className="text-sm text-gray-400">
                Define the task's current
                state and importance.
              </p>
            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6">

            <div>
              <label className={labelStyle}>
                Priority
              </label>

              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={inputStyle}
              >
                <option value="low">
                  Low
                </option>

                <option value="normal">
                  Normal
                </option>

                <option value="high">
                  High
                </option>

                <option value="critical">
                  Critical
                </option>
              </select>
            </div>


            <div>
              <label className={labelStyle}>
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputStyle}
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

                <option value="blocked">
                  Blocked
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

          </div>

        </section>


        {/* Schedule */}
        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm">

          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">

            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <CalendarDays size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Schedule
              </h2>

              <p className="text-sm text-gray-400">
                Set the planned task timeline.
              </p>
            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6">

            <div>
              <label className={labelStyle}>
                Planned Start Date
              </label>

              <input
                type="date"
                name="plannedStartDate"
                value={
                  formData.plannedStartDate
                }
                onChange={handleChange}
                className={inputStyle}
              />
            </div>


            <div>
              <label className={labelStyle}>
                Due Date
              </label>

              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

          </div>

        </section>


        {/* Time tracking */}
        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm">

          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">

            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <Clock size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Time Tracking
              </h2>

              <p className="text-sm text-gray-400">
                Estimate and track task hours.
              </p>
            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6">

            <div>
              <label className={labelStyle}>
                Estimated Hours
              </label>

              <input
                type="number"
                min="0"
                name="estimatedHours"
                placeholder="Example: 20"
                value={
                  formData.estimatedHours
                }
                onChange={handleChange}
                className={inputStyle}
              />
            </div>


            <div>
              <label className={labelStyle}>
                Actual Hours
              </label>

              <input
                type="number"
                min="0"
                name="actualHours"
                value={formData.actualHours}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

          </div>

        </section>


        {/* Progress notes */}
        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm">

          <div className="px-6 py-5 border-b border-gray-100">

            <h2 className="font-semibold text-gray-900">
              Progress Notes
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Add any initial notes or
              instructions for the task.
            </p>

          </div>


          <div className="p-6">

            <textarea
              name="progressNotes"
              placeholder="Add progress notes or instructions..."
              value={formData.progressNotes}
              onChange={handleChange}
              rows="4"
              className={`${inputStyle} resize-none`}
            />

          </div>

        </section>


        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pb-8">

          <button
            type="button"
            onClick={() =>
              navigate(
                `/admin/projects/${projectId}/tasks`
              )
            }
            disabled={submitting}
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>


          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save size={17} />

            {submitting
              ? "Creating..."
              : "Create Task"}
          </button>

        </div>

      </form>

    </DashboardLayout>
  );
}


export default CreateTask;