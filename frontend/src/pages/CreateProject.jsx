import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  FolderPlus,
  Save,
  Activity,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { createProject } from "../services/projectApi";
import { getMyNotifications } from "../services/notificationApi";
import DashboardLayout from "../components/layout/DashboardLayout";


function CreateProject() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    target_completion_date: "",
    status: "pending",
  });

  const [submitting, setSubmitting] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);


  useEffect(() => {
    fetchNotificationCount();
  }, []);


  // Load unread notification count
  const fetchNotificationCount = async () => {
    try {
      const notifications = await getMyNotifications();

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


  // Update form fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };


  // Create project
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) {
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Project title is required");
      return;
    }

    if (
      formData.start_date &&
      formData.target_completion_date &&
      new Date(formData.target_completion_date) <
        new Date(formData.start_date)
    ) {
      toast.error(
        "Target completion date cannot be before the start date"
      );
      return;
    }

    try {
      setSubmitting(true);

      await createProject(formData);

      toast.success(
        "Project created successfully"
      );

      navigate("/admin/projects");

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Project creation failed"
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
        type="button"
        onClick={() =>
          navigate("/admin/projects")
        }
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-5 transition"
      >
        <ArrowLeft size={17} />
        Back to Projects
      </button>


      {/* Page header */}
      <div className="mb-8">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <FolderPlus size={23} />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Create Project
            </h1>

            <p className="text-gray-500 mt-1">
              Create a new project and define
              its timeline.
            </p>
          </div>

        </div>

      </div>


      <form
        onSubmit={handleSubmit}
        className="max-w-5xl space-y-6"
      >

        {/* Project information */}
        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm">

          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">

            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <FileText size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Project Information
              </h2>

              <p className="text-sm text-gray-400">
                Enter the basic details of the
                project.
              </p>
            </div>

          </div>


          <div className="p-6 space-y-5">

            <div>
              <label className={labelStyle}>
                Project Title{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                type="text"
                name="title"
                placeholder="Enter project title"
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
                placeholder="Describe the project..."
                value={formData.description}
                onChange={handleChange}
                rows="5"
                className={`${inputStyle} resize-none`}
              />
            </div>

          </div>

        </section>


        {/* Timeline */}
        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm">

          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">

            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <CalendarDays size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Project Timeline
              </h2>

              <p className="text-sm text-gray-400">
                Set the planned project start
                and completion dates.
              </p>
            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6">

            <div>
              <label className={labelStyle}>
                Start Date
              </label>

              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>


            <div>
              <label className={labelStyle}>
                Target Completion Date
              </label>

              <input
                type="date"
                name="target_completion_date"
                value={
                  formData.target_completion_date
                }
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

          </div>

        </section>


        {/* Status */}
        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm">

          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">

            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
              <Activity size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Project Status
              </h2>

              <p className="text-sm text-gray-400">
                Select the project's initial
                status.
              </p>
            </div>

          </div>


          <div className="p-6">

            <div className="max-w-md">

              <label className={labelStyle}>
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputStyle}
              >
                <option value="pending">
                  Pending
                </option>

                <option value="ongoing">
                  Ongoing
                </option>

                <option value="completed">
                  Completed
                </option>
              </select>

            </div>

          </div>

        </section>


        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pb-8">

          <button
            type="button"
            onClick={() =>
              navigate("/admin/projects")
            }
            disabled={submitting}
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
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
              : "Create Project"}
          </button>

        </div>

      </form>

    </DashboardLayout>
  );
}


export default CreateProject;