import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTasks } from "../services/taskApi";
import { createTaskRequest } from "../services/taskRequestApi";
import { toast } from "react-hot-toast";

import {
  ArrowLeft,
  ClipboardList,
  FileText,
  Send,
  ListTodo,
  Info,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";


function StaffTaskRequest() {

  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);

  const [formData, setFormData] = useState({
    task: "",
    reason: "",
  });


  useEffect(() => {
    fetchTasks();
  }, []);


  const fetchTasks = async () => {

    try {

      const data = await getMyTasks();

      setTasks(data);

    } catch (error) {

      console.log(error);

      toast.error(
        error.response?.data?.message ||
        "Failed to load your tasks"
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


    if (!formData.task) {

      toast.error("Please select a task");

      return;

    }


    if (!formData.reason.trim()) {

      toast.error("Please provide a reason");

      return;

    }


    try {

      await createTaskRequest(formData);

      toast.success(
        "Task change request submitted successfully"
      );

      setFormData({
        task: "",
        reason: "",
      });

    } catch (error) {

      console.log(error);

      toast.error(
        error.response?.data?.message ||
        "Failed to submit request"
      );

    }

  };


  return (
  <DashboardLayout role="staff">

    {/* Back */}
    <button
      type="button"
      onClick={() => navigate("/staff/dashboard")}
      className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-5 transition"
    >
      <ArrowLeft size={17} />
      Back to Dashboard
    </button>


    <div className="max-w-3xl">

      {/* Header */}
      <div className="mb-8">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <ClipboardList size={22} />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Request Task Change
            </h1>

            <p className="text-gray-500 mt-1">
              Submit a request to the admin regarding one
              of your assigned tasks.
            </p>
          </div>

        </div>

      </div>


      {/* Information */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">

        <div className="flex items-start gap-3">

          <Info
            size={18}
            className="text-blue-600 mt-0.5 shrink-0"
          />

          <div>
            <p className="text-sm font-medium text-blue-800">
              Before submitting a request
            </p>

            <p className="text-sm text-blue-700/80 mt-1 leading-6">
              Select the assigned task you need help with
              and clearly explain why you are requesting
              the change. The admin will review your
              request.
            </p>
          </div>

        </div>

      </div>


      {/* Form Card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

        <div className="px-5 md:px-6 py-4 border-b border-gray-100">

          <div className="flex items-center gap-2">

            <FileText
              size={18}
              className="text-indigo-600"
            />

            <h2 className="font-semibold text-gray-900">
              Request Details
            </h2>

          </div>

          <p className="text-sm text-gray-400 mt-1">
            Provide the task and reason for your request.
          </p>

        </div>


        <form
          onSubmit={handleSubmit}
          className="p-5 md:p-6"
        >

          {/* Task Selection */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Task
            </label>


            <div className="relative">

              <ListTodo
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />

              <select
                name="task"
                value={formData.task}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-700 bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              >
                <option value="">
                  Select an assigned task
                </option>

                {tasks.map((task) => (

                  <option
                    key={task._id}
                    value={task._id}
                  >
                    {task.title}
                  </option>

                ))}
              </select>

            </div>


            {tasks.length === 0 && (

              <p className="text-xs text-amber-600 mt-2">
                You currently have no assigned tasks
                available for a request.
              </p>

            )}

          </div>


          {/* Reason */}
          <div className="mt-5">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason
            </label>

            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="6"
              placeholder="Explain why you are requesting a change to this task..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            />

            <p className="text-xs text-gray-400 mt-2">
              Give the admin enough information to
              understand your situation.
            </p>

          </div>


          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-7 pt-5 border-t border-gray-100">

            <button
              type="button"
              onClick={() => navigate("/staff/dashboard")}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={tasks.length === 0}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              <Send size={16} />
              Submit Request
            </button>

          </div>

        </form>

      </div>


      {/* My Requests Shortcut */}
      <div className="mt-5 bg-white border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>

          <p className="font-medium text-gray-800">
            Already submitted a request?
          </p>

          <p className="text-sm text-gray-400 mt-1">
            Check its current status and the admin response.
          </p>

        </div>


        <button
          type="button"
          onClick={() => navigate("/staff/my-requests")}
          className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition"
        >
          <ClipboardList size={16} />
          My Requests
        </button>

      </div>

    </div>

  </DashboardLayout>
);

}

export default StaffTaskRequest;